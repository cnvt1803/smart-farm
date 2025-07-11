#!/usr/bin/env python3
import pika
import sys

# 1. Connection parameters
credentials = pika.PlainCredentials('smartfarm', '9IAV441Wosw4dW')
parameters = pika.ConnectionParameters(
    host='rabbitmq.hpcc.vn',
    port=5672,
    virtual_host='/',
    credentials=credentials
)

def main():
    # 2. Establish connection & channel
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # 3. Declare (ensure) the exchange as fanout, matching the broker’s existing exchange
    channel.exchange_declare(
        exchange='smart_farm_data',
        exchange_type='fanout',
        durable=True
    )

    # 4. Create a fresh, exclusive, auto-deleted queue
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue

    # 5. Bind our queue to the fanout exchange (no routing key needed)
    channel.queue_bind(exchange='smart_farm_data', queue=queue_name)

    print(f'[*] Waiting for messages on fanout exchange "smart_farm_data". To exit press CTRL+C')

    # 6. Callback for incoming messages
    def on_message(ch, method, properties, body):
        print(f"[x] Received: {body.decode('utf-8', errors='replace')}")

    # 7. Start consuming
    channel.basic_consume(
        queue=queue_name,
        on_message_callback=on_message,
        auto_ack=True
    )

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("\nInterrupted by user, shutting down…")
        channel.stop_consuming()
        connection.close()
        sys.exit(0)

if __name__ == '__main__':
    main()
