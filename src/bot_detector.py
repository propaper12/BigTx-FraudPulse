import json
from datetime import datetime
from kafka import KafkaConsumer, KafkaProducer
import clickhouse_connect
from textblob import TextBlob
import time

# Redpanda Baglantisi
REDPANDA_BROKERS = ['localhost:9092']
TOPIC_NAME = 'social_media_posts'

print(f"Redpanda'ya baglaniliyor ve '{TOPIC_NAME}' dinleniyor...")

try:
    consumer = KafkaConsumer(
        TOPIC_NAME,
        bootstrap_servers=REDPANDA_BROKERS,
        auto_offset_reset='latest',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    producer = KafkaProducer(
        bootstrap_servers=REDPANDA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print("Kafka (Redpanda) Baglantisi Basarili!")
except Exception as e:
    print(f"Baglanti Hatasi: {e}")
    exit(1)

# ClickHouse Baglantisi
try:
    ch_client = clickhouse_connect.get_client(host='localhost', port=8123, username='default', password='root')
    ch_client.command('DROP TABLE IF EXISTS bot_alerts')
    ch_client.command('''
        CREATE TABLE IF NOT EXISTS bot_alerts (
            account_id String,
            hashtag String,
            post_text String,
            city String,
            reason String,
            device String,
            ai_risk_score Float64,
            nlp_sentiment Float64,
            truth_score Float64,
            fact_check_result String,
            timestamp DateTime
        ) ENGINE = MergeTree()
        ORDER BY timestamp
    ''')
    print("ClickHouse Tablosu (post_text ve nlp_sentiment kolonlariyla) hazir.")
except Exception as e:
    print(f"ClickHouse baglanti hatasi: {e}")
    ch_client = None

# ML Modelini Yukle
try:
    import joblib
    import numpy as np
    model_path = "models/bot_model.pkl"
    ml_model = joblib.load(model_path)
    print("Yapay Zeka (Isolation Forest) modeli basariyla yuklendi!")
except Exception as e:
    print(f"Yapay Zeka modeli yuklenemedi: {e}")
    ml_model = None

user_states = {}

print("Sistem devrede. Veriler dinleniyor...")

for message in consumer:
    post = message.value
    account_id = post["account_id"]
    current_city = post["city"]
    hashtag = post["hashtag"]
    post_text = post.get("post_text", "")
    post_velocity = post["post_velocity"]
    
    is_bot = False
    reason = "GUVENLI"
    ai_risk_score = 0.0
    time_since_last = 3600.0
    
    # NLP Duygu Analizi (Sentiment Analysis)
    # Polarity: -1.0 (Cok negatif/toksik) ile +1.0 (Cok pozitif) arasi
    blob = TextBlob(post_text)
    nlp_sentiment = blob.sentiment.polarity
    
    if account_id not in user_states:
        user_states[account_id] = []
        
    state = user_states[account_id]
    
    if len(state) > 0:
        last_post = state[-1]
        last_city = last_post["city"]
        
        try:
            curr_time = datetime.fromisoformat(post["timestamp"])
            last_time = datetime.fromisoformat(last_post["timestamp"])
            time_since_last = (curr_time - last_time).total_seconds()
            if time_since_last <= 0: time_since_last = 0.1
        except:
            pass
        
        if last_city != current_city and time_since_last < 60:
            is_bot = True
            reason = f"BOT: Cross-Wiki Sicramasi"
            ai_risk_score = 99.9
            
    if not is_bot and post_velocity > 5000:
        is_bot = True
        reason = f"BOT: Devasa Icerik Silme/Ekleme"
        ai_risk_score = 98.5
        
    # Kural 3: YAPAY ZEKA (AI Anomaly) + NLP
    if ml_model and not is_bot:
        features = np.array([[post_velocity, time_since_last]])
        decision_val = ml_model.decision_function(features)[0]
        prediction = ml_model.predict(features)[0]
        
        if prediction == -1:
            # Model anomali tespit etti
            is_bot = True
            calculated_risk = min(99.9, max(75.0, (0.2 - decision_val) * 150))
            ai_risk_score = round(calculated_risk, 1)
            
            # Eger ayni zamanda metin de negatif/toksik ise, bu kesin bir Dezenformasyondur!
            if nlp_sentiment < -0.1:
                reason = "AI: VANDALIZM / TOKSIK EDIT"
            else:
                reason = "AI: ANORMAL EDIT BOYUTU"

    # FACT-CHECKING (Simulated Truth Analysis)
    truth_score = 95.0
    fact_check_result = "DOGRULANDI: Icerik guvenilir ve Wikipedia standartlariyla uyusuyor."
    
    if is_bot or nlp_sentiment < -0.1:
        truth_score = 15.0 + (np.random.random() * 20.0)
        fact_check_result = "AI UYARISI: Ilgili degisiklik vandalizm veya manipule edici bilgiler barindiriyor!"
    elif post_velocity > 1000:
        truth_score = 55.0 + (np.random.random() * 20.0)
        fact_check_result = "BILGI EKSIGI: Buyuk capli degisiklik, icerik tarafli veya eksik (Unverified)."
    else:
        truth_score = 80.0 + (np.random.random() * 19.9)
        if len(post_text) < 5:
            fact_check_result = "YETERSIZ VERI: Cok kucuk degisiklik, etki alani dusuk."

    alert_data = {
        "account_id": account_id,
        "hashtag": hashtag,
        "post_text": post_text,
        "city": current_city,
        "reason": reason,
        "ai_risk_score": ai_risk_score,
        "nlp_sentiment": round(nlp_sentiment, 2),
        "truth_score": round(truth_score, 1),
        "fact_check_result": fact_check_result,
        "is_bot": is_bot,
        "timestamp": post["timestamp"],
        "device": post["device"]
    }
    
    producer.send("bot_alerts", value=alert_data)
    producer.flush()
    
    if is_bot:
        safe_post_text = post_text[:20].encode('ascii', 'ignore').decode('ascii')
        safe_account_id = account_id.encode('ascii', 'ignore').decode('ascii')
        print(f"ALERT SENT: {safe_account_id} - {reason} - Truth: {truth_score}%", flush=True)
    
    if ch_client:
        try:
            ch_client.insert('bot_alerts', [[
                account_id, hashtag, post_text, current_city, reason, post['device'], 
                float(ai_risk_score), float(nlp_sentiment), 
                float(truth_score), fact_check_result, 
                datetime.utcnow()
            ]], column_names=[
                'account_id', 'hashtag', 'post_text', 'city', 'reason', 'device', 
                'ai_risk_score', 'nlp_sentiment', 'truth_score', 'fact_check_result', 'timestamp'
            ])
        except Exception as e:
            pass

    state.append(post)
    if len(state) > 1:
        state.pop(0)
