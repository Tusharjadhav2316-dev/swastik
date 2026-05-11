
import os
import base64
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    if not firebase_admin._apps:
        try:
            sa_b64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_B64")
            if not sa_b64:
                print("FIREBASE_SERVICE_ACCOUNT_B64 not found in environment")
                return None
            
            sa_json = json.loads(base64.b64decode(sa_b64).decode('utf-8'))
            cred = credentials.Certificate(sa_json)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize Firebase Admin: {e}")
            return None
    return firestore.client()

db = init_firebase()

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
FINNHUB_KEY = os.getenv("FINNHUB_KEY")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
