import pika
import sys
import json
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import uvicorn

load_dotenv(dotenv_path="backend/.env")

latest_data = {}


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


@app.get("/api/latest")
def get_latest_data():
    return latest_data


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
