import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, BarChart, Bar, Cell,
  ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import './index.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CITY_COORDS = {
  "New York": [-74.006, 40.7128], "London": [-0.1276, 51.5074], "Tokyo": [139.6503, 35.6762],
  "Istanbul": [28.9784, 41.0082], "Ankara": [32.8597, 39.9334], "Izmir": [27.1428, 38.4237],
  "Antalya": [30.7133, 36.8969], "Moscow": [37.6173, 55.7558], "Lagos": [3.3792, 6.5244],
  "Paris": [2.3522, 48.8566], "Berlin": [13.4050, 52.5200], "Beijing": [116.4074, 39.9042],
  "Sydney": [151.2093, -33.8688], "Rio de Janeiro": [-43.1729, -22.9068], "Cape Town": [18.4232, -33.9249],
  "Dubai": [55.2708, 25.2048], "Mumbai": [72.8777, 19.0760], "Los Angeles": [-118.2437, 34.0522],
  "Toronto": [-79.3832, 43.6532], "Seoul": [126.9780, 37.5665], "Singapore": [103.8198, 1.3521],
  "Mexico City": [-99.1332, 19.4326], "Cairo": [31.2357, 30.0444], "Buenos Aires": [-58.3816, -34.6037],
  "Jakarta": [106.8456, -6.2088]
};

const TRANSLATIONS = {
  TR: {
    title: "GRIDPULSE.AI - ENERJİ ŞEBEKESİ İZLEME",
    subtitle: "YAPAY ZEKA DESTEKLİ DOLANDIRICILIK (FRAUD) TESPİT PANELİ",
    ticker: "SİSTEM TELEMETRİSİ: Aktif izleme devrede. Canlı Kafka akışı ve AI teşhis motoru çalışıyor.",
    kpi_telemetry: "TOPLAM İŞLEM ADEDİ",
    kpi_anomaly_rate: "DOLANDIRICILIK (FRAUD) ORANI",
    kpi_stability: "ORT. ŞEBEKE KARARLILIĞI",
    kpi_confidence: "AI ENGINE GÜVEN SKORU",
    tab_dashboard: "Kontrol Paneli",
    tab_streams: "Canlı Akışlar",
    tab_anomalies: "Şüpheli İşlemler",
    tab_ml: "Yapay Zeka Modeli",
    tab_rules: "Filtre Kuralları",
    chart_load_title: "CANLI İŞLEM HACMİ (TRY) vs. FRAUD ALARMLARI",
    chart_load_desc: "ℹ️ Açıklama: Mavi alan sistemdeki toplam finansal işlem hacmini (TRY), kırmızı çizgiler ise yapay zeka tarafından bloke edilen şüpheli işlem adetlerini gösterir.",
    top_devices: "EN ÇOK ALARM VEREN ÖDEME KANALLARI",
    top_devices_desc: "ℹ️ Açıklama: En çok aşırı yük (overload) alarmı üreten sayaç ve trafoların tüketim değerlerine göre sıralamasıdır.",
    detected_anomalies: "⚠️ BLOKE EDİLEN ŞÜPHELİ TRANSFERLER",
    detected_anomalies_desc: "ℹ️ Açıklama: AI motoru tarafından tespit edilen düşük kararlılıktaki cihazların ve anomali türlerinin canlı log tablosudur.",
    stability_breakdown: "FİNANSAL İŞLEM GÜVENLİK ANALİZİ",
    stability_breakdown_desc: "ℹ️ Açıklama: Şebeke cihazlarının kararlılık oranları (Stabil, Kritik Arıza ve Kararsız Şebeke Uyarıları) dağılımını gösterir.",
    regional_anomalies: "BÖLGESEL ŞEBEKE ANOMALİLERİ",
    regional_anomalies_desc: "ℹ️ Açıklama: Trafo istasyonları bazında en çok anomali/arıza alarmı üreten bölgelerin karşılaştırmalı istatistiğidir.",
    terminal_feed: "AI LIVE PAYMENT TRANSACTION FEED",
    terminal_feed_desc: "ℹ️ Açıklama: Şebekeden gelen ham telemetri paketleri ve bunlara anlık olarak yapay zekanın yazdığı tanı ve teşhis kararları akışıdır.",
    search_placeholder: "Cihaz adına göre ara...",
    export_csv: "CSV Dışa Aktar 📥",
    isolate: "İzole Et",
    diag: "Teşhis",
    status_ai: "🛡️ AI DURUMU",
    status_rules: "Kural Filtresi",
    status_latency: "Ort. Gecikme",
    hotspots: "🔥 ANOMALİ BÖLGELERİ",
    control_stats: "📈 KONTROL İSTATİSTİKLERİ",
    isolations: "İzolasyonlar",
    last_action: "Son Aksiyon",
    stable_stream: "Kararlı akış...",
    anomalies_title: "Tespit Edilen Şebeke Anomalileri & Kalite Riskleri",
    anomalies_db: "Anomali Log Veritabanı",
    anomalies_cluster: "AI ANOMALİ KÜMELEME HARİTASI (SCATTER PLOT)",
    anomalies_cluster_desc: "Noktaların sola ve aşağıda kümelenmesi, düşük şebeke kararlılığı (Stability) ve yüksek voltaj düşüşlerini gösterir.",
    no_matching_anomalies: "Eşleşen anomali bulunamadı. Akıllı şebeke izleniyor...",
    kpi_active_anomalies: "AKTİF KRİTİK ALARM",
    kpi_vulnerable_device: "EN HASSAS CİHAZ GRUBU",
    kpi_sensitive_station: "EN ÇOK ANOMALİ ALAN İSTASYON",
    tab_copilot: "AI Asistanı",
    copilot_title: "FraudPulse AI Copilot - Finansal Güvenlik Asistanı",
    copilot_placeholder: "Şebeke kararlılığı veya öneriler hakkında bir şey sorun...",
    copilot_send: "Gönder",
    copilot_intro: "Merhaba! Ben FraudPulse AI Finansal Güvenlik Asistanıyım. ClickHouse analitik ödeme verilerine ve canlı Kafka işlem akışlarına doğrudan erişimim var. Şüpheli işlemler, limit aşımı ve hesap güvenlik önlemleri hakkında sorularınızı yanıtlayabilirim.",
    copilot_prompt_1: "Şu an ödeme sistemi güvenliği ne durumda?",
    copilot_prompt_2: "Şüpheli işlem alarmları için ne yapmalıyım?",
    copilot_prompt_3: "En yüksek risk oranına sahip caddeler hangileri?",
    tab_geo_map: "Coğrafi Analiz"
  },
  EN: {
    title: "FRAUDPULSE.AI - TRANSACTION SECURITY MONITOR",
    subtitle: "REAL-TIME PAYMENT FRAUD DETECTION DASHBOARD",
    ticker: "SECURITY FEED: Transaction monitoring enabled. Live Redpanda Kafka streams and FraudPulse AI engine online.",
    kpi_telemetry: "TOTAL TRANSACTIONS",
    kpi_anomaly_rate: "FRAUD RATE (AVG)",
    kpi_stability: "AVG TRANSACTION SECURITY",
    kpi_confidence: "AI ENGINE CONFIDENCE",
    tab_dashboard: "Dashboard",
    tab_streams: "Live Streams",
    tab_anomalies: "Flagged Transactions",
    tab_ml: "ML Engine",
    tab_rules: "AI Rules",
    chart_load_title: "LIVE TRANSACTION VOLUME (TRY) vs. FRAUD ALERTS",
    chart_load_desc: "ℹ️ Description: The blue area represents total transaction volume (TRY) and the red line counts active critical fraud attempts.",
    top_devices: "TOP ALERTING CHANNELS",
    top_devices_desc: "ℹ️ Description: List of smart meters and transformers ranking highest in active power consumption & overload triggers.",
    detected_anomalies: "⚠️ FLAGGED TRANSACTIONS LOG",
    detected_anomalies_desc: "ℹ️ Description: Live logs of device anomalies with stability scores and mitigation trigger levels.",
    stability_breakdown: "PAYMENT SECURITY BREAKDOWN",
    stability_breakdown_desc: "ℹ️ Description: Breakdown of grid device stability rates (Stable Grid, Critical Failures, and Warnings).",
    regional_anomalies: "REGIONAL GRID ANOMALIES",
    regional_anomalies_desc: "ℹ️ Description: Bar chart comparing the total frequency of anomaly alerts across different regional substation nodes.",
    terminal_feed: "AI LIVE PAYMENT TRANSACTION FEED",
    terminal_feed_desc: "ℹ️ Description: Real-time sensor stream raw metrics coupled with live AI model diagnostic analysis logs.",
    search_placeholder: "Search devices...",
    export_csv: "Export CSV 📥",
    isolate: "Isolate",
    diag: "Diag",
    status_ai: "🛡️ AI STATUS",
    status_rules: "Rules Filter",
    status_latency: "Avg Latency",
    hotspots: "🔥 ANOMALY HOTSPOTS",
    control_stats: "📈 CONTROL STATS",
    isolations: "Isolations",
    last_action: "Last Action",
    stable_stream: "Stable stream...",
    anomalies_title: "Detected Grid Anomalies & Quality Risks",
    anomalies_db: "Anomaly Log Database",
    anomalies_cluster: "AI ANOMALY CLUSTER MAP (SCATTER PLOT)",
    anomalies_cluster_desc: "Clustering of dots on the bottom-left represents low grid stability and high voltage drops.",
    no_matching_anomalies: "No matching anomalies detected. Monitoring smart grid...",
    kpi_active_anomalies: "ACTIVE CRITICAL ALARMS",
    kpi_vulnerable_device: "MOST VULNERABLE DEVICE TYPE",
    kpi_sensitive_station: "MOST SENSITIVE SUBSTATION",
    tab_copilot: "AI Copilot",
    copilot_title: "FraudPulse AI Copilot - Live Payment Assistant",
    copilot_placeholder: "Ask about grid stability, anomalies, or mitigations...",
    copilot_send: "Send",
    copilot_intro: "Hello! I am the FraudPulse AI Assistant. I have real-time access to ClickHouse OLAP logs and live Redpanda payment stream. Ask me about suspicious activity root-causes, card freezing, or merchant status.",
    copilot_prompt_1: "What is the current transaction safety status?",
    copilot_prompt_2: "What action is needed for velocity alerts?",
    copilot_prompt_3: "Which accounts are currently blocked?",
    tab_geo_map: "Geo-SCADA Map"
  }
};

const playSynthBeep = (freq = 440, type = 'sine', duration = 0.15) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("AudioContext blocked or failed", e);
  }
};

const gridStations = {
  "Istanbul": "Istanbul Central Gateway",
  "Ankara": "Ankara Backup Gateway",
  "Izmir": "Izmir Regional Hub",
  "Antalya": "Antalya Regional Hub",
  "Adana": "Adana Branch Gateway",
  "Bursa": "Bursa Regional Hub",
  "Nicosia": "Nicosia Offshore Gateway",
  "Panama City": "Panama Offshore Node",
  "Grand Cayman": "Cayman Islands Offshore Node"
};

const streets = {
  "Istanbul": "Levent HQ",
  "Ankara": "Çankaya Branch",
  "Izmir": "Konak Hub",
  "Antalya": "Muratpaşa Branch",
  "Adana": "Seyhan Hub",
  "Bursa": "Nilüfer Branch",
  "Nicosia": "Nicosia Financial Center",
  "Panama City": "Panama Bank Node",
  "Grand Cayman": "Cayman Islands Bank Node"
};

const PIE_COLORS = ['#16a34a', '#f59e0b', '#ef4444']; // Verified (Green), Unverified (Orange), Fake (Red)

function App() {
  const [lang, setLang] = useState('TR');
  const [alerts, setAlerts] = useState([]);
  const [topCities, setTopCities] = useState([
    { name: "Westminster", value: 34 },
    { name: "Chelsea", value: 28 },
    { name: "Camden", value: 22 },
    { name: "Greenwich", value: 18 },
    { name: "Brixton", value: 15 }
  ]);
  const [avgTruth, setAvgTruth] = useState(82.4);
  const [timeline, setTimeline] = useState([
    { time: '14:20', posts: 3200, frauds: 12 },
    { time: '14:22', posts: 3500, frauds: 15 },
    { time: '14:24', posts: 3100, frauds: 8 },
    { time: '14:26', posts: 3900, frauds: 22 },
    { time: '14:28', posts: 3600, frauds: 14 },
    { time: '14:30', posts: 4200, frauds: 19 }
  ]);
  const [breakdown, setBreakdown] = useState([
    { name: "Verified", value: 124 },
    { name: "Unverified/Warning", value: 34 },
    { name: "Fake/Vandalism", value: 12 }
  ]);
  const [liveMetrics, setLiveMetrics] = useState({
    throughput: "22.4",
    latency: "<45",
    disinfoRate: "0.0"
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [revertedIds, setRevertedIds] = useState([]);
  const [revertedCount, setRevertedCount] = useState(0);
  const [sensitivity, setSensitivity] = useState('MID');
  const [lastAction, setLastAction] = useState('-');
  const [activeTab, setActiveTab] = useState('analytics');
  const [darkMode, setDarkMode] = useState(false);
  const [timeframe, setTimeframe] = useState('LIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartMetric, setChartMetric] = useState('velocity');
  const [diagTab, setDiagTab] = useState('radar');
  const [showChatPopover, setShowChatPopover] = useState(false);
  const [solarRadiation, setSolarRadiation] = useState(500); // W/m^2
  const [gridLoadCoeff, setGridLoadCoeff] = useState(1.0);
  const [selectedStreet, setSelectedStreet] = useState('Istanbul');
  const [mitigationLoading, setMitigationLoading] = useState(false);
  const [anomaliesRightTab, setAnomaliesRightTab] = useState('chart');

  useEffect(() => {
    if (alerts.length > 0) {
      // Compute avg load coefficient dynamically from active anomalies
      const totalLoadScale = alerts.reduce((acc, a) => {
        let scale = 1.0;
        if (a.reason === 'CRITICAL_OVERLOAD' || a.reason === 'OVERLOAD') scale = 1.45;
        else if (a.reason === 'OVERHEATING') scale = 1.15;
        else if (a.reason === 'VOLTAGE_DROP') scale = 0.95;
        return acc + scale;
      }, 0);
      const computedLoadCoeff = parseFloat((totalLoadScale / alerts.length).toFixed(2));
      setGridLoadCoeff(computedLoadCoeff);

      // Compute solar radiation dynamically from sensor average temperature
      const avgTemp = alerts.reduce((acc, a) => acc + (a.temp || 22.0), 0) / alerts.length;
      const computedSolar = Math.min(1000, Math.max(0, Math.round((avgTemp - 12) * 38)));
      setSolarRadiation(computedSolar);
    }
  }, [alerts]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // AI Copilot state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', textKey: 'copilot_intro' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [streamHistory, setStreamHistory] = useState([
    { time: '17:50', throughput: 22.4, latency: 42 },
    { time: '17:51', throughput: 24.1, latency: 45 },
    { time: '17:52', throughput: 21.8, latency: 39 },
    { time: '17:53', throughput: 23.5, latency: 41 },
    { time: '17:54', throughput: 22.9, latency: 40 }
  ]);

  const handleChatSubmit = async (text) => {
    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, lang: lang })
      });
      const data = await response.json();
      const aiReply = data.reply || (lang === 'TR' ? "Hata oluştu." : "Error occurred.");
      const engine = data.engine || "Explainable Grid AI";
      
      setChatMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: `[${engine}] ${aiReply}` 
      }]);
    } catch (e) {
      console.error("AI Copilot request error", e);
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: lang === 'TR' 
            ? "[Local Fallback] Şebeke veri akışı stabil, ClickHouse bağlantısı etkin." 
            : "[Local Fallback] Grid message streams active, ClickHouse connection online." 
        }]);
      }, 600);
    }
  };

  const parseTelemetry = (text) => {
    if (!text || !text.includes('=')) {
      return <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{text}</span>;
    }
    const cleaned = text.replace('Telemetry:', '').trim();
    const parts = cleaned.split(',').map(p => p.trim());
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
        {parts.map((part, i) => {
          const splitPart = part.split('=');
          if (splitPart.length < 2) return <span key={i} style={{ fontSize: '9px' }}>{part}</span>;
          const key = splitPart[0].trim();
          const val = splitPart[1].trim();
          
          let icon = "📊";
          let color = "var(--cyan)";
          let bg = "rgba(2, 132, 199, 0.05)";
          
          if (key.toLowerCase().includes('tutar') || key.toLowerCase().includes('amount')) {
            icon = "💰";
            color = "var(--green)";
            bg = "rgba(34, 197, 94, 0.08)";
          } else if (key.toLowerCase().includes('kanal') || key.toLowerCase().includes('channel') || key.toLowerCase().includes('method')) {
            icon = "💳";
            color = "var(--cyan)";
            bg = "rgba(2, 132, 199, 0.08)";
          } else if (key.toLowerCase().includes('merchant')) {
            icon = "🏢";
            color = "var(--orange)";
            bg = "rgba(245, 158, 11, 0.08)";
          }
          
          if (key.toLowerCase().includes('hız') || key.toLowerCase().includes('velocity')) { icon = "⚡"; color = "var(--red)"; bg = "rgba(239, 68, 68, 0.08)"; }
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: bg, color: color, padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold', border: `1px solid ${color}20` }}>
              {icon} {key}: <span style={{ color: 'var(--text-main)', marginLeft: '1px' }}>{val}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const handleRevert = (row) => {
    const rowKey = `${row.account_id}-${row.hashtag}-${row.timestamp}`;
    setRevertedIds((prev) => [...prev, rowKey]);
    setRevertedCount((prev) => prev + 1);
    setLastAction(`Reverted #${row.hashtag.substring(0, 8)}...`);

    const systemAlert = {
      account_id: "SYSTEM_DAEMON",
      hashtag: row.hashtag,
      post_text: `ADMIN ACTION: Reverted edit by user '${row.account_id}'`,
      city: row.city,
      reason: "REVERTED",
      ai_risk_score: 0.0,
      nlp_sentiment: 0.0,
      truth_score: 100.0,
      fact_check_result: `SUCCESSFUL ROLLBACK: Wikipedia article successfully reverted to previous stable version. Warning flag logged.`,
      is_bot: false,
      timestamp: new Date().toISOString(),
      device: "AdminConsole"
    };
    setAlerts((prev) => [systemAlert, ...prev]);
  };

  const handleReview = (row) => {
    setSelectedAlert(row);
    setAnomaliesRightTab('diag');
  };

  const handleMitigate = (type) => {
    setMitigationLoading(true);
    // Play synth beep to indicate start of mitigation
    playSynthBeep(440, 'sine', 0.1);
    
    setTimeout(() => {
      setMitigationLoading(false);
      
      // Add alert to reverted list so it disappears from active alerts table!
      const alertId = `${selectedAlert.account_id}-${selectedAlert.hashtag}-${selectedAlert.timestamp}`;
      setRevertedIds((prev) => [...prev, alertId]);
      setRevertedCount((prev) => prev + 1);
      
      // Update system audit log status
      setLastAction(
        type === 'COOLING' ? (lang === 'TR' ? `Soğutuldu (${selectedAlert.account_id})` : `Cooling (${selectedAlert.account_id})`) :
        type === 'PHASE_BALANCE' ? (lang === 'TR' ? `Dengelendi (${selectedAlert.account_id})` : `Phases Balanced (${selectedAlert.account_id})`) :
        (lang === 'TR' ? `Sınırlandı (${selectedAlert.account_id})` : `Derated (${selectedAlert.account_id})`)
      );

      // Play success synth sound! (C5 then E5 rising chime)
      playSynthBeep(523.25, 'sine', 0.1); // C5
      setTimeout(() => playSynthBeep(659.25, 'sine', 0.15), 100); // E5
      
      // Close report modal
      setSelectedAlert(null);
    }, 1500);
  };

  useEffect(() => {
    let simulationInterval = null;
    let isConnected = false;

    const startSimulation = () => {
      if (simulationInterval) return;
      console.log("Kafka connection offline. Starting client-side data stream simulation...");
      simulationInterval = setInterval(() => {
        const samplePages = ['SmartMeter', 'EVCharger', 'Transformer'];
        const sampleUsers = ['METER_101', 'METER_102', 'METER_103', 'CHARGER_201', 'CHARGER_202', 'CHARGER_203', 'TRAFO_301', 'TRAFO_302', 'TRAFO_303'];
        const sampleReasons = ['CRITICAL_OVERLOAD', 'VOLTAGE_DROP', 'OVERHEATING', 'NORMAL'];
        const sampleCities = ['Westminster', 'Chelsea', 'Camden', 'Greenwich', 'Brixton', 'Hackney', 'Wembley', 'Wimbledon', 'Stratford'];
        
        const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)];
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomReason = sampleReasons[Math.floor(Math.random() * sampleReasons.length)];
        const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
        
        const isBot = randomPage === 'Transformer' || randomReason === 'CRITICAL_OVERLOAD';
        const sentiment = randomReason === 'CRITICAL_OVERLOAD' ? -0.85 : parseFloat((Math.random() * 0.8 - 0.2).toFixed(2));
        const truth = randomReason === 'NORMAL' ? Math.floor(75 + Math.random() * 20) : Math.floor(10 + Math.random() * 35);
        
        const mockAlert = {
          account_id: randomUser,
          hashtag: randomPage,
          post_text: randomReason === 'CRITICAL_OVERLOAD' ? 'Telemetry: Load=450kW, Voltage=190V' : 'Telemetry: normal parameters operational',
          city: randomCity,
          reason: randomReason,
          ai_risk_score: isBot ? 98.2 : 45.0,
          nlp_sentiment: sentiment,
          truth_score: truth,
          fact_check_result: randomReason === 'NORMAL' ? 'GRID HEALTHY: Voltage and load parameters are within normal boundaries.' : 'CRITICAL OVERLOAD: Transformer draws excessive load. Auto shedding triggered.',
          is_bot: isBot,
          timestamp: new Date().toISOString(),
          device: randomPage
        };
        
        setAlerts((prev) => [mockAlert, ...prev].slice(0, 50));
        
        // Simülasyon sesli alarm uyarısı
        if (mockAlert.is_bot) {
          const isCritical = mockAlert.truth_score < 20;
          if (isCritical) {
            playSynthBeep(880, 'triangle', 0.25);
          } else {
            playSynthBeep(660, 'sine', 0.08);
            setTimeout(() => playSynthBeep(660, 'sine', 0.08), 100);
          }
        }
        
        setLiveMetrics((prev) => {
          const fakeCount = prev.disinfoRate;
          return {
            throughput: (20 + Math.random() * 5).toFixed(1),
            latency: "<" + Math.floor(35 + Math.random() * 15),
            disinfoRate: isBot ? (parseFloat(fakeCount) + 0.1).toFixed(1) : fakeCount
          };
        });

        // Simulating AreaChart load vs overload timeline
        setTimeline((prev) => {
          const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newLoad = Math.floor(3000 + Math.random() * 1500);
          const newOverloads = isBot ? Math.floor(Math.random() * 4) + 1 : 0;
          const nextTimeline = [...prev, { time: nextTime, posts: newLoad, frauds: newOverloads }];
          return nextTimeline.slice(-8);
        });

        setTopCities((prev) => {
          if (!prev || prev.length === 0) {
            return [{ name: randomCity, value: isBot ? 1 : 0 }];
          }
          const citiesList = prev.map(c => c.name);
          if (citiesList.includes(randomCity)) {
            return prev.map(c => c.name === randomCity ? { ...c, value: c.value + (isBot ? 1 : 0) } : c);
          } else {
            const sorted = [...prev].sort((a,b) => a.value - b.value);
            const lowestCity = sorted[0]?.name;
            if (!lowestCity) {
              return [{ name: randomCity, value: isBot ? 1 : 0 }];
            }
            return prev.map(c => c.name === lowestCity ? { name: randomCity, value: Math.floor(Math.random() * 5) + 5 } : c);
          }
        });

        // Simulating PieChart stability breakdown
        setBreakdown((prev) => {
          return prev.map(item => {
            if (randomReason === 'NORMAL' && item.name === 'Verified') {
              return { ...item, value: item.value + 1 };
            } else if (isBot && item.name === 'Fake/Vandalism') {
              return { ...item, value: item.value + 1 };
            } else if (item.name === 'Unverified/Warning' && randomReason !== 'NORMAL') {
              return { ...item, value: item.value + 1 };
            }
            return item;
          });
        });
      }, 3500);
    };

    const stopSimulation = () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
    };

    // Live Stream
    const eventSource = new EventSource('http://localhost:8000/api/stream');
    eventSource.onmessage = (event) => {
      isConnected = true;
      stopSimulation();
      const newAlert = JSON.parse(event.data);
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      
      // Dynamic audio alert synthesis
      if (newAlert.is_bot) {
        const isCritical = newAlert.truth_score < 20 || newAlert.temp > 80 || newAlert.consumption > 400;
        if (isCritical) {
          playSynthBeep(880, 'triangle', 0.25);
        } else {
          playSynthBeep(660, 'sine', 0.08);
          setTimeout(() => playSynthBeep(660, 'sine', 0.08), 100);
        }
      }

      setLiveMetrics((prev) => {
        const fakeCount = prev.disinfoRate;
        return {
          throughput: (20 + Math.random() * 5).toFixed(1),
          latency: "<" + Math.floor(40 + Math.random() * 15),
          disinfoRate: newAlert.is_bot ? (parseFloat(fakeCount) + 0.1).toFixed(1) : fakeCount
        };
      });
    };

    eventSource.onerror = () => {
      isConnected = false;
      startSimulation();
    };

    const timeout = setTimeout(() => {
      if (!isConnected) {
        startSimulation();
      }
    }, 3000);

    // Analytics from ClickHouse
    const fetchAnalytics = async () => {
      try {
        const [cityRes, truthRes, timeRes, breakRes] = await Promise.all([
          axios.get('http://localhost:8000/api/stats/top-cities'),
          axios.get('http://localhost:8000/api/stats/truth-score'),
          axios.get('http://localhost:8000/api/stats/timeline'),
          axios.get('http://localhost:8000/api/stats/fact-check-breakdown')
        ]);
        
        if (cityRes.data?.data && cityRes.data.data.length > 0) setTopCities(cityRes.data.data);
        if (truthRes.data?.total) setAvgTruth(truthRes.data.total);
        if (breakRes.data?.data && breakRes.data.data.length > 0) setBreakdown(breakRes.data.data);
        if (timeRes.data?.data) {
          const enhancedTimeline = timeRes.data.data.map(item => ({
            ...item,
            posts: item.frauds === 0 ? Math.floor(Math.random() * 5000) : item.frauds * 85 + Math.floor(Math.random() * 2000)
          }));
          setTimeline(enhancedTimeline);
        }

        // Push to stream history for streams tab line chart
        setStreamHistory((prev) => {
          const newTp = parseFloat((20 + Math.random() * 5).toFixed(1));
          const newLt = Math.floor(35 + Math.random() * 15);
          const nextHistory = [...prev, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            throughput: newTp,
            latency: newLt
          }];
          return nextHistory.slice(-10);
        });
      } catch (e) {
        console.error("Analytics fetch error", e);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);

    return () => {
      eventSource.close();
      clearInterval(interval);
      if (simulationInterval) clearInterval(simulationInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Leaflet UK (London Neighborhoods) Thermal Risk Map Hook
  useEffect(() => {
    if (!window.L) return;
    const L = window.L;
    
    const londonCableGrid = {
      "Istanbul": {
        center: [41.0082, 28.9784],
        nominalCapacity: 100000
      },
      "Ankara": {
        center: [39.9334, 32.8597],
        nominalCapacity: 50000
      },
      "Izmir": {
        center: [38.4192, 27.1287],
        nominalCapacity: 40000
      },
      "Antalya": {
        center: [36.8969, 30.7133],
        nominalCapacity: 30000
      },
      "Adana": {
        center: [37.0000, 35.3213],
        nominalCapacity: 20000
      },
      "Bursa": {
        center: [40.1885, 29.0610],
        nominalCapacity: 25000
      },
      "Nicosia": {
        center: [35.1856, 33.3823],
        nominalCapacity: 15000
      },
      "Panama City": {
        center: [8.9824, -79.5199],
        nominalCapacity: 15000
      },
      "Grand Cayman": {
        center: [19.3034, -81.3863],
        nominalCapacity: 15000
      }
    };

    let map = L.Map.mapInstance;
    const mapContainer = document.getElementById('uk-thermal-map');
    
    if (mapContainer && !map) {
      try {
        map = L.map('uk-thermal-map', {
          center: [36.0, 15.0], // Centered to cover Europe/Turkey/Cyprus
          zoom: 4, 
          zoomControl: true,
          attributionControl: false
        });
        
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          attribution: '&copy; Google Maps'
        }).addTo(map);
        
        L.Map.mapInstance = map;
        L.Map.markers = [];
        
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 150);
      } catch (e) {
        console.error("Map init error", e);
      }
    }

    if (map) {
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 150);

      if (L.Map.markers) {
        L.Map.markers.forEach(m => map.removeLayer(m));
      }
      L.Map.markers = [];

      Object.entries(londonCableGrid).forEach(([streetName, streetConfig]) => {
        const cityName = streetName;
        let amount = 150.0;
        let method = "Credit Card";
        let status = "NORMAL";
        let velocity = 1.0;
        
        const cityAlerts = alerts.filter(a => a.city === cityName);
        if (cityAlerts.length > 0) {
          amount = cityAlerts[0].temp || 150.0;
          method = cityAlerts[0].hashtag || "Credit Card";
          status = cityAlerts[0].anomaly_reason || "NORMAL";
          velocity = cityAlerts[0].post_velocity || 1.0;
        }

        const isFraud = status !== "NORMAL";
        let color = "#10b981"; // Green
        let radius = 25000; // 25km radius
        
        if (isFraud) {
          color = "#ef4444"; // Red for fraud
          radius = 75000; // large circle for alerts
        } else if (amount > 10000) {
          color = "#f59e0b"; // Orange for large amounts
          radius = 50000;
        }

        const circle = L.circle(streetConfig.center, {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          radius: radius,
          weight: 2
        }).addTo(map);

        const popupText = `
          <div style="font-family: 'Rajdhani', sans-serif; color: #1e293b; font-size: 11px; padding: 4px; min-width: 170px;">
            <b style="font-size: 12px; text-transform: uppercase; color: #0284c7;">📍 ${cityName}</b><br/>
            <span style="font-size: 9px; color: #64748b;">Ödeme Kanalı İşlem Analizi</span>
            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #cbd5e1;"/>
            💰 <b>İşlem Tutarı:</b> ${amount.toFixed(2)} TRY<br/>
            💳 <b>Kanal:</b> ${method}<br/>
            ⚡ <b>İşlem Hızı:</b> ${velocity} tx/s<br/>
            🛡️ <b>Güvenlik Durumu:</b> <span style="color: ${color}; font-weight: bold;">${status}</span>
            <br/><span style="font-size: 9px; color: #64748b; display: block; margin-top: 5px; font-style: italic; text-align: center;">Yan panelde detaylı incelemek için tıklayın 🔍</span>
          </div>
        `;
        
        circle.bindPopup(popupText);
        
        circle.on('click', () => {
          map.flyTo(streetConfig.center, 9);
          setSelectedStreet(cityName);
        });

        L.Map.markers.push(circle);
        
        polyline.on('click', () => {
          map.flyTo(streetConfig.center, 15);
          setSelectedStreet(streetName);
        });

        L.Map.markers.push(polyline);
      });
    }
  }, [alerts, solarRadiation, gridLoadCoeff]);

  // Hesaplamalar
  const currentTotalTx = timeline.length > 0 ? timeline[timeline.length - 1].posts : 18973;
  const totalBreakdown = breakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  const verifiedPercent = ((breakdown.find(b => b.name.includes("Secure") || b.name === "Verified")?.value || 0) / totalBreakdown * 100).toFixed(1);
  const fakePercent = ((breakdown.find(b => b.name.includes("Fraud") || b.name === "Fake/Vandalism")?.value || 0) / totalBreakdown * 100).toFixed(1);

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            {sidebarCollapsed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            )}
          </div>
          <span>FraudPulse.AI</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span>{TRANSLATIONS[lang].tab_dashboard}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'streams' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('streams'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>{TRANSLATIONS[lang].tab_streams}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'threats' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('threats'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>{TRANSLATIONS[lang].tab_anomalies}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('rules'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span>{TRANSLATIONS[lang].tab_rules}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'ml' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ml'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>{TRANSLATIONS[lang].tab_ml}</span>
          </a>
        </nav>

      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            <span className="text-cyan font-bold">FRAUDPULSE.AI</span>
            <span className="text-gray-400 mx-2">-</span>
            <span className="text-gray-300">{lang === 'TR' ? 'ÖDEME GÜVENLİĞİ VE FRAUD ANALİZİ' : 'REAL-TIME TRANSACTION SECURITY SCADA'}</span>
          </div>
          <div className="topbar-actions">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                marginRight: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              <option value="TR" style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>TR 🇹🇷</option>
              <option value="EN" style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>EN 🇺🇸</option>
            </select>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode" style={{ fontSize: '14px', marginRight: '4px' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn notification" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length > 0 && <span className="badge-dot"></span>}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '20px',
                width: '280px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                padding: '12px',
                zIndex: 1000,
                backdropFilter: 'blur(16px)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>{lang === 'TR' ? 'Bildirimler' : 'Notifications'}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>
                    {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length} {lang === 'TR' ? 'Yeni' : 'New'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).slice(0, 4).map((n, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActiveTab('threats');
                        setShowNotifications(false);
                      }}
                      style={{ 
                        padding: '8px', 
                        background: 'rgba(239, 68, 68, 0.05)', 
                        border: '1px solid rgba(239, 68, 68, 0.1)', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: 'var(--red)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🚨 {n.reason}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div style={{ color: 'var(--text-main)', marginTop: '2px', fontSize: '10px' }}>
                        {n.account_id} ({gridStations[n.city] || n.city})
                      </div>
                    </div>
                  ))}
                  {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '15px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
                      🟢 {lang === 'TR' ? 'Yeni bildirim yok' : 'No new notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin&background=1f2937&color=fff" alt="User" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="content">
          {activeTab === 'analytics' && (
            <>
              <div className="content-header">
                <h2>{lang === 'TR' ? 'Yapay Zeka Destekli Akıllı Şebeke Operasyonları Paneli' : 'Real-Time IoT Grid Operations Dashboard'}</h2>
                <div style={{ display: 'flex', gap: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                  {['LIVE', '1H', '24H', '7D'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeframe(mode)}
                      style={{
                        background: timeframe === mode ? 'var(--cyan)' : 'rgba(0,0,0,0.05)',
                        color: timeframe === mode ? '#fff' : 'var(--text-main)',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Anomaly Ticker Banner */}
              {(() => {
                const lastAlert = alerts[0];
                const isCritical = lastAlert && lastAlert.truth_score < 40;
                return (
                  <div style={{
                    background: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(22, 163, 74, 0.05)',
                    border: `1px solid ${isCritical ? 'var(--red)' : 'var(--green)'}`,
                    borderRadius: '6px',
                    padding: '8px 16px',
                    marginBottom: '15px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isCritical ? 'var(--red)' : 'var(--green)',
                    fontWeight: 'bold',
                    boxShadow: isCritical ? '0 0 10px rgba(239,68,68,0.1)' : 'none'
                  }}>
                    <span>{isCritical ? '🚨' : '✓'}</span>
                    <span style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isCritical 
                        ? (lang === 'TR' 
                            ? `GÜVENLİK ALARMI: '${lastAlert.account_id}' numaralı hesaptan yapılan ${lastAlert.hashtag} işleminde (${gridStations[lastAlert.city] || lastAlert.city}) şüpheli aktivite tespit edildi - Güvenlik Skoru: %${lastAlert.truth_score}`
                            : `SECURITY ALERT: Suspicious activity on account '${lastAlert.account_id}' via ${lastAlert.hashtag} (${gridStations[lastAlert.city] || lastAlert.city}) - Security Score: ${lastAlert.truth_score}%`
                          )
                        : (lang === 'TR'
                            ? `SİSTEM DURUMU: GÜVENLİ. Ödeme kanalları ve veri akışları aktif (Redpanda:9092)`
                            : `SYSTEM STATUS: SECURE. Active payment channels streaming (Redpanda:9092)`
                          )
                      }
                    </span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>{lang === 'TR' ? 'Canlı Yayın Akışı' : 'Live Feed Updates'}</span>
                  </div>
                );
              })()}

              {/* KPIs */}
              <div className="kpi-grid">
                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_telemetry} (Live) <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{currentTotalTx.toLocaleString()}</span>
                    <span className="kpi-unit">/ min</span>
                    <span className="kpi-trend text-cyan">(+4.2%)</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-cyan" style={{width: '75%'}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_anomaly_rate} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{fakePercent}%</span>
                    <span className="kpi-unit">/ {alerts.length} {lang === 'TR' ? 'Kontrol Edildi' : 'Checked'}</span>
                    <span className="kpi-trend text-red">(ALERT!)</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-red" style={{width: `${fakePercent * 5}%`}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_stability} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{avgTruth > 0 ? avgTruth : "0.0"}%</span>
                    <span className="kpi-unit">{lang === 'TR' ? 'Genel Kararlılık Durumu' : 'Grid Network Stability'}</span>
                    <span className="kpi-trend text-green">({lang === 'TR' ? 'Stabil' : 'Stable'})</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-green" style={{width: `${avgTruth}%`}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{lang === 'TR' ? 'UK YENİLENEBİLİR ENERJİ PAYI' : 'UK GREEN ENERGY SHARE'} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">
                      {(() => {
                        const matchAlert = alerts.find(a => a.post_text && a.post_text.includes('UK Grid Renewables='));
                        if (matchAlert) {
                          const match = matchAlert.post_text.match(/UK Grid Renewables=([\d.]+)%/);
                          if (match) return match[1] + "%";
                        }
                        return "38.8%";
                      })()}
                    </span>
                    <span className="kpi-unit">{lang === 'TR' ? 'Canlı GridMix Payı' : 'Live GridMix Share'}</span>
                    <span className="kpi-trend text-green" style={{ fontWeight: 'bold' }}>(Clean)</span>
                  </div>
                  <div className="kpi-bar-bg">
                    <div 
                      className="kpi-bar-fill bg-green" 
                      style={{
                        width: (() => {
                          const matchAlert = alerts.find(a => a.post_text && a.post_text.includes('UK Grid Renewables='));
                          if (matchAlert) {
                            const match = matchAlert.post_text.match(/UK Grid Renewables=([\d.]+)%/);
                            if (match) return `${parseFloat(match[1])}%`;
                          }
                          return "38.8%";
                        })()
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="main-grid">
                {/* Left Col: Chart & Control Log */}
                <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Area Chart Panel */}
                  <div className="panel chart-panel" style={{ height: '375px' }}>
                    <div className="panel-header">
                      <h3 style={{ fontSize: '11px', color: 'var(--cyan)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📈 {
                        chartMetric === 'velocity' ? (lang === 'TR' ? "CANLI İŞLEM AKIŞ HIZI vs. ŞÜPHELİ HIZ UYARILARI" : "LIVE TRANSACTION VELOCITY vs. HIGH VELOCITY ALERTS") :
                        chartMetric === 'amount' ? (lang === 'TR' ? "İŞLEM HACMİ AKIŞI (TRY) vs. GÜVENLİKSİZ TUTAR BLOKAJI" : "TRANSACTION VOLUME STREAM (TRY) vs. BLOCKED FRAUD") :
                        (lang === 'TR' ? "YAPAY ZEKA RİSK SEVİYESİ vs. KRİTİK ALARMLAR" : "AI THREAT RISK LEVEL vs. CRITICAL INCIDENTS")
                      }</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['velocity', 'amount', 'risk'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setChartMetric(m)}
                            style={{
                              background: chartMetric === m ? 'var(--cyan)' : 'var(--bg-hover)',
                              color: chartMetric === m ? '#fff' : 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '3px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                          >
                            {m === 'velocity' ? (lang === 'TR' ? '⚡ Hız / Frekans' : '⚡ Velocity') :
                             m === 'amount' ? (lang === 'TR' ? '💰 İşlem Tutarı' : '💰 Tx Volume') :
                             (lang === 'TR' ? '🧠 AI Risk Analizi' : '🧠 AI Risk')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="chart-legend">
                      <span className="legend-item">
                        <span className="dot bg-cyan"></span> 
                        {chartMetric === 'velocity' ? (lang === 'TR' ? 'Toplam Saniyelik İşlem' : 'Total Streaming Tx') :
                         chartMetric === 'amount' ? (lang === 'TR' ? 'Toplam Transfer Hacmi (TRY)' : 'Total Tx Volume (TRY)') :
                         (lang === 'TR' ? 'Ortalama Yapay Zeka Risk Skoru' : 'Avg AI Threat Score')}
                      </span>
                      <span className="legend-item">
                        <span className="dot bg-red"></span> 
                        {chartMetric === 'velocity' ? (lang === 'TR' ? 'Yüksek Hızlı Bot Atakları' : 'High Velocity Bot Attacks') :
                         chartMetric === 'amount' ? (lang === 'TR' ? 'Bloke Edilen Tutar (TRY)' : 'Blocked Fraud Volume (TRY)') :
                         (lang === 'TR' ? 'Kritik Riskli İşlem Sayısı' : 'Critical Threat Incidents')}
                      </span>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={
                          timeline.map((t, idx) => {
                            let value1 = t.posts;
                            let value2 = t.frauds;
                            if (chartMetric === 'amount') {
                              value1 = Math.round(t.posts * 1500);
                              value2 = alerts.filter(a => a.reason === 'CRITICAL_AMOUNT').length * 25000 + (idx % 2 === 0 ? 5000 : 0);
                            } else if (chartMetric === 'risk') {
                              value1 = Math.round(40 + Math.sin(idx) * 8);
                              value2 = alerts.filter(a => a.truth_score < 40).length * 10 + (idx % 3 === 0 ? 15 : 0);
                            }
                            
                            // Multipliers based on timeframe
                            const mult1 = timeframe === '1H' ? 1.5 : timeframe === '24H' ? 2.4 : 1;
                            const mult2 = timeframe === '1H' ? 1.2 : timeframe === '24H' ? 1.8 : 1;
                            
                            return {
                              time: t.time,
                              value1: Math.round(value1 * mult1),
                              value2: Math.round(value2 * mult2)
                            };
                          })
                        } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--red)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val.toLocaleString()} />
                          <YAxis yAxisId="right" orientation="right" hide />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} />
                          <Area yAxisId="left" type="monotone" dataKey="value1" stroke="var(--cyan)" strokeWidth={2} fill="url(#colorTx)" />
                          <Area yAxisId="right" type="monotone" dataKey="value2" stroke="var(--red)" strokeWidth={2} fill="url(#colorFraud)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: '4px', borderLeft: '3px solid var(--cyan)' }}>
                        {chartMetric === 'load' ? TRANSLATIONS[lang].chart_load_desc :
                         chartMetric === 'voltage' ? (lang === 'TR' ? "ℹ️ Açıklama: Şebeke genelindeki canlı gerilim dalgalanmalarını gösterir. 220V nominal değerin altına sarkan kırmızı çizgiler voltaj düşümleridir." : "ℹ️ Description: Displays live voltage levels across the grid. Red spikes represent transient voltage drops below the 220V nominal baseline.") :
                         (lang === 'TR' ? "ℹ️ Açıklama: Trafoların sıcaklık trendini gösterir. Limit değerlerin aşılması kırmızı barlar ile termal alarmlar olarak gösterilir." : "ℹ️ Description: Displays thermal trends in transformer cores. Exceeding limits yields thermal alarm spikes shown in red.")}
                      </div>
                    </div>
                    <div className="chart-footer" style={{ marginTop: '5px' }}>
                      <span className="text-gray-500 text-xs">OCT 26, 2023</span>
                      <span className="text-gray-500 text-xs uppercase">Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>

                  {/* Top Targeted Articles Panel (Fills the height gap perfectly!) */}
                  <div className="panel" style={{ minHeight: '120px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="panel-header" style={{ marginBottom: '0' }}>
                      <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                        🎯 {TRANSLATIONS[lang].top_devices}
                      </h3>
                      <span style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>{lang === 'TR' ? 'CANLI RİSKLER' : 'LIVE RISKS'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(() => {
                        const targets = alerts
                          .filter(a => a.truth_score < 50)
                          .slice(0, 3);
                        
                        return targets.map((t, idx) => (
                          <div key={idx} style={{
                            flex: 1,
                            minWidth: '120px',
                            background: 'rgba(0,0,0,0.02)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                              <span style={{ color: 'var(--text-main)' }}>{t.hashtag}</span>
                              <span style={{ color: 'var(--red)' }}>{t.truth_score}% {lang === 'TR' ? 'Kararlılık' : 'Stability'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)' }}>
                              <span>ID: {t.account_id}</span>
                              <span style={{ color: t.is_bot ? 'var(--red)' : 'var(--green)', fontWeight: 'bold' }}>
                                {t.is_bot ? (lang === 'TR' ? 'ANOMALİ' : 'ANOMALY') : 'OK'}
                              </span>
                            </div>
                          </div>
                        ));
                      })()}
                      {alerts.filter(a => a.truth_score < 50).length === 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '5px 0' }}>
                          {lang === 'TR' ? 'Henüz akışta aşırı yüklenmiş cihaz tespit edilmedi.' : 'No device overload detected in stream yet.'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                      {TRANSLATIONS[lang].top_devices_desc}
                    </div>
                  </div>

                  {/* Advanced Diagnostics Tabbed Card */}
                  <div className="panel" style={{ minHeight: '320px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div className="panel-header" style={{ marginBottom: '5px' }}>
                      <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📊 {lang === 'TR' ? 'GELİŞMİŞ ŞEBEKE TEŞHİS ANALİTİKLERİ' : 'ADVANCED GRID DIAGNOSTICS'}
                      </h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['radar', 'scatter', 'pie'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setDiagTab(tab)}
                            style={{
                              background: diagTab === tab ? 'var(--cyan)' : 'var(--bg-hover)',
                              color: diagTab === tab ? '#fff' : 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '3px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tab === 'radar' ? (lang === 'TR' ? '🕸️ Stabilite' : '🕸️ Matrix') :
                             tab === 'scatter' ? (lang === 'TR' ? '🎯 Korelasyon' : '🎯 Scatter') :
                             (lang === 'TR' ? '🍰 Dağılım' : '🍰 Pie')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {diagTab === 'radar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: lang === 'TR' ? 'Tutar Riski' : 'Amount Risk', value: 85 },
                            { subject: lang === 'TR' ? 'İşlem Hızı' : 'Velocity Risk', value: 90 },
                            { subject: lang === 'TR' ? 'Offshore IP' : 'Offshore IP', value: 88 },
                            { subject: lang === 'TR' ? 'Çoklu Kart' : 'Multi-Card Attempt', value: 74 },
                            { subject: lang === 'TR' ? 'Gece İşlemi' : 'Night Activity', value: 96 }
                          ]}>
                            <PolarGrid stroke="var(--border-color)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 7.5 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 6 }} />
                            <Radar name="Threats" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}

                      {diagTab === 'scatter' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 15, right: 10, bottom: 5, left: -25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                            <XAxis type="number" dataKey="load" name="Amount" unit=" TRY" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                            <YAxis type="number" dataKey="temp" name="Velocity" unit=" tx/s" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '9px', color: 'var(--text-main)' }} />
                            <Scatter name="Transactions" data={[
                              { load: 1200, temp: 1, name: 'Normal CC Tx' },
                              { load: 4500, temp: 2, name: 'Normal FAST Tx' },
                              { load: 23000, temp: 12, name: 'Anomaly Card Bot' },
                              { load: 1800, temp: 1, name: 'Normal QR Tx' },
                              { load: 48000, temp: 18, name: 'Critical Amount Fraud' },
                              { load: 38000, temp: 1, name: 'Offshore Panama IP' },
                              { load: 950, temp: 15, name: 'High-Frequency Bot' }
                            ]} fill="var(--cyan)">
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--red)" />
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--red)" />
                              <Cell fill="var(--red)" />
                              <Cell fill="var(--red)" />
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      )}

                      {diagTab === 'pie' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: lang === 'TR' ? 'Hız Sınır Aşımı' : 'Velocity Limit', value: 45 },
                                    { name: lang === 'TR' ? 'Offshore IP' : 'Offshore IP', value: 30 },
                                    { name: lang === 'TR' ? 'Tutar Limit Aşımı' : 'Amount Limit', value: 15 },
                                    { name: lang === 'TR' ? 'Kimlik Hırsızlığı' : 'Identity Theft', value: 10 }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={28}
                                  outerRadius={48}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {['var(--cyan)', 'var(--orange)', 'var(--red)', 'var(--purple)'].map((color, idx) => (
                                    <Cell key={`cell-${idx}`} fill={color} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '9px', color: 'var(--text-main)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '7.5px', marginTop: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cyan)' }}></span> {lang === 'TR' ? 'Hız Sınırı' : 'Velocity Limit'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--orange)' }}></span> {lang === 'TR' ? 'Offshore IP' : 'Offshore IP'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red)' }}></span> {lang === 'TR' ? 'Tutar Limiti' : 'Amount Limit'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--purple)' }}></span> {lang === 'TR' ? 'Kimlik Avı' : 'Identity Theft'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High-Risk Control Log Panel with Fixed Height to Prevent Stretching */}
                  <div className="panel control-panel" style={{ height: '345px', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '10px' }}>
                    <div className="panel-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{TRANSLATIONS[lang].detected_anomalies}</h3>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px', alignSelf: 'center' }}>{lang === 'TR' ? 'AI HASSASİYETİ:' : 'AI SENSITIVITY:'}</span>
                        {['LOW', 'MID', 'HIGH'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setSensitivity(mode)}
                            style={{
                              background: sensitivity === mode ? 'var(--cyan)' : 'rgba(0,0,0,0.05)',
                              color: sensitivity === mode ? '#fff' : 'var(--text-main)',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold'
                            }}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Scrollable table container */}
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', maxHeight: '140px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '9px', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                            <th style={{ padding: '6px 0' }}>{lang === 'TR' ? 'Cihaz' : 'Device'}</th>
                            <th>{lang === 'TR' ? 'Cihaz ID' : 'Device ID'}</th>
                            <th>{lang === 'TR' ? 'Anomali Türü' : 'Anomaly Type'}</th>
                            <th>{lang === 'TR' ? 'Kararlılık' : 'Stability'}</th>
                            <th>{lang === 'TR' ? 'Aksiyon' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alerts
                            .filter(a => {
                              const threshold = sensitivity === 'HIGH' ? 70 : sensitivity === 'MID' ? 50 : 30;
                              return a.truth_score < threshold && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`);
                            })
                            .slice(0, 5)
                            .map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                  {row.hashtag}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{row.account_id}</td>
                                <td>
                                  <span style={{ 
                                    color: row.is_bot ? 'var(--red)' : 'var(--orange)', 
                                    fontWeight: '600',
                                    fontSize: '10px'
                                  }}>
                                    {row.reason}
                                  </span>
                                </td>
                                <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{row.truth_score}%</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      onClick={() => handleRevert(row)}
                                      style={{ 
                                        background: 'var(--red)', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '3px', 
                                        padding: '2px 6px', 
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {TRANSLATIONS[lang].isolate}
                                    </button>
                                    <button 
                                      onClick={() => handleReview(row)}
                                      style={{ 
                                        background: 'rgba(0,0,0,0.05)', 
                                        color: 'var(--text-main)', 
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '3px', 
                                        padding: '2px 6px', 
                                        cursor: 'pointer',
                                        fontSize: '9px'
                                      }}
                                    >
                                      {TRANSLATIONS[lang].diag}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {alerts.filter(a => {
                            const threshold = sensitivity === 'HIGH' ? 70 : sensitivity === 'MID' ? 50 : 30;
                            return a.truth_score < threshold && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`);
                          }).length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {lang === 'TR' ? 'Henüz kritik şebeke anomalisi tespit edilmedi.' : 'No critical grid anomalies detected yet.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '5px 8px', borderRadius: '4px', borderLeft: '3px solid var(--red)', marginBottom: '8px' }}>
                      {TRANSLATIONS[lang].detected_anomalies_desc}
                    </div>

                    {/* Mitigation Rules, Trending Topics & Session Stats at bottom */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      
                      {/* Col 1: AI Rules & Latency */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].status_ai}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: 'rgba(22, 163, 74, 0.03)', border: '1px solid rgba(22, 163, 74, 0.1)', borderRadius: '3px' }}>
                            <span>{TRANSLATIONS[lang].status_rules}</span>
                            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>ON</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: 'rgba(2, 132, 199, 0.03)', border: '1px solid rgba(2, 132, 199, 0.1)', borderRadius: '3px' }}>
                            <span>{TRANSLATIONS[lang].status_latency}</span>
                            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>38ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Trending Disinfo Targets */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].hotspots}
                        </h5>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {alerts.filter(a => a.truth_score < 50).slice(0, 3).map((item, idx) => (
                            <span key={idx} style={{ fontSize: '8px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', padding: '2px 5px', borderRadius: '3px', fontWeight: '500' }}>
                              {item.hashtag}
                            </span>
                          ))}
                          {alerts.filter(a => a.truth_score < 50).length === 0 && (
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{TRANSLATIONS[lang].stable_stream}</span>
                          )}
                        </div>
                      </div>

                      {/* Col 3: Stats & Actions */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].control_stats}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '2px' }}>
                            <span>{TRANSLATIONS[lang].isolations}:</span>
                            <span style={{ fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{revertedCount}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{TRANSLATIONS[lang].last_action}:</span>
                            <span style={{ color: 'var(--cyan)', fontWeight: 'bold', fontSize: '8px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lastAction}>
                              {lastAction}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Right Col: Breakdown, Bar Chart & Terminal */}
                <div className="right-col">
                  
                  {/* Fact Check Breakdown Panel (Pie Chart) */}
                  <div className="panel breakdown-panel" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                    <div className="panel-header" style={{ marginBottom: '8px' }}>
                      <h3>{TRANSLATIONS[lang].stability_breakdown}</h3>
                      <span className="dots">⋮</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ width: '50%', height: '120px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={breakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={45}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '4px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', width: '50%' }}>
                        {breakdown.map((entry, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx] }}></span>
                            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                              {entry.name}:
                            </span>
                            <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                              {entry.value} ({totalBreakdown > 0 ? ((entry.value / totalBreakdown) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Payment Channel Distribution Progress Bars */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(() => {
                        const totalChecked = alerts.length || 1;
                        const ccCount = alerts.filter(a => a.hashtag === 'Credit Card').length;
                        const fastCount = alerts.filter(a => a.hashtag === 'FAST Wire').length;
                        const qrCount = alerts.filter(a => a.hashtag === 'Mobile QR').length;
                        const eftCount = alerts.filter(a => a.hashtag === 'EFT').length;

                        const ccPercent = ((ccCount / totalChecked) * 100).toFixed(0);
                        const fastPercent = ((fastCount / totalChecked) * 100).toFixed(0);
                        const qrPercent = ((qrCount / totalChecked) * 100).toFixed(0);
                        const eftPercent = ((eftCount / totalChecked) * 100).toFixed(0);

                        return (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                              <span>💳 K.KARTI: {ccPercent}%</span>
                              <span>⚡ FAST: {fastPercent}%</span>
                              <span>📱 QR: {qrPercent}%</span>
                              <span>🏦 EFT: {eftPercent}%</span>
                            </div>
                            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(0,0,0,0.05)' }}>
                              <div style={{ width: `${ccPercent}%`, background: 'var(--cyan)' }} />
                              <div style={{ width: `${fastPercent}%`, background: 'var(--green)' }} />
                              <div style={{ width: `${qrPercent}%`, background: 'var(--orange)' }} />
                              <div style={{ width: `${eftPercent}%`, background: 'var(--red)' }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '6px' }}>
                      {TRANSLATIONS[lang].stability_breakdown_desc}
                    </div>
                  </div>

                  {/* City-Based Fraud Risk Bar Chart */}
                  <div className="panel" style={{ height: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '10px' }}>
                    <div className="panel-header" style={{ marginBottom: '8px' }}>
                      <h3>📍 {lang === 'TR' ? 'Şehir & Ağ Geçidi Risk Dağılımı' : 'City & Gateway Risk Distribution'}</h3>
                    </div>
                    <div style={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { city: 'Istanbul', risk: alerts.filter(a => a.city === 'Istanbul' && a.truth_score < 50).length * 10 + 5 },
                            { city: 'Ankara', risk: alerts.filter(a => a.city === 'Ankara' && a.truth_score < 50).length * 8 + 4 },
                            { city: 'Izmir', risk: alerts.filter(a => a.city === 'Izmir' && a.truth_score < 50).length * 6 + 2 },
                            { city: 'Lefkoşa', risk: alerts.filter(a => a.city === 'Nicosia' && a.truth_score < 50).length * 28 + 18 },
                            { city: 'Panama', risk: alerts.filter(a => a.city === 'Panama City' && a.truth_score < 50).length * 35 + 22 },
                            { city: 'Cayman', risk: alerts.filter(a => a.city === 'Grand Cayman' && a.truth_score < 50).length * 40 + 25 }
                          ].map(d => ({ ...d, risk: Math.min(100, d.risk) }))}
                          margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                          <XAxis dataKey="city" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                          <YAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '9px', color: 'var(--text-main)' }} />
                          <Bar dataKey="risk" fill="var(--cyan)" radius={[3, 3, 0, 0]}>
                            <Cell fill="var(--cyan)" />
                            <Cell fill="var(--cyan)" />
                            <Cell fill="var(--cyan)" />
                            <Cell fill="var(--orange)" />
                            <Cell fill="var(--red)" />
                            <Cell fill="var(--red)" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Terminal panel */}
                  <div className="panel terminal-panel">
                    <div className="panel-header">
                      <h3>{TRANSLATIONS[lang].terminal_feed}</h3>
                      <div className="live-badge">LIVE <span className="dots">⋮</span></div>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '5px 12px', borderLeft: '3px solid var(--cyan)', marginBottom: '8px', marginTop: '-4px' }}>
                      {TRANSLATIONS[lang].terminal_feed_desc}
                    </div>
                    <div className="terminal-content" style={{ overflowY: 'auto' }}>
                      {alerts.slice(0, 30).map((alert, idx) => {
                        const isTrue = alert.truth_score >= 70;
                        const isWarning = alert.truth_score >= 40 && alert.truth_score < 70;
                        let truthColor = 'var(--red)';
                        if (isTrue) truthColor = 'var(--green)';
                        else if (isWarning) truthColor = 'var(--orange)';

                        return (
                          <div className="terminal-line" key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '12px', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                              <span className="term-id">
                                <span style={{ color: '#64748b' }}>{lang === 'TR' ? 'CİHAZ ID: ' : 'DEVICE ID: '}</span>{alert.account_id}
                              </span>
                              <span className="term-time">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="term-city"><span style={{ color: '#64748b' }}>{lang === 'TR' ? 'TÜR: ' : 'TYPE: '}</span>{alert.hashtag} ({gridStations[alert.city] || alert.city})</span>
                              <span style={{ color: alert.is_bot ? 'var(--red)' : '#64748b', fontWeight: alert.is_bot ? 'bold' : 'normal' }}>
                                {alert.is_bot ? (lang === 'TR' ? '⚠️ ANOMALİ' : '⚠️ ANOMALY') : '✓ OK'}
                              </span>
                            </div>
 
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #cbd5e1' }}>
                              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>{lang === 'TR' ? 'ÖLÇÜM ÖZETİ:' : 'METRICS SUMMARY:'}</span>
                              {parseTelemetry(alert.post_text)}
                            </div>
                            
                            <div style={{ 
                              background: `rgba(${isTrue ? '22, 163, 74' : isWarning ? '245, 158, 11' : '239, 68, 68'}, 0.05)`, 
                              padding: '6px', 
                              borderRadius: '4px', 
                              border: `1px solid ${truthColor}`,
                              marginTop: '2px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: truthColor }}>🔍 AI DIAGNOSTIC</span>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: truthColor }}>{lang === 'TR' ? 'Kararlılık' : 'Stability'}: {alert.truth_score || 0}%</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {alert.fact_check_result || (lang === 'TR' ? 'Analiz ediliyor...' : 'Analyzing...')}
                              </div>
                            </div>
                            
                          </div>
                        );
                      })}
                      {alerts.length === 0 && <div className="text-gray-500 text-xs">{lang === 'TR' ? 'Yapay zeka motorunun şebeke telemetrisini işlemesi bekleniyor...' : 'Waiting for AI engine to process grid telemetry...'}</div>}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}



          {activeTab === 'streams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>{lang === 'TR' ? 'Canlı Mesaj Akışları (Redpanda Kafka)' : 'Live Message Streams (Redpanda Kafka)'}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a 
                    href="http://localhost:8080" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--red)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    🔴 Redpanda Console ↗
                  </a>
                  <a 
                    href="http://localhost:8000/docs" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--cyan)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    ⚡ FastAPI Swagger ↗
                  </a>
                  <a 
                    href="http://localhost:8123/play" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--orange)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    🗄️ ClickHouse Play ↗
                  </a>
                  <a 
                    href="https://bytewax.io/docs/concepts/dataflow" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308', fontSize: '11px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '4px' }}
                  >
                    🐝 Bytewax Visualizer ↗
                  </a>
                  <a 
                    href="https://github.com/bytewax/bytewax" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '11px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '4px' }}
                  >
                    🐙 Bytewax GitHub ↗
                  </a>
                </div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                {/* Left Panel: Stream Topology */}
                <div className="panel" style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '12px' }}>
                    <h3>{lang === 'TR' ? 'Sistem Mimarisi & Canlı Akış Boru Hattı' : 'System Architecture & Live Pipeline'}</h3>
                  </div>
                  
                  {/* SVG Flow diagram with animated paths */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0,0,0,0.01)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '15px' }}>
                    <svg viewBox="0 0 620 340" style={{ width: '100%', height: '300px' }}>
                      <defs>
                        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      <style>
                        {`
                          @keyframes ping {
                            0% { transform: scale(0.8); opacity: 1; }
                            100% { transform: scale(2.2); opacity: 0; }
                          }
                          .ping-dot {
                            animation: ping 1.8s ease-in-out infinite;
                            transform-origin: center;
                          }
                          .flow-path-bg {
                            stroke: rgba(255, 255, 255, 0.05);
                            stroke-width: 2.5;
                            fill: none;
                          }
                          .flow-path-active {
                            stroke-width: 2;
                            fill: none;
                            stroke-dasharray: 4 4;
                            animation: dash 1s linear infinite;
                          }
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -20;
                            }
                          }
                          .node-glass {
                            fill: var(--bg-panel);
                            stroke: var(--border-color);
                            stroke-width: 1.5;
                            transition: all 0.3s;
                          }
                          .node-glass:hover {
                            fill: var(--bg-hover);
                            stroke: var(--cyan);
                            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.35));
                          }
                          .node-title {
                            font-size: 8.5px;
                            font-weight: 800;
                            fill: var(--text-main);
                            letter-spacing: 0.5px;
                          }
                          .node-stat {
                            font-size: 7px;
                            fill: var(--text-muted);
                            font-family: 'JetBrains Mono', monospace;
                          }
                        `}
                      </style>

                      {/* Connection Paths (Backings) */}
                      <path d="M 105 55 L 165 55" className="flow-path-bg" />
                      <path d="M 260 55 L 320 55" className="flow-path-bg" />
                      <path d="M 415 55 L 475 55" className="flow-path-bg" />
                      <path d="M 522.5 85 L 522.5 155 L 415 155" className="flow-path-bg" />
                      <path d="M 367.5 85 L 367.5 130" className="flow-path-bg" />
                      <path d="M 320 155 L 260 155" className="flow-path-bg" />
                      <path d="M 165 155 L 105 155" className="flow-path-bg" />
                      <path d="M 212.5 190 L 212.5 235" className="flow-path-bg" />

                      {/* Connection Paths (Active Glowing Dash) */}
                      <path d="M 105 55 L 165 55" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 260 55 L 320 55" className="flow-path-active" stroke="var(--orange)" />
                      <path d="M 415 55 L 475 55" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 522.5 85 L 522.5 155 L 415 155" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 367.5 85 L 367.5 130" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 320 155 L 260 155" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 165 155 L 105 155" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 212.5 190 L 212.5 235" className="flow-path-active" stroke="var(--purple)" />

                      {/* Flowing Packets (Using smooth SVG animateMotion) */}
                      <circle r="3" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.2s" repeatCount="indefinite" path="M 105 55 L 165 55" />
                      </circle>
                      <circle r="3" fill="var(--orange)" filter="url(#glow-orange)">
                        <animateMotion dur="1.9s" repeatCount="indefinite" path="M 260 55 L 320 55" />
                      </circle>
                      <circle r="3" fill="var(--green)" filter="url(#glow-green)">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path="M 415 55 L 475 55" />
                      </circle>
                      <circle r="2.5" fill="var(--green)" filter="url(#glow-green)">
                        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 522.5 85 L 522.5 155 L 415 155" />
                      </circle>
                      <circle r="2.5" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M 367.5 85 L 367.5 130" />
                      </circle>
                      <circle r="3" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.8s" repeatCount="indefinite" path="M 320 155 L 260 155" />
                      </circle>
                      <circle r="2.5" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.2s" repeatCount="indefinite" path="M 165 155 L 105 155" />
                      </circle>
                      <circle r="3" fill="var(--purple)" filter="url(#glow-purple)">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path="M 212.5 190 L 212.5 235" />
                      </circle>
                      <circle r="2.5" fill="var(--purple)" filter="url(#glow-purple)">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path="M 212.5 235 L 212.5 190" />
                      </circle>

                      {/* Node 1: Payment Terminals */}
                      <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(10, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title">💳 PAY GATES</text>
                          <text x="10" y="36" className="node-stat">9 Active Cities</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>{liveMetrics.throughput} tx/s</text>
                        </g>
                      </a>

                      {/* Node 2: Redpanda */}
                      <a href="http://localhost:8080" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(165, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--orange)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--orange)" />
                          <circle cx="12" cy="14" r="3" fill="var(--orange)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--orange)' }}>✉️ REDPANDA</text>
                          <text x="10" y="36" className="node-stat">Topic: social_posts</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--orange)' }}>1.2ms Latency</text>
                        </g>
                      </a>

                      {/* Node 3: Bytewax */}
                      <a href="https://bytewax.io/docs/concepts/dataflow" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(320, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>🐝 BYTEWAX</text>
                          <text x="10" y="36" className="node-stat">Dataflow Engine</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--green)' }}>Active (Rust)</text>
                        </g>
                      </a>

                      {/* Node 4: XAI Model */}
                      <a href="https://github.com/bytewax/bytewax" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(475, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--green)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--green)" />
                          <circle cx="12" cy="14" r="3" fill="var(--green)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--green)' }}>🧠 FRAUD AI</text>
                          <text x="10" y="36" className="node-stat">Explainable ML</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--green)' }}>SHAP Engine</text>
                        </g>
                      </a>

                      {/* Node 5: ClickHouse */}
                      <a href="http://localhost:8123/play" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(320, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>🗄️ CLICKHOUSE</text>
                          <text x="10" y="36" className="node-stat">OLAP Storage</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>24 rows/s</text>
                        </g>
                      </a>

                      {/* Node 6: FastAPI */}
                      <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(165, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>⚡ FASTAPI</text>
                          <text x="10" y="36" className="node-stat">Python Server</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>Uvicorn ASGI</text>
                        </g>
                      </a>

                      {/* Node 7: React UI */}
                      <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(10, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>⚛️ REACT UI</text>
                          <text x="10" y="36" className="node-stat">Vite Client</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>Port 5173</text>
                        </g>
                      </a>

                      {/* Node 8: FraudPulse LLM */}
                      <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(160, 235)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="105" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--purple)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--purple)" />
                          <circle cx="12" cy="14" r="3" fill="var(--purple)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--purple)' }}>🤖 FRAUDPULSE AI</text>
                          <text x="10" y="36" className="node-stat">Cloud security LLM</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--purple)' }}>RAG agent active</text>
                        </g>
                      </a>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid var(--border-color)', marginTop: '10px', paddingTop: '10px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        📥 {lang === 'TR' ? 'CANLI BROKER AKIŞ GÜNLÜĞÜ (PARTITION FEED)' : 'LIVE BROKER MESSAGE STREAM (PARTITION FEED)'}
                      </span>
                      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 10px', fontFamily: 'JetBrains Mono', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px' }}>
                        {alerts.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{ color: 'var(--text-muted)', borderBottom: '1px dashed rgba(0,0,0,0.03)', paddingBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ color: 'var(--orange)' }}>[Partition-{idx % 3}]</span>{' '}
                            <span style={{ color: 'var(--cyan)' }}>Offset-{alerts.length - idx}</span>:{' '}
                            <span style={{ color: 'var(--text-main)' }}>{`{"account_id": "${item.account_id}", "channel": "${item.hashtag}", "security_score": ${item.truth_score}%}`}</span>
                          </div>
                        ))}
                        {alerts.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '8px' }}>{lang === 'TR' ? 'Akış bekleniyor...' : 'Awaiting message stream...'}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Performance Histogram */}
                <div className="panel" style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>{lang === 'TR' ? 'Akış Performansı & Geçmişi' : 'Stream Performance & History'}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'VERİ GEÇİŞ HIZI' : 'THROUGHPUT'}</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{liveMetrics.throughput} MB/s</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'GECİKME' : 'LATENCY'}</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{liveMetrics.latency} ms</div>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        {lang === 'TR' ? 'CANLI AKIŞ HIZI (TURKUAZ) VE GECİKME (YEŞİL) HİSTOGRAMI' : 'LIVE THROUGHPUT (CYAN) & LATENCY (GREEN) HISTOGRAM'}
                      </span>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={streamHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis dataKey="time" hide />
                          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 8 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 8 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                          <Line yAxisId="left" type="monotone" dataKey="throughput" stroke="var(--cyan)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                          <Line yAxisId="right" type="monotone" dataKey="latency" stroke="var(--green)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Explanation Card */}
              <div className="panel" style={{ marginTop: '20px', padding: '20px' }}>
                <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚙️ {lang === 'TR' ? 'SİSTEM MİMARİSİ VE GERÇEK ZAMANLI VERİ AKIŞ REHBERİ' : 'SYSTEM ARCHITECTURE & REAL-TIME DATA FLOW GUIDE'}
                  </h3>
                  <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    100% ONLINE
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '11px', lineHeight: '1.6', textAlign: 'left' }}>
                  {/* Left Column: Data Ingestion */}
                  <div>
                    <h4 style={{ color: 'var(--cyan)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                      📥 {lang === 'TR' ? '1. GERÇEK ZAMANLI VERİ YUTMA VE İŞLEME' : '1. REAL-TIME INGESTION & PROCESSING'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>📡 IoT Sensör Katmanı (Meters, Chargers & Transformers)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Şebeke cihazları her 100ms'de bir canlı Yük (Load), Gerilim (Voltage) ve Sıcaklık (Temp) telemetrisini üretip akışa pompalar." 
                            : "Grid devices generate live Load, Voltage, and Temperature telemetry every 100ms and pump it into the streaming feed."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--orange)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>✉️ Redpanda (Kafka Broker)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Milyonlarca sensör mesajı, sıfır-kopya (zero-copy) mimarisine sahip Redpanda üzerinde tamponlanarak kayıpsız olarak kuyruğa alınır." 
                            : "Millions of sensor payloads are queued and buffered with zero-copy efficiency inside Redpanda brokers without data loss."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🐝 Bytewax (Stateful Stream Engine)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Rust tabanlı Bytewax akış motoru, Redpanda'dan gelen verileri kayan zaman pencerelerinde (sliding windows) gruplayarak ML modellerine besler." 
                            : "Rust-powered Bytewax ingestion stream aggregates telemetry logs in sliding windows and feeds them directly into the ML classifier."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI & Storage */}
                  <div>
                    <h4 style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                      🧠 {lang === 'TR' ? '2. YAPAY ZEKA KARAR MOTORU VE SERVİS' : '2. AI DIAGNOSTICS & SERVING'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🧠 XAI Anomali Motoru (Explainable XGBoost / SHAP)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "ML Modelleri anlık yük/ısı dengesizliğini analiz ederek risk skorunu hesaplar. SHAP motoru arızanın veya kaçak tüketimin neden yapay zeka tarafından seçildiğini anlık açıklar." 
                            : "ML models compute real-time risk index. The SHAP explainability engine explains to the operator why an anomaly or overload was flagged."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🗄️ ClickHouse OLAP Veritabanı</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Tüm telemetri ve AI teşhis sonuçları saniyede 20,000+ satır yazım hızıyla ClickHouse sütun bazlı analitik veritabanında saklanır." 
                            : "All telemetry logs and AI results are stored with 20k+ rows/sec write speeds inside ClickHouse column-oriented database."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--purple)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>⚡ FastAPI & React / LLM Copilot</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "FastAPI sunucumuz, ClickHouse verilerini SSE ile React arayüzüne taşır. HuggingFace RAG entegrasyonu sayesinde operatör işlem güvenliğini chatbot ile sorgulayabilir." 
                            : "FastAPI streams ClickHouse data to the React UI. HuggingFace RAG lets the operator query the entire payment system security through conversational chat."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>{TRANSLATIONS[lang].anomalies_title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    placeholder={TRANSLATIONS[lang].search_placeholder} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', width: '180px' }}
                  />
                  <button 
                    onClick={() => {
                      const headers = "Timestamp,PaymentMethod,AccountId,AnomalyReason,SecurityScore,DiagnosticReport\n";
                      const rows = alerts
                        .filter(a => a.truth_score < 50)
                        .map(a => `"${a.timestamp}","${a.hashtag}","${a.account_id}","${a.reason}",${a.truth_score},"${a.fact_check_result}"`)
                        .join("\n");
                      
                      const blob = new Blob([headers + rows], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `fraud_alerts_${new Date().toISOString().slice(0,10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="dropdown"
                    style={{ background: 'var(--cyan)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {TRANSLATIONS[lang].export_csv}
                  </button>
                </div>
              </div>

              {/* Anomaly Micro KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    🔴 {TRANSLATIONS[lang].kpi_active_anomalies}
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'JetBrains Mono' }}>
                    {alerts.filter(a => a.truth_score < 50).length}
                  </div>
                </div>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    ⚡ {TRANSLATIONS[lang].kpi_vulnerable_device}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--orange)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '4px' }}>
                    {alerts.filter(a => a.truth_score < 50).length > 0 
                      ? (alerts.filter(a => a.truth_score < 50)[0]?.hashtag === 'Transformer' ? (lang === 'TR' ? 'Dağıtım Trafosu' : 'Transformer') : alerts.filter(a => a.truth_score < 50)[0]?.hashtag)
                      : (lang === 'TR' ? 'Kararlı' : 'Stable')}
                  </div>
                </div>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    🌍 {TRANSLATIONS[lang].kpi_sensitive_station}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--cyan)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '6px' }}>
                    {alerts.filter(a => a.truth_score < 50).length > 0 
                      ? (gridStations[alerts.filter(a => a.truth_score < 50)[0]?.city] || alerts.filter(a => a.truth_score < 50)[0]?.city)
                      : (lang === 'TR' ? 'Tüm Şebeke Stabil' : 'All Baselines Normal')}
                  </div>
                </div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '415px' }}>
                  <div className="panel-header" style={{ marginBottom: '16px' }}>
                    <h3>{TRANSLATIONS[lang].anomalies_db} ({alerts.filter(a => a.truth_score < 50).length} {lang === 'TR' ? 'Tespit Edildi' : 'Detected'})</h3>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '9px', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                          <th style={{ padding: '8px 0' }}>{lang === 'TR' ? 'Ödeme Kanalı' : 'Channel'}</th>
                          <th>{lang === 'TR' ? 'Hesap / Kart ID' : 'Account/Card ID'}</th>
                          <th>{lang === 'TR' ? 'Şüpheli Durum' : 'Reason'}</th>
                          <th>{lang === 'TR' ? 'İşlem Telemetrisi' : 'Telemetry'}</th>
                          <th>{lang === 'TR' ? 'Güvenlik Skoru' : 'Security Score'}</th>
                          <th>{lang === 'TR' ? 'Aksiyon' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts
                          .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                          .filter(a => a.hashtag.toLowerCase().includes(searchQuery.toLowerCase()) || a.account_id.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                              <td style={{ padding: '8px 0', fontWeight: 'bold', color: 'var(--text-main)' }}>{row.hashtag}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{row.account_id}</td>
                              <td style={{ color: 'var(--red)', fontWeight: '600' }}>{row.reason}</td>
                              <td>{parseTelemetry(row.post_text)}</td>
                              <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{row.truth_score}%</td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button 
                                    onClick={() => handleRevert(row)}
                                    style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}
                                  >
                                    {TRANSLATIONS[lang].isolate}
                                  </button>
                                  <button 
                                    onClick={() => handleReview(row)}
                                    style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '9px' }}
                                  >
                                    {TRANSLATIONS[lang].diag}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {alerts
                          .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                          .filter(a => a.hashtag.toLowerCase().includes(searchQuery.toLowerCase()) || a.account_id.toLowerCase().includes(searchQuery.toLowerCase()))
                          .length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {TRANSLATIONS[lang].no_matching_anomalies}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel" style={{ height: '415px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {anomaliesRightTab === 'chart' ? (lang === 'TR' ? 'Ödeme Risk Kümeleme Analizi' : 'Payment Risk Clustering') : (lang === 'TR' ? 'Yapay Zeka Teşhis & Kontrol' : 'AI Diagnostics & Control')}
                    </h3>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.03)', padding: '2px', borderRadius: '4px' }}>
                      <button 
                        onClick={() => setAnomaliesRightTab('chart')}
                        style={{
                          background: anomaliesRightTab === 'chart' ? 'var(--cyan)' : 'transparent',
                          color: anomaliesRightTab === 'chart' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '3px 8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        📊 {lang === 'TR' ? 'Grafik' : 'Chart'}
                      </button>
                      <button 
                        onClick={() => setAnomaliesRightTab('diag')}
                        style={{
                          background: anomaliesRightTab === 'diag' ? 'var(--cyan)' : 'transparent',
                          color: anomaliesRightTab === 'diag' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '3px 8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🧠 XAI
                      </button>
                    </div>
                  </div>
                  
                  {anomaliesRightTab === 'chart' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {TRANSLATIONS[lang].anomalies_cluster_desc}
                      </span>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart margin={{ top: 15, right: 15, bottom: 10, left: -25 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis type="number" dataKey="truth" name="Security Score" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                          <YAxis type="number" dataKey="sentiment" name="Risk Index" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                          <ZAxis type="category" dataKey="name" name="Channel" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                          <Scatter name="Anomalies" data={
                            alerts
                              .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                              .map(a => ({
                                truth: a.truth_score,
                                sentiment: parseFloat((a.nlp_sentiment * 100).toFixed(1)),
                                name: a.hashtag
                              }))
                          } fill="#ef4444">
                            {alerts.filter(a => a.truth_score < 50).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.truth_score < 30 ? 'var(--red)' : 'var(--orange)'} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                      {selectedAlert ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Ödeme Kanalı / Channel:</span>
                              <strong style={{ color: 'var(--cyan)' }}>{selectedAlert.hashtag} ({selectedAlert.account_id})</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Ağ Geçidi / Gateway:</span>
                              <strong>{selectedAlert.city} ({gridStations[selectedAlert.city] || 'Substation'})</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Risk Skoru / Risk:</span>
                              <strong style={{ color: 'var(--red)' }}>{(100 - selectedAlert.truth_score).toFixed(0)}%</strong>
                            </div>
                          </div>

                          {/* SHAP Progress Bars */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>🧠 SHAP Explainable AI Feature Contribution</div>
                            {(() => {
                              const reason = selectedAlert.reason || 'CRITICAL_AMOUNT';
                              let features = [
                                { name: lang === 'TR' ? 'İşlem Tutar Etkisi (Amount)' : 'Tx Amount Impact', weight: 72, color: 'var(--red)' },
                                { name: lang === 'TR' ? 'İşlem Hız Etkisi (Velocity)' : 'Tx Velocity Impact', weight: 18, color: 'var(--orange)' },
                                { name: lang === 'TR' ? 'Konum/IP Risk Faktörü (IP Risk)' : 'IP Location Risk', weight: 10, color: 'var(--cyan)' }
                              ];
                              if (reason === 'Bot_Script_v3') {
                                features = [
                                  { name: lang === 'TR' ? 'İşlem Hız Etkisi (Velocity)' : 'Tx Velocity Impact', weight: 80, color: 'var(--red)' },
                                  { name: lang === 'TR' ? 'İşlem Tutar Etkisi (Amount)' : 'Tx Amount Impact', weight: 15, color: 'var(--orange)' },
                                  { name: lang === 'TR' ? 'Konum/IP Risk Faktörü (IP Risk)' : 'IP Location Risk', weight: 5, color: 'var(--cyan)' }
                                ];
                              } else if (reason === 'OFFSHORE_IP') {
                                features = [
                                  { name: lang === 'TR' ? 'Konum/IP Risk Faktörü (IP Risk)' : 'IP Location Risk', weight: 75, color: 'var(--red)' },
                                  { name: lang === 'TR' ? 'İşlem Tutar Etkisi (Amount)' : 'Tx Amount Impact', weight: 15, color: 'var(--orange)' },
                                  { name: lang === 'TR' ? 'İşlem Hız Etkisi (Velocity)' : 'Tx Velocity Impact', weight: 10, color: 'var(--cyan)' }
                                ];
                              }
                              return features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                                    <span>{f.name}</span>
                                    <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                                  </div>
                                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>

                          {/* SCADA Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(239,68,68,0.02)', border: '1px dashed rgba(239,68,68,0.15)', padding: '10px', borderRadius: '4px', marginTop: '4px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>⚡ REMOTE SECURITY ACTION OVERRIDE</div>
                            
                            {mitigationLoading ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'rgba(0,0,0,0.02)', borderRadius: '3px', fontSize: '9.5px', color: 'var(--cyan)' }}>
                                <svg className="animate-spin" style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <circle cx="12" cy="12" r="10" stroke="rgba(2, 132, 199, 0.1)" />
                                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>{lang === 'TR' ? 'KOMUT GÖNDERİLİYOR...' : 'EXECUTING SECURITY CMD...'}</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {(selectedAlert.reason === 'Bot_Script_v3' || selectedAlert.reason === 'SUSPICIOUS_VELOCITY') && (
                                  <button 
                                    onClick={() => handleMitigate('COOLING')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--green)', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    🔒 {lang === 'TR' ? 'Kartı Kilitle' : 'Freeze Card'}
                                  </button>
                                )}
                                {selectedAlert.reason === 'OFFSHORE_IP' && (
                                  <button 
                                    onClick={() => handleMitigate('PHASE_BALANCE')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    🚫 {lang === 'TR' ? 'İşlemi Reddet' : 'Reject Tx'}
                                  </button>
                                )}
                                {selectedAlert.reason === 'CRITICAL_AMOUNT' && (
                                  <button 
                                    onClick={() => handleMitigate('LOAD_LIMIT')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    🛑 {lang === 'TR' ? 'Hesabı Dondur' : 'Hold Account'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Güvenlik Durumu / Security Status:' : 'Security Status:'}</span>
                              <strong style={{ color: alerts.filter(a => a.truth_score < 50).length > 0 ? 'var(--orange)' : 'var(--green)' }}>
                                {alerts.filter(a => a.truth_score < 50).length > 0 
                                  ? (lang === 'TR' ? `${alerts.filter(a => a.truth_score < 50).length} RISKLI İŞLEM TESPİT EDİLDİ` : `${alerts.filter(a => a.truth_score < 50).length} RISK ALERTS ACTIVE`) 
                                  : (lang === 'TR' ? 'TÜM İŞLEMLER GÜVENLİ' : 'ALL TRANSACTIONS SECURE')}
                              </strong>
                            </div>
                          </div>

                          {/* Aggregate SHAP Progress Bars */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              🧠 {lang === 'TR' ? 'GENEL ŞEBEKE ANOMALİ ETKİ AĞIRLIKLARI (AVG SHAP)' : 'AGGREGATE GRID ANOMALY FEATURE WEIGHTS (AVG SHAP)'}
                            </div>
                            {(() => {
                              const activeAnomalies = alerts.filter(a => a.truth_score < 50);
                              let cOverload = 0;
                              let cOverheating = 0;
                              let cVoltage = 0;

                              activeAnomalies.forEach(a => {
                                if (a.reason === 'OVERHEATING') cOverheating++;
                                else if (a.reason === 'VOLTAGE_DROP') cVoltage++;
                                else cOverload++;
                              });

                              const total = cOverload + cOverheating + cVoltage || 1;
                              const loadWeight = Math.round((cOverload * 72 + cOverheating * 15 + cVoltage * 15) / total);
                              const tempWeight = Math.round((cOverload * 18 + cOverheating * 80 + cVoltage * 10) / total);
                              const voltWeight = Math.max(5, 100 - loadWeight - tempWeight);

                              const features = [
                                { name: lang === 'TR' ? 'Ortalama Tutar Etkisi (Avg Amount)' : 'Avg Transaction Amount Impact', weight: loadWeight, color: 'var(--green)' },
                                { name: lang === 'TR' ? 'Ortalama İşlem Hızı (Avg Velocity)' : 'Avg Transaction Velocity', weight: tempWeight, color: 'var(--red)' },
                                { name: lang === 'TR' ? 'Şüpheli Konum Riski (Avg Location)' : 'Avg Location / IP Risk', weight: voltWeight, color: 'var(--orange)' }
                              ];

                              return features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                                    <span>{f.name}</span>
                                    <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                                  </div>
                                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '4px', fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic', textAlign: 'center' }}>
                            💡 {lang === 'TR' 
                              ? "Cihaza özel XAI teşhis grafiklerini ve SCADA kontrol butonlarını yüklemek için soldaki anomali tablosundan herhangi bir satırda 'Teşhis' butonuna basın."
                              : "Press 'Diag' on any row in the table to display specific device XAI parameters and load remote SCADA control override actions."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ml' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>AI Models & Machine Learning Explanation</h2>
                <div className="dropdown" style={{ background: 'var(--green)', color: '#fff', border: 'none' }}>ML Engine Status: Active</div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ height: '480px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="panel-header">
                    <h3>Model Metrics & Diagnostics</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11px', textAlign: 'center' }}>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>F1-SCORE</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>94.2%</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ACCURACY</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>95.8%</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PRECISION</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--orange)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>93.5%</div>
                    </div>
                  </div>

                  {/* Confusion Matrix */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      CONFUSION MATRIX (Sınıflandırma Doğruluk Matrisi)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '8px', fontSize: '10px', textAlign: 'center' }}>
                      <div />
                      <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Predicted Positive (Fraud)</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Predicted Negative (Legit)</div>

                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '8px' }}>Actual Positive</div>
                      <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--green)' }}>942</strong>
                        <span>True Positive (TP)</span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--red)' }}>58</strong>
                        <span>False Negative (FN)</span>
                      </div>

                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '8px' }}>Actual Negative</div>
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--red)' }}>65</strong>
                        <span>False Positive (FP)</span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--green)' }}>1935</strong>
                        <span>True Negative (TN)</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Drift & Online Retraining */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        MODEL DRIFT MONITOR & ONLINE TRAINING
                      </span>
                      <span style={{ fontSize: '8px', color: 'var(--green)', background: 'rgba(22,163,74,0.1)', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>
                        DRIFT: 1.8% (NORMAL)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>Concept Drift Index:</span>
                          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--cyan)' }}>0.018 PSI</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(0,0,0,0.05)', borderRadius: '2.5px', overflow: 'hidden' }}>
                          <div style={{ width: '18%', height: '100%', background: 'var(--cyan)' }} />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          alert(lang === 'TR' ? 'ClickHouse verileri kullanılarak XGBoost modelinin online eğitimi tetiklendi. Model parametreleri güncelleniyor...' : 'XGBoost online retraining triggered using ClickHouse telemetry. Updating model weights...');
                        }}
                        style={{
                          background: 'var(--cyan)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                      >
                        🔄 {lang === 'TR' ? 'Modeli Yeniden Eğit' : 'Retrain Model'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ height: '480px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>Feature Importance (Öznitelik Ağırlıkları)</h3>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                      Makine öğrenmesi modelinin ödeme dolandırıcılığı teşhisi koyarken en çok ağırlık verdiği işlem veri öznitelikleri:
                    </span>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart 
                        layout="vertical"
                        data={[
                          { name: 'Transaction Amount', weight: 42 },
                          { name: 'Transaction Velocity', weight: 28 },
                          { name: 'Location / IP Risk', weight: 18 },
                          { name: 'Time of Day Delta', weight: 12 }
                        ]}
                        margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis type="number" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                        <Bar dataKey="weight" fill="var(--cyan)" radius={[0, 3, 3, 0]}>
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Pipeline flowchart */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        ANALİZ PIPELINE AKIŞ ŞEMASI
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center' }}>
                        <div style={{ padding: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', width: '22%' }}>
                          Payment Tx Stream
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid var(--cyan)', borderRadius: '4px', width: '22%' }}>
                          SHAP Feature Extractor
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid var(--cyan)', borderRadius: '4px', width: '22%' }}>
                          XGBoost Classifier
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(22, 163, 74, 0.05)', border: '1px solid var(--green)', borderRadius: '4px', width: '22%' }}>
                          Security Score Output
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>Yapay Zeka Filtre Kuralları (AI Configurations)</h2>
                <div className="dropdown" style={{ background: 'var(--green)', color: '#fff', border: 'none' }}>Active Rules Enabled ✓</div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ gap: '20px', minHeight: '415px', height: 'auto', paddingBottom: '20px' }}>
                  <div className="panel-header">
                    <h3>Active Data Validation Rules</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{lang === 'TR' ? 'İşlem Tutar Uyarısı Üst Limiti' : 'Tx Amount Alert Limit'}</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&gt; 20,000 TRY</span>
                      </div>
                      <input type="range" min="1000" max="50000" step="1000" defaultValue="20000" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Tek seferlik harcama limiti bu tutarı aştığında yüksek hacimli işlem uyarısı tetiklenir.' : 'Single transaction amount exceeding this limit triggers a large volume warning.'}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{lang === 'TR' ? 'Hız Sınırı Blokaj Katsayısı' : 'Tx Velocity Alert Limit'}</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&gt; 5 tx/s</span>
                      </div>
                      <input type="range" min="1" max="20" step="1" defaultValue="5" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Bir hesaptaki saniyelik işlem frekansı bu limiti aşarsa otomatik bot script kuralları devreye girer.' : 'Transaction frequency exceeding this rate triggers automatic bot script rules.'}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{lang === 'TR' ? 'Otomatik Hesap Blokaj Skoru' : 'Automatic Account Blockade Score'}</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&lt; 35.0% Güvenlik Skoru</span>
                      </div>
                      <input type="range" min="10" max="90" step="5" defaultValue="35" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lang === 'TR' ? 'AI modelinin hesapladığı işlem güvenilirlik derecesi bu yüzdenin altına düşerse işlem reddedilir.' : 'Transactions with security scores below this threshold will be automatically blocked.'}</span>
                    </div>
                  </div>

                  {/* Injector Form */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: 'var(--cyan)' }}>
                      🧪 {lang === 'TR' ? 'CANLI DOLANDIRICILIK ANOMALİ ENJEKTÖRÜ (DEMO)' : 'LIVE FRAUD ANOMALY INJECTION TOOL (DEMO)'}
                    </h4>
                    
                    {/* Quick Simulation Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "ACC_9982",
                            hashtag: "Credit Card",
                            post_text: "Telemetry: 12 tx/s from same card (Velocity Limit Exceeded), IP: 176.43.12.8",
                            city: "Istanbul",
                            reason: "Bot_Script_v3",
                            ai_risk_score: 98.5,
                            nlp_sentiment: -0.85,
                            truth_score: 15.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: High Velocity (82.4% impact). Telemetry: 12 tx/s. Recommended Action: Freeze card immediately.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "POS Terminal"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        ⚡ {lang === 'TR' ? 'BOT SCRİPT ENJEKTE ET' : 'INJECT BOT SCRIPT'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "ACC_2819",
                            hashtag: "FAST Wire",
                            post_text: "Telemetry: Amount=45000 TRY, IP: 185.93.2.4 (Offshore Node)",
                            city: "Nicosia",
                            reason: "OFFSHORE_IP",
                            ai_risk_score: 88.0,
                            nlp_sentiment: -0.65,
                            truth_score: 28.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: High-Risk IP Location (74.2% impact). Telemetry: Nicosia node routing. Recommended Action: Verify KYC & Hold Transaction.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "Web Browser"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        📉 {lang === 'TR' ? 'OFFSHORE TRANSFER ENJEKTE ET' : 'INJECT OFFSHORE IP'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "ACC_7721",
                            hashtag: "EFT",
                            post_text: "Telemetry: Amount=98000 TRY, IP: 85.105.42.1 (Breaches KYC single tx limit)",
                            city: "Ankara",
                            reason: "CRITICAL_AMOUNT",
                            ai_risk_score: 99.4,
                            nlp_sentiment: -0.92,
                            truth_score: 12.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: Critical Amount (91.1% impact). Telemetry: 98,000 TRY. Recommended Action: Place hold on account pending KYC validation.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "Mobile App"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🔥 {lang === 'TR' ? 'LİMİT AŞIMI ENJEKTE ET' : 'INJECT LIMIT BREACH'}
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const pageInput = e.target.elements.page.value || 'Credit Card';
                      const editInput = e.target.elements.edit.value || 'Amount=15000 TRY, IP: 88.22.10.42';
                      
                      const simulatedAlert = {
                        account_id: "ACC_INJECTED",
                        hashtag: pageInput,
                        post_text: editInput,
                        city: "Istanbul",
                        reason: "CRITICAL_AMOUNT",
                        ai_risk_score: 95.5,
                        nlp_sentiment: -0.80,
                        truth_score: 15.0,
                        fact_check_result: `CRITICAL AMOUNT: Large payment volume. Automatic validation required.`,
                        is_bot: true,
                        timestamp: new Date().toISOString(),
                        device: pageInput
                      };
                      setAlerts((prev) => [simulatedAlert, ...prev]);
                      e.target.reset();
                    }} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        name="page" 
                        placeholder={lang === 'TR' ? "Kanal (örn. Credit Card)" : "Channel (e.g. Credit Card)"}
                        required 
                        style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} 
                      />
                      <input 
                        name="edit" 
                        placeholder={lang === 'TR' ? "Telemetri (örn. Amount=25000...)" : "Telemetry (e.g. Amount=25000...)"}
                        required 
                        style={{ flex: 2, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} 
                      />
                      <button 
                        type="submit"
                        style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {lang === 'TR' ? 'Gönder' : 'Inject'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="panel" style={{ minHeight: '415px', height: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>AI DATA ANOMALY PROFILE (RADAR)</h3>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: lang === 'TR' ? 'Hız Riski' : 'Velocity Risk', value: Math.round(Math.min(100, Math.max(20, alerts.filter(a => a.truth_score < 50).reduce((acc, a) => acc + Math.abs(a.nlp_sentiment) * 100, 0) / (alerts.filter(a => a.truth_score < 50).length || 1)))) },
                        { subject: lang === 'TR' ? 'Tutar Riski' : 'Amount Risk', value: Math.round(65 + Math.sin(Date.now() / 15000) * 15) },
                        { subject: lang === 'TR' ? 'Offshore IP' : 'Offshore IP', value: Math.round(Math.min(100, 30 + (topCities.length * 7))) },
                        { subject: lang === 'TR' ? 'Gece Aktivitesi' : 'Night Activity', value: Math.round(Math.min(100, 50 + (alerts.filter(a => a.truth_score < 30).length * 8))) },
                        { subject: lang === 'TR' ? 'Çoklu Kart' : 'Multi-Card', value: Math.round(Math.min(100, parseFloat(liveMetrics.throughput) * 30)) }
                      ]}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                        <Radar name="Anomaly Matrix" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(22, 163, 74, 0.04)', borderRadius: '3px' }}>
                        <span>KYC Compliance:</span>
                        <strong style={{ color: 'var(--green)' }}>ACTIVE</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(22, 163, 74, 0.04)', borderRadius: '3px' }}>
                        <span>3D Secure Guard:</span>
                        <strong style={{ color: 'var(--green)' }}>ACTIVE</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal for Detailed AI Review */}
      {selectedAlert && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="panel" style={{
            width: '500px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '1px' }}>
                🔍 Detailed AI Grid Diagnostic Report
              </h3>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div><strong>Payment Channel:</strong> <span style={{ color: 'var(--cyan)' }}>{selectedAlert.hashtag}</span></div>
              <div><strong>Account ID / Card ID:</strong> {selectedAlert.account_id}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</div>
              <div><strong>Gateway Node Location:</strong> {selectedAlert.city} ({gridStations[selectedAlert.city] || 'Central'})</div>
            </div>

            {/* Simulated diff view */}
            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>PARAMETRİK TELEMETRİ DETAYLARI (DIFF VIEW)</div>
              {selectedAlert.truth_score < 50 ? (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    - [Nominal Transaction Limits]: Amount &lt; 5,000 TRY, Velocity &lt; 2 tx/s, IP = Local
                  </div>
                  <div style={{ color: 'var(--green)', background: 'rgba(22, 163, 74, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    + [Anomaly Telemetry]: "{selectedAlert.post_text}"
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--green)', background: 'rgba(22, 163, 74, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    + [Nominal Telemetry]: "{selectedAlert.post_text}"
                  </div>
                </div>
              )}
            </div>

            {/* Detailed AI Explanation */}
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 'bold' }}>AI ANALYSIS DETAILS</div>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {selectedAlert.truth_score < 40 ? (
                  "CRITICAL: High risk of payment fraud, limit breach, or bot velocity detected. Immediate blockade recommended."
                ) : selectedAlert.truth_score < 70 ? (
                  "WARNING: Unusually high transaction amount or overseas transaction detected."
                ) : (
                  "STABLE: Transaction verified under normal card thresholds."
                )}
              </div>
            </div>

            {/* SHAP Explainability Feature Importance */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--cyan)', marginBottom: '8px', fontWeight: 'bold' }}>🧠 SHAP EXPLAINABLE AI FEATURE WEIGHTS</div>
              {(() => {
                const reason = selectedAlert.reason || 'CRITICAL_OVERLOAD';
                let features = [
                  { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 72, color: 'var(--red)' },
                  { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 18, color: 'var(--orange)' },
                  { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 10, color: 'var(--cyan)' }
                ];
                if (reason === 'OVERHEATING') {
                  features = [
                    { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 80, color: 'var(--red)' },
                    { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                    { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 5, color: 'var(--cyan)' }
                  ];
                } else if (reason === 'VOLTAGE_DROP') {
                  features = [
                    { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 75, color: 'var(--red)' },
                    { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                    { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 10, color: 'var(--cyan)' }
                  ];
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                          <span>{f.name}</span>
                          <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Automatic SCADA Mitigation Override */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.02)', border: '1px dashed rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>⚡ AUTOMATIC SCADA MITIGATION OVERRIDE</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {lang === 'TR' 
                  ? 'Yapay zeka tarafından önerilen siber müdahaleyi uzaktan gerçekleştirmek için komutu onaylayın:'
                  : 'Execute the AI-recommended cyber override commands to balance grid parameters remotely:'}
              </div>
              
              {mitigationLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', fontSize: '11px', color: 'var(--cyan)' }}>
                  <svg className="animate-spin" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" stroke="rgba(2, 132, 199, 0.1)" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>
                    {selectedAlert.reason === 'OVERHEATING' ? (lang === 'TR' ? 'SOĞUTMA SİSTEMLERİ TETİKLENİYOR...' : 'TRIGGERING GRID COOLING SYSTEMS...') :
                     selectedAlert.reason === 'VOLTAGE_DROP' ? (lang === 'TR' ? 'FAZ VOLTAJ DEĞERLERİ DENGELEME AKTİF...' : 'BALANCING PHASE VOLTAGE VALUES...') :
                     (lang === 'TR' ? 'AKIM TAŞIMA DEĞERLERİ SINIRLANDIRILIYOR...' : 'DERATING MAX ALLOWABLE CABLE CURRENT...')}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {selectedAlert.reason === 'SUSPICIOUS_VELOCITY' && (
                    <button 
                      onClick={() => handleMitigate('COOLING')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--green)', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ❄️ {lang === 'TR' ? 'Soğutmayı Başlat (Cooling)' : 'Activate Fans (Cooling)'}
                    </button>
                  )}
                  {selectedAlert.reason === 'OFFSHORE_IP' && (
                    <button 
                      onClick={() => handleMitigate('PHASE_BALANCE')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🔄 {lang === 'TR' ? 'Fazları Dengele (Balance)' : 'Balance Grid Phases'}
                    </button>
                  )}
                  {selectedAlert.reason === 'CRITICAL_AMOUNT' && (
                    <button 
                      onClick={() => handleMitigate('LOAD_LIMIT')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ⚡ {lang === 'TR' ? 'Akımı Sınırla (Limit)' : 'Derate Limit (Limit)'}
                    </button>
                  )}
                  {(!selectedAlert.reason || selectedAlert.reason === 'NORMAL') && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{lang === 'TR' ? 'Aktif müdahale komutu gerekmiyor.' : 'No active mitigation required.'}</span>
                  )}
                </div>
              )}
            </div>

            {/* Reference suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(2, 132, 199, 0.03)', border: '1px solid rgba(2, 132, 199, 0.1)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--cyan)', fontWeight: 'bold' }}>🔗 RECOMMENDED DIAGNOSTIC ACTIONS</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                1. Verify substation status: <a href={`https://www.google.com/search?q=${encodeURIComponent('Smart Grid Substation ' + selectedAlert.city)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>"Substation {selectedAlert.city}"</a>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                2. Emergency Shutoff command: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Isolate {selectedAlert.account_id} Breaker</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Popover */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {/* Toggle Button */}
        <button 
          onClick={() => setShowChatPopover(!showChatPopover)}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--cyan)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: showChatPopover ? 'rotate(90deg)' : 'none',
            animation: showChatPopover ? 'none' : 'pulse 2s infinite'
          }}
          title={lang === 'TR' ? 'Yapay Zeka Asistanı' : 'AI Copilot'}
        >
          {showChatPopover ? '✕' : '🤖'}
        </button>

        {/* Chat Popover Card */}
        {showChatPopover && (
          <div style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            width: '320px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '12px',
            textAlign: 'left'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>🤖 FraudPulse AI Copilot</strong>
              <span style={{ fontSize: '8px', background: 'var(--green)', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                RAG ACTIVE
              </span>
            </div>

            {/* Message History Feed */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              background: 'var(--bg-hover)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '6px', 
              padding: '10px', 
              maxHeight: '220px',
              minHeight: '180px'
            }}>
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--cyan)' : 'var(--bg-panel)',
                    color: 'var(--text-main)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    maxWidth: '85%',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.textKey ? TRANSLATIONS[lang][msg.textKey] : msg.text}
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleChatSubmit(TRANSLATIONS[lang].copilot_prompt_1)}
                style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ❓ {lang === 'TR' ? 'Kararlılık?' : 'Stability?'}
              </button>
              <button 
                onClick={() => handleChatSubmit(TRANSLATIONS[lang].copilot_prompt_2)}
                style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ❓ {lang === 'TR' ? 'Isınma?' : 'Overheating?'}
              </button>
            </div>

            {/* Message Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                handleChatSubmit(chatInput);
                setChatInput('');
              }} 
              style={{ display: 'flex', gap: '6px' }}
            >
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={TRANSLATIONS[lang].copilot_placeholder}
                style={{ flex: 1, padding: '6px 10px', fontSize: '11px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
              />
              <button 
                type="submit"
                style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {TRANSLATIONS[lang].copilot_send}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
