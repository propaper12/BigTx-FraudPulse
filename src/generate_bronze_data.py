import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

def generate_messy_data(num_rows=10000):
    # Klasörleri oluştur
    os.makedirs(os.path.join("data", "bronze"), exist_ok=True)
    os.makedirs(os.path.join("data", "silver"), exist_ok=True)
    os.makedirs(os.path.join("data", "gold"), exist_ok=True)

    print("Veri uretiliyor (Freelance tarzi 'kirli' musteri verisi)...")
    
    # Gerçekçi ve sorunlu veriler yaratıyoruz
    customer_ids = [f"CUST-{random.randint(1000, 9999)}" for _ in range(500)]
    customer_names = ["Ahmet Yilmaz", "Ayse Demir", "Mehmet Kaya", "Fatma Sahin", "ali can", " zeynep su ", "null", None]
    regions = ["Marmara", "Ege", "Ic Anadolu", "Akdeniz", "karadeniz", "marmara ", "UNKNOWN"]
    products = [
        {"id": "P-100", "name": "Laptop", "price": 15000},
        {"id": "P-101", "name": "Akilli Telefon", "price": 8000},
        {"id": "P-102", "name": "Kulaklik", "price": 500},
        {"id": "P-103", "name": "Monitör", "price": 3000},
        {"id": "P-104", "name": "Klavye", "price": "yüzelli"} # Bilerek hatalı veri tipi
    ]

    data = []
    start_date = datetime(2025, 1, 1)

    for i in range(num_rows):
        prod = random.choice(products)
        
        # Tarihlerde format bozuklukları (Gerçek hayattaki gibi)
        raw_date = start_date + timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))
        if random.random() < 0.1:
            date_str = raw_date.strftime("%d/%m/%Y") # Ters format
        elif random.random() < 0.05:
            date_str = raw_date.strftime("%Y-%d-%m") # Karisik format
        else:
            date_str = raw_date.strftime("%Y-%m-%d %H:%M:%S")

        # Fiyat ve Miktar hataları
        price = prod["price"]
        if random.random() < 0.05:
            price = None # Eksik fiyat
        
        qty = random.randint(1, 5)
        if random.random() < 0.02:
            qty = -1 # Eksi miktar hatası

        row = {
            "Transaction_ID": f"TRX-{i+1}",
            "Date": date_str,
            "Customer_ID": random.choice(customer_ids),
            "Customer_Name": random.choice(customer_names),
            "Region": random.choice(regions),
            "Product_ID": prod["id"],
            "Product_Name": prod["name"],
            "Price": price,
            "Quantity": qty
        }
        data.append(row)

    df = pd.DataFrame(data)
    
    # Bazı satırları tamamen boş (null) yapalım
    null_idx = np.random.choice(df.index, size=int(num_rows*0.03), replace=False)
    df.loc[null_idx, 'Customer_ID'] = np.nan

    # Bronze (Ham) veriyi kaydet
    file_path = os.path.join("data", "bronze", "raw_sales_data.csv")
    df.to_csv(file_path, index=False)
    print(f"Bronze veri basariyla uretildi ve kaydedildi: {file_path}")
    print(f"Toplam Satir: {len(df)}")
    print("Ornek Veri (Ilk 5 satir):")
    print(df.head())

if __name__ == "__main__":
    generate_messy_data()
