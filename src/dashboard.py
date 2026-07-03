import streamlit as st
import pandas as pd
import sqlite3
import plotly.express as px
import os

st.set_page_config(page_title="Otonom BI Dashboard", layout="wide")

AI_REPORT = """
## Satış Verileri Analizi Raporu

Şirketimizin 2023 yılı toplam cirosu 3,606,506.82 TL olarak gerçekleşmiştir.  Mobilya kategorisi en yüksek satış rakamına ulaşarak şirketin gelirinin önemli bir bölümünü oluşturmaktadır. Marmara bölgesi ise satış performansıyla öne çıkmakta ve potansiyel büyüme fırsatları sunmaktadır. Bu veriler ışığında, mobilya kategorisindeki başarıyı sürdürmek ve Marmara bölgesinde pazar payımızı artırmak için stratejik planlama yapılması gerekmektedir.  

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

st.info("Yapay Zeka (Gemma 2) Strateji Analizi:\n" + AI_REPORT)

# --- SOL PANEL (POWER BI SLICERS / DINAMIK FILTRELER) ---
st.sidebar.header("Dinamik Filtreler (Slicers)")
st.sidebar.markdown("Secimleriniz tum grafikleri aninda degistirecektir.")

selected_categories = st.sidebar.multiselect("Kategori Secin", df['Kategori'].unique(), default=df['Kategori'].unique())
selected_regions = st.sidebar.multiselect("Bolge Secin", df['Bolge'].unique(), default=df['Bolge'].unique())

filtered_df = df[(df['Kategori'].isin(selected_categories)) & (df['Bolge'].isin(selected_regions))]

st.divider()

# --- KPI KARTLARI ---
col1, col2, col3 = st.columns(3)
col1.metric("Toplam Ciro", f"{filtered_df['Satis_Miktari'].sum():,.0f} TL")
col2.metric("Toplam Pazarlama", f"{filtered_df['Pazarlama_Harcamasi'].sum():,.0f} TL")
col3.metric("Siparis Adedi", f"{len(filtered_df)} Adet")

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
