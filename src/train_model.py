import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import random
import os

print("Sentetik gecmis sosyal medya bot/troll verileri uretiliyor...")

n_samples = 15000
data = []

for _ in range(n_samples):
    # Normal insan davranisi
    post_velocity = random.uniform(0.1, 5.0) # Insanlar yavas post atar
    time_since_last_post = random.uniform(60, 3600) # Iki post arasi sure (saniye)
    
    # %5 ihtimalle Bot / Troll uret (Anomali)
    is_anomaly = random.random() < 0.05
    if is_anomaly:
        post_velocity = random.uniform(50.0, 200.0) # Botlar saniyede onlarca post atar
        time_since_last_post = random.uniform(0.1, 2.0) # Hic durmadan flood yaparlar

    # Model egitimi icin feature'lar: [post_velocity, time_since_last_post]
    data.append([post_velocity, time_since_last_post])

X_train = np.array(data)

print(f"{n_samples} adet hesap gecmisi hazir. AI (Isolation Forest) egitiliyor...")

# Isolation Forest
model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(X_train)

models_dir = "models"
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

model_path = os.path.join(models_dir, "bot_model.pkl")
joblib.dump(model, model_path)

print(f"Yapay Zeka Modeli (Bot Tespit) basariyla egitildi! -> {model_path}")
