from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi import Request
from supabase import create_client, Client
import unicodedata
import httpx
import paho.mqtt.publish as publish
import pika
import jwt
import json
import threading
import os
import uvicorn
import requests
import re


load_dotenv(dotenv_path="./.env")

latest_data = {}
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class PumpCommand(BaseModel):
    command: str = "PUMP_ON"
    duration: int = 5000  # millisecond


def mq_consumer():
    print("📡 RabbitMQ consumer starting...")

    try:
        credentials = pika.PlainCredentials(
            os.getenv("FARM_USER"),
            os.getenv("FARM_PASS")
        )

        parameters = pika.ConnectionParameters(
            host=os.getenv("FARM_HOST"),
            port=int(os.getenv("FARM_PORT")),
            virtual_host=os.getenv("FARM_VHOST"),
            credentials=credentials
        )

        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.exchange_declare(
            exchange='smart_farm_data',
            exchange_type='fanout',
            durable=True
        )

        result = channel.queue_declare(queue='', exclusive=True)
        queue_name = result.method.queue

        channel.queue_bind(exchange='smart_farm_data', queue=queue_name)

        print(f'✅ Listening on exchange "smart_farm_data"...')

        def on_message(ch, method, properties, body):
            global latest_data
            decoded = body.decode('utf-8', errors='replace')
            print(f"[x] Received: {decoded}")
            try:
                latest_data = json.loads(decoded)
            except Exception as e:
                print(f"[!] JSON decode error: {e}")

        channel.basic_consume(
            queue=queue_name,
            on_message_callback=on_message,
            auto_ack=True
        )

        channel.start_consuming()

    except Exception as e:
        print(f"❌ Failed to connect to RabbitMQ: {e}")

# ✅ Tự động chạy consumer khi app khởi động


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 FastAPI is starting up...")
    threading.Thread(target=mq_consumer, daemon=True).start()
    yield
    print("🛑 FastAPI is shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/pump-on")
def pump_on(payload: PumpCommand):
    if payload.command != "PUMP_ON":
        raise HTTPException(status_code=400, detail="Invalid command")

    now = datetime.utcnow()
    end_time = now + timedelta(milliseconds=payload.duration)

    mqtt_message = {
        "command": payload.command,
        "duration": payload.duration
    }

    try:
        publish.single(
            topic=os.getenv("MQTT_TOPIC"),
            payload=json.dumps(mqtt_message),
            hostname=os.getenv("MQTT_HOST"),
            port=int(os.getenv("MQTT_PORT")),
            auth={
                "username": os.getenv("MQTT_USER"),
                "password": os.getenv("MQTT_PASS")
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"MQTT publish failed: {e}")

    return {
        "status": "success",
        "sent_command": mqtt_message,
        "start": now.isoformat(),
        "end": end_time.isoformat()
    }


@app.get("/api/latest")
def get_latest_data():
    return latest_data


@app.post("/api/login")
async def login(request: Request):
    body = await request.json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return JSONResponse({"error": "Thiếu email hoặc mật khẩu"}, status_code=400)

    if not SUPABASE_URL or not SUPABASE_KEY:
        return JSONResponse({"error": "Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong biến môi trường"}, status_code=500)

    try:
        url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "password": password
        }

        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            return JSONResponse({"error": response.json()}, status_code=401)

        data = response.json()
        access_token = data["access_token"]
        user_id = data["user"]["id"]

        return JSONResponse({
            "message": "✅ Đăng nhập thành công",
            "access_token": access_token,
            "user_id": user_id
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/forgot-password")
async def forgot_password(request: Request):
    body = await request.json()
    email = body.get("email")

    if not email:
        return JSONResponse({"error": "Vui lòng nhập email"}, status_code=400)

    try:
        url = f"{SUPABASE_URL}/auth/v1/recover"
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "redirectTo": "https://recover-password-de6c8.web.app/public/index.html"
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            return JSONResponse({"message": "📩 Email khôi phục mật khẩu đã được gửi."})
        else:
            # Trả về lỗi chi tiết từ Supabase
            return JSONResponse({"error": response.json()}, status_code=response.status_code)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/api/check-auth")
async def check_auth(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
    }

    res = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"message": "Token is valid"}


def remove_accents(input_str: str) -> str:
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    no_accent = ''.join([c for c in nfkd_form if not unicodedata.combining(c)])
    return re.sub(r'\s+', ' ', no_accent).strip()


@app.get("/api/weather")
async def get_weather(city: str = Query(..., example="Hanoi")):
    url = "http://api.weatherapi.com/v1/current.json"
    params = {
        "key": WEATHER_API_KEY,
        "q": city,
        "aqi": "no"
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

            city_name = data["location"]["name"]
            city_slug = remove_accents(city_name).lower().replace(" ", "-")

            return {
                "city": city_name,
                "city_slug": city_slug,
                "country": data["location"]["country"],
                "localtime": data["location"]["localtime"],
                "temp_c": data["current"]["temp_c"],
                "condition": data["current"]["condition"]["text"],
                "icon": data["current"]["condition"]["icon"],
                "humidity": data["current"]["humidity"],
                "wind_kph": data["current"]["wind_kph"]
            }

    except httpx.HTTPError as e:
        return JSONResponse({"error": str(e)}, status_code=500)


def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        print("✅ Token payload:", payload)
        return payload.get("sub")
    except Exception as e:
        print("❌ Token decode error:", e)
        return None


@app.get("/api/me")
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Thiếu token"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Token không hợp lệ"}, status_code=403)

    try:
        # Chỉ query user_profiles thôi, không cần đụng auth.users
        result = supabase.table("user_profiles") \
            .select("*") \
            .eq("user_id", user_id) \
            .limit(1) \
            .execute()

        if not result.data:
            return JSONResponse({"error": "Chưa có thông tin user"}, status_code=404)
        return JSONResponse(result.data[0])

    except Exception as e:
        print("❌ Lỗi lấy user:", e)
        return JSONResponse({"error": "Lỗi server"}, status_code=500)


@app.patch("/api/update-profile")
async def update_profile(request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Thiếu token"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Token không hợp lệ"}, status_code=403)

    try:
        body = await request.json()
        update_data = {}

        for field in ["full_name", "address", "province", "phone_number"]:
            if field in body and body[field] != "":
                update_data[field] = body[field]

        if not update_data:
            return JSONResponse({"error": "Không có dữ liệu để cập nhật"}, status_code=400)

        result = supabase.table("user_profiles") \
            .update(update_data) \
            .eq("user_id", user_id) \
            .execute()

        return JSONResponse({"message": "Cập nhật thành công", "data": result.data})

    except Exception as e:
        print("❌ Lỗi cập nhật profile:", e)
        return JSONResponse({"error": "Lỗi server"}, status_code=500)


@app.post("/api/create-profile")
async def create_profile(request: Request):
    try:
        body = await request.json()
        insert_data = {
            "user_id": body["user_id"],
            "full_name": body["full_name"],
            "email": body["email"],
            "address": body.get("address", ""),
            "province": body.get("province", ""),
            "phone_number": body.get("phone_number", ""),
            "role": "user"
        }

        result = supabase.table("user_profiles").insert(insert_data).execute()

        return JSONResponse({"message": "User profile created successfully."})

    except Exception as e:
        print("❌ Error creating profile:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
