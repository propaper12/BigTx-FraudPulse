import json
import requests
from kafka import KafkaProducer
import time

REDPANDA_BROKERS = ['localhost:9092']
TOPIC_NAME = 'social_media_posts'

WIKI_STREAM_URL = 'https://stream.wikimedia.org/v2/stream/recentchange'

try:
    producer = KafkaProducer(
        bootstrap_servers=REDPANDA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print(f"Redpanda'ya baglanildi! Topic: {TOPIC_NAME}")
except Exception as e:
    print(f"Redpanda baglanti hatasi: {e}")
    exit(1)

def start_stream():
    print(f"Wikipedia Canli Akisina ({WIKI_STREAM_URL}) Baglaniliyor...")
    
    while True:
        try:
            headers = {
                'Accept': 'text/event-stream',
                'User-Agent': 'TruthAI_Project/1.0 (test@example.com)'
            }
            response = requests.get(WIKI_STREAM_URL, stream=True, headers=headers)
            
            if response.status_code != 200:
                print(f"Baglanti Hatasi: HTTP {response.status_code}", flush=True)
                time.sleep(3)
                continue
                
            print("Baglanti Basarili! Gercek Wikipedia Verileri Redpanda'ya Akiyor...", flush=True)
            
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data: '):
                        try:
                            change = json.loads(decoded_line[6:])
                            
                            if change.get('type') == 'edit':
                                user = change.get('user', 'Unknown')
                                title = change.get('title', 'Unknown')
                                comment = change.get('comment', '')
                                wiki = change.get('wiki', 'unknown')
                                bot = change.get('bot', False)
                                timestamp = change.get('meta', {}).get('dt', '')
                                
                                wiki_to_city = {
                                    'enwiki': 'London', 'dewiki': 'Berlin', 'frwiki': 'Paris', 
                                    'jawiki': 'Tokyo', 'ruwiki': 'Moscow', 'eswiki': 'Mexico City', 
                                    'itwiki': 'Rome', 'zhwiki': 'Beijing', 'ptwiki': 'Rio de Janeiro',
                                    'arwiki': 'Cairo', 'trwiki': 'Istanbul', 'kowiki': 'Seoul',
                                    'idwiki': 'Jakarta', 'hiwiki': 'Mumbai', 'nlwiki': 'Amsterdam'
                                }
                                city = wiki_to_city.get(wiki, 'New York')
                                
                                length_old = change.get('length', {}).get('old', 0) or 0
                                length_new = change.get('length', {}).get('new', 0) or 0
                                length_diff = abs(length_new - length_old)
                                
                                simulated_velocity = length_diff if not bot else max(length_diff, 500)
                                
                                post = {
                                    "account_id": user,
                                    "hashtag": title[:30],
                                    "post_text": comment[:200] if comment else "No comment provided",
                                    "post_velocity": simulated_velocity,
                                    "city": city,
                                    "device": "WikiBot" if bot else "HumanEditor",
                                    "timestamp": timestamp
                                }
                                
                                producer.send(TOPIC_NAME, value=post)
                                producer.flush()
                                
                                safe_title = title.encode('ascii', 'ignore').decode('ascii')
                                safe_user = user.encode('ascii', 'ignore').decode('ascii')
                                print(f"[{wiki}] {safe_user} edited '{safe_title}' (Diff: {length_diff} chars)", flush=True)
                                
                        except Exception as e:
                            pass
        except Exception as ex:
            print(f"Wikipedia baglantisi koptu ({ex}). 3 saniye icinde yeniden baglaniliyor...", flush=True)
            time.sleep(3)

if __name__ == '__main__':
    try:
        start_stream()
    except KeyboardInterrupt:
        print("\nWikipedia akisi durduruldu.")
    finally:
        producer.close()

