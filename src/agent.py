import sqlite3
import pandas as pd
import os
from openai import OpenAI
import subprocess

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "company_data.db")
DASHBOARD_PATH = os.path.join(os.path.dirname(__file__), "dashboard.py")

def extract_summary_stats():
    """SQL veritabanına bağlanır ve verilerin genel bir özetini çıkarır."""
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM sales", conn)
    conn.close()
    
    total_sales = df['Satis_Miktari'].sum()
    top_category = df.groupby('Kategori')['Satis_Miktari'].sum().idxmax()
    top_region = df.groupby('Bolge')['Satis_Miktari'].sum().idxmax()
    
    stats = f"Sirketin bu yilki Toplam Cirosu: {total_sales:,.2f} TL\nEn Cok Satan Kategori: {top_category}\nEn Yuksek Satis Yapan Bolge: {top_region}"
    return stats

def get_ai_report(stats):
    """Gemma 2 LLM kullanarak analiz özetinden stratejik bir Türkçe rapor üretir."""
    print("Ajan: Veriler SQL'den cekildi, stratejik rapor yaziliyor (Gemma 2)...")
    system_prompt = (
        "Sen sirketin Bas Veri Zekasi (BI) Uzmanisin. "
        "Sana sirketin satis verilerinden elde edilen bir ozet verilecek. "
        "Yoneticiler icin durumu analiz eden, 3-4 cumlelik, vizyoner ve harekete gecirici "
        "cok profesyonel bir Turkce is raporu yaz."
    )
    
    try:
        client = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')
        response = client.chat.completions.create(
            model="gemma2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": stats}
            ],
            temperature=0.4
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Yapay zeka raporu olusturulamadi. Hata: {e}"

def generate_dashboard_code(ai_report):
    """Ajanın sıfırdan Python (Streamlit+Plotly) kodu yazmasını sağlar (PowerBI Alternatifi)."""
    print("Ajan: Interaktif filtreleri (Slicer) olan Dashboard kodu sifirdan uretiliyor...")
    
    dashboard_code = f'''import streamlit as st
import pandas as pd
import sqlite3
import plotly.express as px
import os

st.set_page_config(page_title="Otonom BI Dashboard", layout="wide")

AI_REPORT = """
{ai_report}
"""

@st.cache_data
def load_data():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "company_data.db")
    conn = sqlite3.connect(db_path)
    df = pd.read_sql("SELECT * FROM sales", conn)
    conn.close()
    return df

df = load_data()

st.title("Yapay Zeka Tarafindan Otonom Uretilmis BI Dashboard")
st.markdown("*(Bu sayfanin tasarimi ve grafikleri OmniData Ajani tarafindan kodlanmistir).*")

st.info("Yapay Zeka (Gemma 2) Strateji Analizi:\\n" + AI_REPORT)

# --- SOL PANEL (POWER BI SLICERS / DINAMIK FILTRELER) ---
st.sidebar.header("Dinamik Filtreler (Slicers)")
st.sidebar.markdown("Secimleriniz tum grafikleri aninda degistirecektir.")

selected_categories = st.sidebar.multiselect("Kategori Secin", df['Kategori'].unique(), default=df['Kategori'].unique())
selected_regions = st.sidebar.multiselect("Bolge Secin", df['Bolge'].unique(), default=df['Bolge'].unique())

filtered_df = df[(df['Kategori'].isin(selected_categories)) & (df['Bolge'].isin(selected_regions))]

st.divider()

# --- KPI KARTLARI ---
col1, col2, col3 = st.columns(3)
col1.metric("Toplam Ciro", f"{{filtered_df['Satis_Miktari'].sum():,.0f}} TL")
col2.metric("Toplam Pazarlama", f"{{filtered_df['Pazarlama_Harcamasi'].sum():,.0f}} TL")
col3.metric("Siparis Adedi", f"{{len(filtered_df)}} Adet")

st.divider()

# --- GRAFIKLER ---
col_chart1, col_chart2 = st.columns(2)

with col_chart1:
    fig_pie = px.pie(filtered_df, names='Kategori', values='Satis_Miktari', hole=0.4, title="Kategorilere Gore Ciro Dagilimi")
    st.plotly_chart(fig_pie, use_container_width=True)
    
with col_chart2:
    fig_bar = px.bar(filtered_df.groupby('Bolge', as_index=False)['Satis_Miktari'].sum(), x='Bolge', y='Satis_Miktari', color='Bolge', title="Bolgelere Gore Satis Performansi")
    st.plotly_chart(fig_bar, use_container_width=True)

trend_df = filtered_df.groupby('Tarih', as_index=False)[['Satis_Miktari', 'Pazarlama_Harcamasi']].sum()
fig_line = px.line(trend_df, x='Tarih', y=['Satis_Miktari', 'Pazarlama_Harcamasi'], title="Gunluk Satis ve Pazarlama Trendi")
st.plotly_chart(fig_line, use_container_width=True)
'''
    
    with open(DASHBOARD_PATH, "w", encoding="utf-8") as f:
        f.write(dashboard_code)
    print("dashboard.py dosyasi basariyla diske yazildi!")

def main():
    print("="*50)
    print("OTONOM B.I. AJANI BASLATILDI")
    print("="*50)
    
    stats = extract_summary_stats()
    report = get_ai_report(stats)
    generate_dashboard_code(report)
    
    print("Islem tamam! Mukemmel Dashboard tarayicida aciliyor...")
    subprocess.Popen(["python", "-m", "streamlit", "run", DASHBOARD_PATH])

if __name__ == "__main__":
    main()
