import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def run_ml_analysis(df):
    """
    Veriyi alır, temizler ve Pazarlama Harcamasının (marketing_spend) 
    Satış (sales_amount) üzerindeki etkisini Linear Regression ile tahminler.
    """
    # Basit bir Makine Öğrenmesi (ML) Modeli
    # Bağımsız Değişken (X) ve Bağımlı Değişken (y)
    X = df[['marketing_spend']]
    y = df['sales_amount']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Modelin istatistiksel başarısı ve katsayıları
    r_sq = model.score(X, y)
    coef = model.coef_[0]
    
    # Gelecek dönemler için varsayımsal pazarlama bütçesi ile tahmin (Forecasting)
    future_spend = pd.DataFrame({'marketing_spend': [300, 400, 500]})
    predictions = model.predict(future_spend)
    
    report = (
        f"**[Sistem Üretimi - Ham Makine Öğrenmesi Çıktısı]**\n"
        f"- Pazarlama harcamaları ve satışlar arasındaki R-kare (Doğruluk) skoru: {r_sq:.2f}\n"
        f"- Pazarlamaya harcanan her 1 birim, satışları ortalama {coef:.2f} birim artırmaktadır.\n\n"
        f"**Gelecek Tahminleri (Forecasting):**\n"
        f"- Pazarlama bütçesi 300 olursa beklenen satış: {predictions[0]:.2f}\n"
        f"- Pazarlama bütçesi 400 olursa beklenen satış: {predictions[1]:.2f}\n"
        f"- Pazarlama bütçesi 500 olursa beklenen satış: {predictions[2]:.2f}\n"
    )
    
    return report
