from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
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


@app.get("/")
def root():
    return {"message": "✅ Server is running!"}


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
        return JSONResponse({"error": "Missing email or password"}, status_code=400)

    if not SUPABASE_URL or not SUPABASE_KEY:
        return JSONResponse({"error": "unknown error"}, status_code=500)

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
            "message": "✅ Log in successfully",
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
        return JSONResponse({"error": "Please enter email"}, status_code=400)

    try:
        url = f"{SUPABASE_URL}/auth/v1/recover"
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            # "redirectTo": "https://recover-password-de6c8.web.app/public/index.html"
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            return JSONResponse({"message": "📩 Password recovery email has been sent."})
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


def normalize_city(city: str) -> str:
    city = remove_accents(city)
    city = re.sub(r"\s+", " ", city).strip()
    return city.title()  # e.g., "ha noi" → "Ha Noi"


@app.get("/api/weather")
async def get_weather(city: str = Query(..., example="Hà Nội")):
    city = normalize_city(city)

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

        if "error" in data:
            return JSONResponse(status_code=404, content={"error": data["error"]["message"]})

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
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/weather/forecast")
async def get_weather_forecast(city: str = Query(..., example="Hà Nội")):
    city = normalize_city(city)

    url = "http://api.weatherapi.com/v1/forecast.json"
    params = {
        "key": WEATHER_API_KEY,
        "q": city,
        "days": 4,
        "aqi": "no"
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if "error" in data:
            return JSONResponse(status_code=404, content={"error": data["error"]["message"]})

        forecast = [
            {
                "date": item["date"],
                "avg_temp_c": item["day"]["avgtemp_c"],
                "condition": item["day"]["condition"]["text"],
                "icon": item["day"]["condition"]["icon"]
            }
            for item in data["forecast"]["forecastday"]
        ]

        return {
            "city": data["location"]["name"],
            "city_slug": remove_accents(data["location"]["name"]).lower().replace(" ", "-"),
            "country": data["location"]["country"],
            "forecast": forecast
        }

    except httpx.HTTPError as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


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
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        # Chỉ query user_profiles thôi, không cần đụng auth.users
        result = supabase.table("user_profiles") \
            .select("*") \
            .eq("user_id", user_id) \
            .limit(1) \
            .execute()

        if not result.data:
            return JSONResponse({"error": "No user information yet"}, status_code=404)
        return JSONResponse(result.data[0])

    except Exception as e:
        print("❌ Lỗi lấy user:", e)
        return JSONResponse({"error": "Server error"}, status_code=500)


@app.patch("/api/update-profile")
async def update_profile(request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        body = await request.json()
        update_data = {}

        for field in ["full_name", "address", "province", "phone_number"]:
            if field in body and body[field] != "":
                update_data[field] = body[field]

        if not update_data:
            return JSONResponse({"error": "No data to update"}, status_code=400)

        result = supabase.table("user_profiles") \
            .update(update_data) \
            .eq("user_id", user_id) \
            .execute()

        return JSONResponse({"message": "Updated successfully", "data": result.data})

    except Exception as e:
        print("❌ Lỗi cập nhật profile:", e)
        return JSONResponse({"error": "Error server"}, status_code=500)


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

#api for dashboard
@app.get("/api/dashboard")
def get_dashboard_data(authorization: str = Header(None)):
    #Get all data from table "farm" and "sensor"
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        # Fetch data from the necessary tables
        farms = supabase.table("farm").select("*", count="exact").execute()
        sensors = supabase.table("sensor").select("*", count="exact").execute()
        users = supabase.table("user_profiles").select("*", count="exact").execute()

        return JSONResponse({
            "farms": farms.data,
            "sensors": sensors.data,
            "users": users.data
        })

    except Exception as e:
        print("❌ Error fetching dashboard data:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.post("/api/farm")
async def create_farm(request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        body = await request.json()
        
        insert_data = {
            "farm_name": body["farm_name"],
            "location": body["location"],
            "user_own": user_id,
        }

        result = supabase.table("farm").insert(insert_data).execute()

        return JSONResponse({"message": "Farm created successfully.", "data": result.data})

    except Exception as e:
        print("❌ Error creating farm:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)
    
@app.post("/api/sensor")
async def create_sensor(request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    try:
        body = await request.json()

        # Check required fields
        if not body.get("sensor_name") or not body.get("sensor_type") or not body.get("link"):
            return JSONResponse({"error": "Sensor name, sensor type, and link are required"}, status_code=400)

        current_time = datetime.now(timezone.utc).isoformat()

        # Handle farm_id directly if provided, otherwise use farm_name
        farm_id = body.get("farm_id")
        if not farm_id and body.get("farm_name"):
            farm_result = supabase.table("farm") \
                .select("farm_id") \
                .eq("farm_name", body.get("farm_name")) \
                .limit(1) \
                .execute()
            
            if farm_result.data:
                farm_id = farm_result.data[0]['farm_id']
            else:
                return JSONResponse({"error": "Farm not found"}, status_code=404)

        insert_data = {
            "sensor_name": body["sensor_name"],
            "sensor_type": body["sensor_type"],
            "farm_id": farm_id,
            "location": body.get("location", ""),
            "connectivity": body.get("connectivity", "offline"),
            "status": body.get("status", "normal"),
            "latest_updated": current_time,
            "logs": "Sensor created successfully.",
            "link": body.get("link", ""),
        }

        result = supabase.table("sensor").insert(insert_data).execute()

        return JSONResponse({"message": "Sensor created successfully.", "data": result.data})

    except Exception as e:
        print("❌ Error creating sensor:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.get("/api/sensor/{sensor_id}")
async def get_sensor(sensor_id: str, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        sensor = supabase.table("sensor").select("*").eq("sensor_id", sensor_id).execute()
        if not sensor.data:
            return JSONResponse({"error": "Sensor not found"}, status_code=404)

        return JSONResponse({"sensor": sensor.data[0]})

    except Exception as e:
        print("❌ Error fetching sensor:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.get("/api/farm/{farm_id}")
async def get_farm(farm_id: str, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        farm = supabase.table("farm").select("*").eq("farm_id", farm_id).execute()
        if not farm.data:
            return JSONResponse({"error": "Farm not found"}, status_code=404)

        return JSONResponse({"farm": farm.data[0]})

    except Exception as e:
        print("❌ Error fetching farm:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)


@app.patch("/api/farm/{farm_id}")
async def update_farm(farm_id: str, request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        body = await request.json()
        update_data = {k: v for k, v in body.items() if k in ["name", "location"]}

        if not update_data:
            return JSONResponse({"error": "No valid fields provided"}, status_code=400)

        result = supabase.table("farm").update(update_data).eq("farm_id", farm_id).execute()
        if not result.data:
            return JSONResponse({"error": "Farm not found"}, status_code=404)

        return JSONResponse({"message": "Farm updated successfully.", "data": result.data})

    except Exception as e:
        print("❌ Error updating farm:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

#Thay đổi thông tin cảm biến
@app.patch("/api/sensor/{sensor_id}")
async def update_sensor_info(sensor_id: str, request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        current_time = datetime.now(timezone.utc).isoformat()

        body = await request.json()
        
        # Build update data with all possible fields
        update_info = {}
        
        if body.get("sensor_name"):
            update_info["sensor_name"] = body.get("sensor_name")
        if body.get("sensor_type"):
            update_info["sensor_type"] = body.get("sensor_type")
        if body.get("location"):
            update_info["location"] = body.get("location")
        if body.get("link"):
            update_info["link"] = body.get("link")
            
        # Always update timestamp and logs
        update_info["latest_updated"] = current_time
        update_info["logs"] = "Sensor info updated successfully."

        if not any(body.get(field) for field in ["sensor_name", "sensor_type", "location", "link"]):
            return JSONResponse({"error": "No valid fields provided"}, status_code=400)

        result = supabase.table("sensor").update(update_info).eq("sensor_id", sensor_id).execute()
        if not result.data:
            return JSONResponse({"error": "Sensor not found"}, status_code=404)

        return JSONResponse({"message": "Sensor info updated successfully.", "data": result.data})

    except Exception as e:
        print("❌ Error updating sensor:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

#Thay đổi dữ liệu của cảm biến
@app.patch("/api/sensor/update-data/{sensor_id}")
async def update_sensor_data(sensor_id: str, request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        current_time = datetime.now(timezone.utc).isoformat()

        body = await request.json()

        if not body.get("connectivity") and not body.get("status"):
            return JSONResponse({"error": "No valid fields provided"}, status_code=400)
        
        update_data = {
            "connectivity": body.get("connectivity"),
            "status": body.get("status"),
            "latest_updated": current_time,
            "logs": "Sensor data updated successfully."
        }

        result = supabase.table("sensor").update(update_data).eq("sensor_id", sensor_id).execute()
        if not result.data:
            return JSONResponse({"error": "Sensor not found"}, status_code=404)

        return JSONResponse({"message": "Sensor data updated successfully.", "data": result.data})

    except Exception as e:
        print("❌ Error updating sensor:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.get("/api/info")
async def get_info(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        farms = supabase.table("farm").select("*").eq("user_own", user_id).execute()
        if not farms.data:
            return JSONResponse({"farm": [], "sensors": []})

        sensors = []

        for farm in farms.data:
            sensor = supabase.table("sensor") \
                .select("*").eq("farm_id", farm['farm_id']).execute()
            if sensor.data:
                sensors.extend(sensor.data)

        return JSONResponse({"farms": farms.data, "sensors": sensors})

    except Exception as e:
        print("❌ Error fetching info:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.delete("/api/farm/{farm_id}")
async def delete_farm(farm_id: str, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        result = supabase.table("farm").delete().eq("farm_id", farm_id).execute()
        if not result.data:
            return JSONResponse({"error": "Farm not found"}, status_code=404)

        return JSONResponse({"message": "Farm deleted successfully."})

    except Exception as e:
        print("❌ Error deleting farm:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.delete("/api/sensor/{sensor_id}")
async def delete_sensor(sensor_id: str, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        result = supabase.table("sensor").delete().eq("sensor_id", sensor_id).execute()
        if not result.data:
            return JSONResponse({"error": "Sensor not found"}, status_code=404)

        return JSONResponse({"message": "Sensor deleted successfully."})

    except Exception as e:
        print("❌ Error deleting sensor:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

@app.get("/api/analytics/{farm_id}")
async def get_farm_analytics(farm_id: str, period: str = Query("7d", regex="^(7d|30d|90d)$"), authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse({"error": "Missing tokens"}, status_code=401)

    token = authorization.replace("Bearer ", "").strip()
    user_id = decode_token(token)

    if not user_id:
        return JSONResponse({"error": "Invalid token"}, status_code=403)

    try:
        # Get sensors for the farm
        sensors = supabase.table("sensor").select("*").eq("farm_id", farm_id).execute()
        
        if not sensors.data:
            return JSONResponse({"analytics": []})

        # Calculate current status counts
        current_error_count = sum(1 for s in sensors.data if s.get('status') == 'error')
        current_normal_count = sum(1 for s in sensors.data if s.get('status') == 'normal')
        current_warning_count = sum(1 for s in sensors.data if s.get('status') == 'warning')
        
        # Generate historical data with realistic variations
        days = 7 if period == "7d" else 30 if period == "30d" else 90
        analytics_data = []
        
        now = datetime.now()
        for i in range(days - 1, -1, -1):
            date = now - timedelta(days=i)
            
            # Add realistic variation (±20%)
            import random
            variation = random.uniform(0.8, 1.2)
            
            error_count = max(0, int(current_error_count * variation))
            warning_count = max(0, int(current_warning_count * variation))
            normal_count = max(1, len(sensors.data) - error_count - warning_count)
            
            analytics_data.append({
                "date": date.strftime("%b %d"),
                "fullDate": date.strftime("%Y-%m-%d"),
                "error": error_count + warning_count,  # Combine errors and warnings
                "normal": normal_count,
                "total": len(sensors.data)
            })
        
        return JSONResponse({
            "analytics": analytics_data,
            "summary": {
                "total_sensors": len(sensors.data),
                "normal_sensors": current_normal_count,
                "error_sensors": current_error_count,
                "warning_sensors": current_warning_count
            }
        })

    except Exception as e:
        print("❌ Error fetching analytics:", e)
        return JSONResponse({"error": "Server error."}, status_code=500)

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)