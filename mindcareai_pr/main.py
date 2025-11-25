# main.py
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import re

# Local modules
from database import (
    create_user, get_user, create_session, add_message,
    save_summary, get_session, get_user_sessions, mark_emailed,
    update_user_email_consent
)
from email_utils import send_summary_email
from agent_graph import run_agent_step   # ✅ LangGraph agent
from memory import memory_manager

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="MindCare AI", version="3.0.0 (LangGraph Enabled)")
# --- Helpers ---
def _clean_section(text: str) -> str:
    if not text:
        return ""
    t = text.strip()
    # Normalize multiple blank lines
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t


def format_summary_markdown(summary: str, risk: str) -> str:
    """Beautify and normalize raw summary text into concise, skimmable markdown.

    - Promotes headings to consistent style
    - Removes boilerplate like "No information provided." sections
    - Adds compact tags and an action footer
    """
    if not summary:
        return ""

    sections = {
        "Overall Mood": None,
        "Sleep": None,
        "Appetite": None,
        "Main Stressors": None,
        "Protective Factors / Supports": None,
        "Risk Level": None,
    }

    # Split by headings if present
    parts = re.split(r"\n\s*#{1,3}\s*|\n\s*\*\*", summary)
    # Fallback: if not split as expected, just condense
    if len(parts) <= 1:
        condensed = _clean_section(summary)
        return f"## Session Summary\n\n{condensed}\n\n---\nRisk: **{risk.capitalize()}**"

    # Lightweight parse by scanning for section names in the original summary
    def find_section(name: str) -> str:
        pattern = re.compile(rf"(^|\n)\s*(?:#{1,3}\s*|\*\*)?{re.escape(name)}(?:\*\*)?\s*\n+(.+?)(?=\n\s*(?:#{1,3}\s*|\*\*)?[A-Z].*|\Z)", re.S)
        m = pattern.search(summary)
        return _clean_section(m.group(2).strip()) if m else ""

    for key in list(sections.keys()):
        sections[key] = find_section(key)

    # Drop empty/boilerplate sections
    def keep(val: str) -> bool:
        if not val:
            return False
        return not re.search(r"^no information provided\.?$", val.strip(), re.I)

    lines = ["## 🌿 Session Summary"]
    if keep(sections["Overall Mood"]):
        lines += ["\n### 😊 Overall Mood", sections["Overall Mood"]]
    if keep(sections["Sleep"]):
        lines += ["\n### 💤 Sleep", sections["Sleep"]]
    if keep(sections["Appetite"]):
        lines += ["\n### 🍽️ Appetite", sections["Appetite"]]
    if keep(sections["Main Stressors"]):
        lines += ["\n### ⚠️ Main Stressors", sections["Main Stressors"]]
    if keep(sections["Protective Factors / Supports"]):
        lines += ["\n### 🛡️ Supports", sections["Protective Factors / Supports"]]

    lines += ["\n### 🧭 Risk", f"Risk level: **{risk.capitalize()}**"]

    # Quick suggestions footer
    lines += [
        "\n---",
        "#### Quick next steps",
        "- Try a 2-minute breathing exercise",
        "- Jot down one positive moment from today",
        "- Reach out to someone you trust if you need",
    ]

    return "\n".join(lines).strip()


# --- Pydantic models ---
class StartSessionRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    consent_email: Optional[bool] = False


class FacialEmotionData(BaseModel):
    emotion: Optional[str] = None
    confidence: Optional[float] = None
    mood: Optional[int] = None

class RespondRequest(BaseModel):
    user_id: str
    session_id: str
    answer: str
    finished: Optional[bool] = False
    facial_emotion: Optional[FacialEmotionData] = None  # Optional facial emotion data


# --- Routes ---
@app.post("/session/start")
def start_session(req: StartSessionRequest):
    """Start a new session for a user"""
    print(f"\n{'='*60}")
    print(f"🚀 SESSION START - User: {req.user_id}")
    print(f"   Email: {req.email}")
    print(f"   Consent: {req.consent_email}")
    print(f"{'='*60}")
    
    user = get_user(req.user_id)
    if not user:
        print(f"👤 Creating new user...")
        create_user(req.user_id, req.email, req.consent_email)
    else:
        print(f"👤 User exists, updating email/consent if provided...")
        # Update email and consent even if user already exists
        update_user_email_consent(
            req.user_id, 
            email=req.email, 
            consent_email=req.consent_email if req.consent_email is not None else None
        )
        # Refresh user data
        user = get_user(req.user_id)
        print(f"   Updated consent_email: {user.get('consent_email')}")
        print(f"   Updated email: {user.get('email')}")

    # Generate session id
    session_id = str(uuid.uuid4())
    create_session(session_id, req.user_id, custom_email=req.email)
    print(f"✅ Session created: {session_id}")
    print(f"{'='*60}\n")

    # Initialize both long-term and short-term memory
    memory_manager.start_session(session_id)
    memory_manager.short_term.start_session(req.user_id, session_id)

    # First opening line
    opening = "👋 Hi, I'm here to listen. How have you been feeling lately?"

    # Save in DB + both memories
    add_message(session_id, "assistant", opening)
    memory_manager.add_message(session_id, "assistant", opening)
    memory_manager.short_term.add_message(req.user_id, "assistant", opening, {
        "session_id": session_id,
        "initial_message": True
    })

    return {
        "session_id": session_id,
        "question": opening
    }


@app.post("/session/respond")
def respond(req: RespondRequest):
    """Handle user response (via LangGraph agent)"""
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Prepare facial emotion data if provided
    facial_emotion_data = None
    if req.facial_emotion:
        facial_emotion_data = {
            "emotion": req.facial_emotion.emotion,
            "confidence": req.facial_emotion.confidence,
            "mood": req.facial_emotion.mood
        }
    
    # Call LangGraph agent with optional facial emotion
    result = run_agent_step(
        user_id=req.user_id,
        session_id=req.session_id,
        user_text=req.answer,
        facial_emotion=facial_emotion_data
    )

    # Determine assistant text from agent result (reply OR question)
    assistant_text = result.get("reply") or result.get("question") or ""

    # Save in DB and both memories
    add_message(req.session_id, "user", req.answer)
    add_message(req.session_id, "assistant", assistant_text)
    
    # Add to short-term memory
    memory_manager.short_term.add_message(req.user_id, "user", req.answer, {
        "session_id": req.session_id,
        "user_input": True
    })
    memory_manager.short_term.add_message(req.user_id, "assistant", assistant_text, {
        "session_id": req.session_id,
        "assistant_reply": True
    })
    
    # Auto-checkpoint after each assistant reply (optional)
    try:
        memory_manager.save_checkpoint(req.user_id, label="auto-reply")
    except Exception:
        pass

    # If finished
    if req.finished:
        summary = result.get("summary") or ""
        risk = result.get("risk", "low")
        email_attempted = False
        email_sent = False

        # Save summary in DB
        save_summary(req.session_id, summary, risk)

        # Email summary if consented
        print(f"\n{'='*60}")
        print(f"📧 EMAIL DEBUG - Session finished for user: {req.user_id}")
        print(f"{'='*60}")
        
        user = get_user(req.user_id)
        session = get_session(req.session_id)
        
        print(f"👤 User found: {user is not None}")
        if user:
            print(f"   - User email: {user.get('email')}")
            print(f"   - Consent email: {user.get('consent_email')}")
            print(f"   - User name: {user.get('name', 'N/A')}")
        
        print(f"📝 Session found: {session is not None}")
        if session:
            print(f"   - Custom email: {session.get('custom_email')}")
        
        # Use custom email from session if available, otherwise fallback to user's registered email
        email_to_use = None
        if session and session.get("custom_email"):
            email_to_use = session["custom_email"]
            print(f"✅ Using custom email from session: {email_to_use}")
        elif user and user.get("email"):
            email_to_use = user["email"]
            print(f"✅ Using user email: {email_to_use}")
        else:
            print(f"❌ No email address found!")
        
        print(f"📄 Summary length: {len(summary)} chars")
        print(f"   - Summary empty: {not summary.strip()}")
        
        # Check all conditions
        has_user = user is not None
        has_consent = user and user.get("consent_email")
        has_email = email_to_use is not None
        has_summary = bool(summary.strip())
        
        print(f"\n🔍 Email conditions check:")
        print(f"   - Has user: {has_user}")
        print(f"   - Has consent: {has_consent}")
        print(f"   - Has email: {has_email}")
        print(f"   - Has summary: {has_summary}")
        print(f"   - All conditions met: {has_user and has_consent and has_email and has_summary}")
        
        if user and user.get("consent_email") and email_to_use and summary.strip():
            subject = f"MindCare AI Session Summary ({req.session_id})"
            email_attempted = True
            print(f"\n🚀 Attempting to send email to: {email_to_use}")
            email_sent = send_summary_email(
                to_email=email_to_use,
                subject=subject,
                body=summary,
                user_name=user.get("name", "User")
            )
            print(f"📧 Email send result: {email_sent}")
            if email_sent:
                mark_emailed(req.session_id)
                print(f"✅ Email marked as sent in database")
        else:
            print(f"\n⏭️  Skipping email - conditions not met")
            if not has_user:
                print(f"   Reason: User not found")
            elif not has_consent:
                print(f"   Reason: User has not consented to emails (consent_email={user.get('consent_email') if user else 'N/A'})")
            elif not has_email:
                print(f"   Reason: No email address available")
            elif not has_summary:
                print(f"   Reason: Summary is empty")
        
        print(f"{'='*60}\n")

        # Checkpoint on finish then clear both memories
        try:
            memory_manager.save_checkpoint(req.user_id, label="session-finish", extra={
                "summary": summary,
                "risk": risk,
            })
        except Exception:
            pass
        
        # Clear both long-term and short-term memory
        memory_manager.end_session(req.session_id)
        memory_manager.short_term.end_session(req.user_id)

        pretty_summary = format_summary_markdown(summary, risk) if summary else ""
        return {
            "finished": True,
            "summary": pretty_summary or summary,
            "risk": risk,
            "emotion": result.get("emotion"),
            "facial_emotion": result.get("facial_emotion"),
            "sentiment": result.get("sentiment"),
            "recommendations": result.get("recommendations", []),
            "assistant_reply": assistant_text,
            "decision_type": result.get("type"),
            "email_attempted": email_attempted,
            "email_sent": email_sent,
        }

    # Otherwise → continue session
    return {
        "finished": False,
        "assistant_reply": assistant_text,
        "risk": result.get("risk", "low"),
        "emotion": result.get("emotion"),
        "facial_emotion": result.get("facial_emotion"),
        "sentiment": result.get("sentiment"),
        "recommendations": result.get("recommendations", []),
        "decision_type": result.get("type")
    }


@app.get("/user/{user_id}/history")
def get_history(user_id: str):
    """Fetch all past sessions for a user"""
    sessions = get_user_sessions(user_id)
    return {"sessions": sessions}


@app.get("/user/{user_id}/checkpoints")
def list_user_checkpoints(user_id: str):
    return {"checkpoints": memory_manager.list_checkpoints(user_id)}


class RestoreRequest(BaseModel):
    checkpoint_id: str


@app.post("/user/{user_id}/restore")
def restore_user_checkpoint(user_id: str, req: RestoreRequest):
    ok = memory_manager.restore_checkpoint(user_id, req.checkpoint_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    return {"restored": True, "checkpoint_id": req.checkpoint_id}


@app.get("/user/{user_id}/session/context")
def get_session_context(user_id: str, max_messages: int = 10):
    """Get current session's short-term memory context for LLM."""
    if not memory_manager.short_term.is_session_active(user_id):
        return {"context": "", "active": False}
    
    context = memory_manager.short_term.get_context_for_llm(user_id, max_messages)
    return {"context": context, "active": True}


@app.get("/user/{user_id}/session/history")
def get_session_history(user_id: str):
    """Get detailed conversation history from short-term memory."""
    if not memory_manager.short_term.is_session_active(user_id):
        return {"history": [], "active": False}
    
    history = memory_manager.short_term.get_conversation_history(user_id)
    return {"history": history, "active": True}


@app.get("/health")
def health():
    return {"status": "ok", "service": "mindcareai_pr", "version": "3.0.0"}