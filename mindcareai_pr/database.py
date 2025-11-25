# database.py
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "mindcare_ai"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# --- Collections ---
users_col = db["users"]
sessions_col = db["sessions"]

# --- User Functions ---
def create_user(user_id, email=None, consent_email=False, language="en"):
    """
    Create a new user with optional email, consent flag, and language preference.
    Default language = English ("en").
    """
    if not users_col.find_one({"_id": user_id}):
        users_col.insert_one({
            "_id": user_id,
            "email": email,
            "consent_email": consent_email,
            "language": language,
            "created_at": datetime.utcnow()
        })

def get_user(user_id):
    return users_col.find_one({"_id": user_id})

def update_user_language(user_id, language):
    """
    Update user's preferred language (e.g., 'en', 'hi', 'ta', 'bn').
    """
    users_col.update_one(
        {"_id": user_id},
        {"$set": {"language": language}}
    )

def update_user_email_consent(user_id, email=None, consent_email=None):
    """
    Update user's email and/or consent_email preference.
    """
    update_data = {}
    if email is not None:
        update_data["email"] = email
    if consent_email is not None:
        update_data["consent_email"] = consent_email
    
    if update_data:
        users_col.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )

# --- Session Functions ---
def create_session(session_id, user_id, custom_email=None):
    sessions_col.insert_one({
        "_id": session_id,
        "user_id": user_id,
        "custom_email": custom_email,  # Store custom email for this session
        "messages": [],
        "summary": None,
        "risk": None,
        "emailed": False,
        "created_at": datetime.utcnow()
    })

def add_message(session_id, role, text):
    sessions_col.update_one(
        {"_id": session_id},
        {"$push": {"messages": {
            "role": role,
            "text": text,
            "ts": datetime.utcnow()
        }}}
    )

def save_summary(session_id, summary, risk):
    sessions_col.update_one(
        {"_id": session_id},
        {"$set": {"summary": summary, "risk": risk}}
    )

def mark_emailed(session_id):
    sessions_col.update_one(
        {"_id": session_id},
        {"$set": {"emailed": True}}
    )

def get_session(session_id):
    return sessions_col.find_one({"_id": session_id})

def get_user_sessions(user_id):
    return list(sessions_col.find({"user_id": user_id}))
