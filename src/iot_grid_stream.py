import json
import time
import random
import uuid
from datetime import datetime
from kafka import KafkaProducer

REDPANDA_BROKERS = ['localhost:9092']
TOPIC_NAME = 'social_media_posts'

try:
    producer = KafkaProducer(
        bootstrap_servers=REDPANDA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print(f"Connected to Redpanda! Publishing payments to: {TOPIC_NAME}")
except Exception as e:
    print(f"Redpanda connection error: {e}")
    producer = None

CITIES = [
    "Istanbul", "Ankara", "Izmir", "Antalya", "Adana", "Bursa", "Trabzon", "Diyarbakir",
    "London", "New York", "Nicosia", "Panama City", "Grand Cayman"
]

PAYMENT_METHODS = ["Credit Card", "FAST Wire", "EFT", "Mobile QR"]
DEVICES = ["AndroidApp", "iOSApp", "POS_Terminal", "WebBrowser", "Bot_Script_v3"]

NORMAL_MERCHANTS = ["Amazon_TR", "Hepsiburada", "Trendyol", "Migros_Virtual", "Netflix", "Shell_Tr"]
RISKY_MERCHANTS = ["Offshore_Betting", "Crypto_Exchange_Shell", "Luxury_Watch_Dealer"]

ACCOUNT_IDS = [f"ACC-{str(uuid.uuid4())[:8].upper()}" for _ in range(150)]

print("Gerçek Zamanlı Banka Ödeme İşlemleri Simülatörü Başlatıldı...")

def generate_payment():
    account_id = random.choice(ACCOUNT_IDS)
    is_fraud_attempt = random.random() < 0.07  # %7 fraud / anomali ihtimali

    method = random.choice(PAYMENT_METHODS)
    device = random.choice(DEVICES)
    
    if is_fraud_attempt:
        # Şüpheli işlem senaryoları
        fraud_type = random.choice(["VELOCITY", "AMOUNT", "LOCATION"])
        if fraud_type == "VELOCITY":
            amount = round(random.uniform(500.0, 5000.0), 2)
            city = random.choice(["Istanbul", "Ankara", "Izmir"])
            post_velocity = round(random.uniform(80.0, 180.0), 2)  # Çok yüksek sıklıkta işlem
            merchant = random.choice(NORMAL_MERCHANTS)
            device = "Bot_Script_v3"
            reason = "SUSPICIOUS_VELOCITY"
        elif fraud_type == "AMOUNT":
            amount = round(random.uniform(45000.0, 120000.0), 2)  # Limit üstü devasa harcama
            city = random.choice(CITIES)
            post_velocity = round(random.uniform(0.1, 5.0), 2)
            merchant = random.choice(RISKY_MERCHANTS)
            reason = "CRITICAL_AMOUNT"
        else:
            amount = round(random.uniform(2000.0, 15000.0), 2)
            city = random.choice(["Nicosia", "Panama City", "Grand Cayman"])  # Şüpheli off-shore bölge
            post_velocity = round(random.uniform(1.0, 10.0), 2)
            merchant = random.choice(RISKY_MERCHANTS)
            reason = "OFFSHORE_IP"
            
        post_text = f"Telemetry: Tutar = {amount} TRY, Kanal = {method}, Merchant = {merchant}, Hız = {post_velocity} tx/s, Risk = 98%"
    else:
        # Normal işlem
        amount = round(random.uniform(10.0, 3500.0), 2)
        city = random.choice(["Istanbul", "Ankara", "Izmir", "Antalya", "Adana", "Bursa"])
        post_velocity = round(random.uniform(0.01, 1.5), 2)
        merchant = random.choice(NORMAL_MERCHANTS)
        reason = "NORMAL"
        
        post_text = f"Telemetry: Tutar = {amount} TRY, Kanal = {method}, Merchant = {merchant}, Hız = {post_velocity} tx/s, Risk = 2%"

    payment = {
        "post_id": str(uuid.uuid4()),
        "account_id": account_id,
        "hashtag": method,
        "post_text": post_text,
        "post_velocity": post_velocity,
        "city": city,
        "device": device,
        "temp": amount,  # Tutar alanını uyumluluk için temp alanında da taşıyalım
        "anomaly_reason": reason,
        "timestamp": datetime.utcnow().isoformat()
    }
    return payment

try:
    while True:
        # Rastgele 1-3 işlem üret
        for _ in range(random.randint(1, 3)):
            payment = generate_payment()
            if producer:
                producer.send(TOPIC_NAME, value=payment)
            print(f"[{payment['city']}] {payment['account_id']} ({payment['hashtag']}) -> Tutar: {payment['temp']} TRY | Cihaz: {payment['device']} | Durum: {payment['anomaly_reason']}")
        
        if producer:
            producer.flush()
        time.sleep(1.5)
except KeyboardInterrupt:
    print("\nSimülasyon durduruldu.")
finally:
    if producer:
        producer.close()
