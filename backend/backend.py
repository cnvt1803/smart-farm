from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi import Request
import paho.mqtt.publish as publish
import pika
import sys
import json
import threading
import os
import uvicorn
import requests

load_dotenv(dotenv_path="./.env")

latest_data = {}
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


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


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
