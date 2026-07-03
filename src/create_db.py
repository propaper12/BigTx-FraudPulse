import sqlite3
import pandas as pd
import numpy as np
import os
import random

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "company_data.db")

def create_database():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    
    # Filtreleme özelliklerinin çalışması için Kategori ve Bölge içeren Zengin bir Veri Seti
    np.random.seed(42)
    random.seed(42)
    
    dates = pd.date_range(start="2023-01-01", end="2023-12-31", freq='D')
    categories = ['Elektronik', 'Mobilya', 'Giyim', 'Gida']
    regions = ['Marmara', 'Ege', 'Ic Anadolu', 'Akdeniz']
    
    data = []
    for d in dates:
        # Her gün için rastgele 5-15 sipariş
        for _ in range(random.randint(5, 15)):
            cat = random.choice(categories)
            reg = random.choice(regions)
            
            # Kategoriye göre gerçekçi fiyatlandırma simülasyonu
            base_price = {'Elektronik': 1500, 'Mobilya': 2000, 'Giyim': 300, 'Gida': 100}[cat]
            sales_amount = base_price + np.random.normal(loc=0, scale=base_price*0.2)
            marketing_spend = sales_amount * 0.15 + np.random.normal(loc=0, scale=10)
            
            data.append({
                'Tarih': d.strftime('%Y-%m-%d'),
                'Kategori': cat,
                'Bolge': reg,
                'Pazarlama_Harcamasi': max(10.0, round(marketing_spend, 2)),
                'Satis_Miktari': max(50.0, round(sales_amount, 2))
            })
            
    df = pd.DataFrame(data)
    
    # SQL'e kaydet (Index olmadan)
    df.to_sql('sales', conn, if_exists='replace', index=False)
    
    print("Zengin SQL Veritabani (Kategori ve Bolge iceren) basariyla olusturuldu.")
    conn.close()

if __name__ == "__main__":
    create_database()
