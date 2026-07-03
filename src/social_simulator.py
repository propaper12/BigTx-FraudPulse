import json
import time
import random
import uuid
from datetime import datetime
from kafka import KafkaProducer

# Redpanda (Kafka) Baglantisi
REDPANDA_BROKERS = ['localhost:9092']
TOPIC_NAME = 'social_media_posts'

try:
    producer = KafkaProducer(
        bootstrap_servers=REDPANDA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print(f"Redpanda'ya baglanildi! Topic: {TOPIC_NAME}")
except Exception as e:
    print(f"Redpanda baglanti hatasi: {e}")
    exit(1)

# Sosyal Medya Verisi Icin Ayarlar
CITIES = [
    "Istanbul", "Ankara", "Izmir", "Antalya", "London", "Tokyo", "New York", 
    "Moscow", "Lagos", "Paris", "Berlin", "Beijing", "Sydney", "Rio de Janeiro", 
    "Cape Town", "Dubai", "Mumbai", "Los Angeles", "Toronto", "Seoul", 
    "Singapore", "Mexico City", "Cairo", "Buenos Aires", "Jakarta"
]

NORMAL_TEXTS = [
    "Just had a great coffee!",
    "Loving the new tech updates this year.",
    "Can't wait for the weekend!",
    "Learning Python and Kafka today, feeling productive.",
    "The weather in the city is beautiful today.",
    "Does anyone have good movie recommendations?",
    "Just finished a great workout!",
    "Thinking about traveling to Japan next year.",
    "This new song is stuck in my head all day.",
    "Happy Friday everyone!"
]

TOXIC_TEXTS = [
    "This election is completely RIGGED! Do not trust the media! Wake up!",
    "Send 1 BTC to this address and I will double it instantly! Limited time offer!",
    "The deep state is controlling everything. They are lying to you! #FakeNews",
    "Crash imminent! Sell all your crypto right now before it goes to zero!",
    "Secret documents reveal the truth about the pandemic. Share this before it gets deleted!",
    "Free iPhone 15 Pro Max! Click the link in my bio to claim yours now!",
    "You are all brainwashed sheep. The truth is hidden in plain sight.",
    "Massive scandal hidden by the government! Read the full leaked report here."
]

HASHTAGS_NORMAL = ["#TechTrends", "#DailyLife", "#HappyFriday", "#Coding", "#Travel"]
HASHTAGS_TOXIC = ["#CryptoScam", "#Election2026", "#FakeNews", "#WakeUp", "#Giveaway"]

DEVICES = ["iPhone_13", "Samsung_S22", "MacBook_Pro", "Windows_PC", "Bot_Script_v2"]

ACCOUNT_IDS = [f"USER-{str(uuid.uuid4())[:8].upper()}" for _ in range(200)]

print("Gercek Zamanli (Real-Time) Sosyal Medya Verileri (Metinleriyle Birlikte) Uretiliyor...")

def generate_post():
    account_id = random.choice(ACCOUNT_IDS)
    
    # %8 ihtimalle bot / dezenformasyon
    is_bot_attempt = random.random() < 0.08
    
    post_velocity = round(random.uniform(50.0, 200.0) if is_bot_attempt else random.uniform(0.1, 5.0), 2)
    city = random.choice(["Moscow", "Lagos", "Tokyo", "London", "Beijing", "Dubai", "Mumbai"]) if is_bot_attempt else random.choice(CITIES)
    
    hashtag = random.choice(HASHTAGS_TOXIC) if is_bot_attempt else random.choice(HASHTAGS_NORMAL)
    post_text = random.choice(TOXIC_TEXTS) if is_bot_attempt else random.choice(NORMAL_TEXTS)
    
    post = {
        "post_id": str(uuid.uuid4()),
        "account_id": account_id,
        "hashtag": hashtag,
        "post_text": post_text,
        "post_velocity": post_velocity,
        "city": city,
        "device": "Bot_Script_v2" if is_bot_attempt else random.choice(DEVICES),
        "timestamp": datetime.utcnow().isoformat()
    }
    return post

try:
    while True:
        for _ in range(random.randint(1, 4)):
            post = generate_post()
            producer.send(TOPIC_NAME, value=post)
            print(f"[{post['city']}] {post['account_id']} ({post['post_velocity']} p/s): {post['post_text'][:30]}...")
        
        producer.flush()
        time.sleep(1)
except KeyboardInterrupt:
    print("\nVeri uretimi durduruldu.")
finally:
    producer.close()
