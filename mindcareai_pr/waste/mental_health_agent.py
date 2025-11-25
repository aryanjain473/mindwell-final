# mental_health_agent.py
import os
from typing import List, Dict, Any, Optional, Tuple

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage

# === NEW: Memory import ===
from memory import load_memory, save_message, clear_memory

# === NEW: Tool imports (stubs for orchestrator use) ===
from tools.sentiment_tool import analyze_sentiment
# from tools.wikipedia_tool import search_wikipedia   # uncomment when ready
# from tools.arxiv_tool import search_arxiv           # uncomment when ready

load_dotenv()

# =========================
# Config & LLM
# =========================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model=MODEL,
    temperature=0.7
)

LANG_MAP = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "pa": "Punjabi",
}

# =========================
# Safety / Risk detection
# =========================
RISK_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die",
    "hurt myself", "no reason to live", "cut myself", "self harm",
    "self-harm", "harm myself", "die by suicide", "suicidal"
]

def risk_check(text: str) -> str:
    text_lower = text.lower()
    return "high" if any(kw in text_lower for kw in RISK_KEYWORDS) else "low"


# =========================
# LLM helper
# =========================
def _call_llm(system_prompt: str, user_content: str) -> str:
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content)
    ]
    resp = llm(messages)
    return resp.content.strip()


# =========================
# Core generators
# =========================
def generate_empathetic_reply(user_text: str, language: str = "en") -> str:
    lang_name = LANG_MAP.get(language, "English")
    system_prompt = (
        "You are a compassionate, non-judgmental mental health assistant. "
        f"Respond in {lang_name}. Keep 2–3 sentences. "
        "Validate feelings in plain language, reflect back one key concern, "
        "and offer one simple coping suggestion. "
        "Avoid medical diagnoses. If user appears at immediate risk, encourage contacting local emergency services or trusted support."
    )
    return _call_llm(system_prompt, user_text)


def generate_next_question(conversation_history: List[Dict[str, str]], language: str = "en") -> str:
    lang_name = LANG_MAP.get(language, "English")
    convo_text = "\n".join(f"{m['role'].capitalize()}: {m['text']}" for m in conversation_history)

    system_prompt = (
        "You are a supportive mental health assistant. "
        f"Ask the next best open-ended QUESTION in {lang_name}, under 20 words. "
        "Be gentle and specific to the user's recent message. "
        "Do not include guidance or tips here—just a question. "
        "If the conversation seems complete, ask a brief closing question inviting anything else to share."
    )
    return _call_llm(system_prompt, convo_text)


def summarize_session(conversation_history: List[Dict[str, str]], language: str = "en") -> str:
    """
    Summarize the conversation in a structured way suitable for both plain text and HTML emails.
    """
    lang_name = LANG_MAP.get(language, "English")
    convo_text = "\n".join(f"{m['role'].capitalize()}: {m['text']}" for m in conversation_history)

    system_prompt = (
        f"Summarize the conversation in {lang_name} with clear sections:\n\n"
        "### Overall Mood\n- ...\n"
        "### Sleep\n- ...\n"
        "### Appetite\n- ...\n"
        "### Main Stressors\n- ...\n"
        "### Protective Factors / Supports\n- ...\n"
        "### Risk Level\n- Low/Medium/High (based on user content)\n"
        "### Suggested Next Steps\n- 2–3 gentle coping suggestions (non-clinical)\n\n"
        "Tone: supportive, neutral, therapist-friendly. Avoid medical diagnoses. Keep bullet style."
    )
    return _call_llm(system_prompt, convo_text)


# =========================
# Tool Wrappers (stubs)
# =========================
def use_sentiment_tool(text: str) -> Dict[str, Any]:
    """Wrapper for sentiment analysis tool."""
    return analyze_sentiment(text)

def use_wikipedia_tool(query: str) -> str:
    """Stub for Wikipedia search (to be filled by orchestrator)."""
    return f"(Wikipedia search for '{query}' not yet integrated here.)"

def use_arxiv_tool(query: str) -> str:
    """Stub for ArXiv search (to be filled by orchestrator)."""
    return f"(ArXiv search for '{query}' not yet integrated here.)"


# =========================
# Conversation Manager (with MEMORY)
# =========================
class MentalHealthAgent:
    def __init__(self, user_id: str, language: str = "en", max_questions: int = 4):
        self.user_id = user_id
        self.language = language
        self.max_questions = max_questions

        # Load memory (persistent conversation history)
        self.conversation_history: List[Dict[str, str]] = load_memory(user_id)

        # Continue question count if memory already exists
        self.question_count = sum(1 for m in self.conversation_history if m["role"] == "assistant")

        self.ended = False
        self.summary_cached: Optional[str] = None

    # ---------- Utilities ----------
    def _add(self, role: str, text: str):
        self.conversation_history.append({"role": role, "text": text})
        save_message(self.user_id, role, text)

    def start_prompt(self) -> str:
        opening = "I’m here to listen. How have you been feeling lately?"
        if self.language != "en":
            opening = _call_llm(
                f"Translate this into {LANG_MAP.get(self.language,'English')} in a warm, conversational tone.",
                "I’m here to listen. How have you been feeling lately?"
            )
        self._add("assistant", opening)
        self.question_count += 1
        return opening

    # ---------- Main step ----------
    def process_user_message(self, user_text: str, continue_chat: bool = False) -> Dict[str, Any]:
        if self.ended and not continue_chat:
            return {
                "finished": True,
                "message": "Session already ended. Would you like to continue chatting?",
                "summary": self._ensure_summary()
            }

        self._add("user", user_text)

        risk_level = risk_check(user_text)

        crisis_message = None
        if risk_level == "high":
            crisis_message = (
                "I’m really sorry you’re feeling this way. Your safety matters. "
                "If you might be in immediate danger, please contact your local emergency services, "
                "reach a trusted person nearby, or a licensed professional/helpline in your area."
            )
            self._add("assistant", crisis_message)

        empathetic = generate_empathetic_reply(user_text, self.language)
        self._add("assistant", empathetic)

        can_ask_more = (self.question_count < self.max_questions) or continue_chat

        if can_ask_more:
            next_q = generate_next_question(self.conversation_history, self.language)
            self._add("assistant", next_q)
            self.question_count += 1

            return {
                "finished": False,
                "risk_level": risk_level,
                "messages": [
                    {"type": "safety", "text": crisis_message} if crisis_message else None,
                    {"type": "reply", "text": empathetic},
                    {"type": "question", "text": next_q},
                ],
                "question_count": self.question_count,
                "soft_limit": self.max_questions
            }
        else:
            self.ended = True
            summary = self._ensure_summary()

            closing_prompt = "Would you like to continue chatting, or should I send your session summary?"
            if self.language != "en":
                closing_prompt = _call_llm(
                    f"Translate into {LANG_MAP.get(self.language,'English')} with a gentle tone.",
                    closing_prompt
                )
            self._add("assistant", closing_prompt)

            return {
                "finished": True,
                "risk_level": risk_level,
                "messages": [
                    {"type": "reply", "text": empathetic},
                    {"type": "closing", "text": closing_prompt}
                ],
                "summary": summary,
                "question_count": self.question_count,
                "soft_limit": self.max_questions
            }

    # ---------- Summary ----------
    def _ensure_summary(self) -> str:
        if self.summary_cached is None:
            self.summary_cached = summarize_session(self.conversation_history, self.language)
        return self.summary_cached

    def end_session_summary(self) -> str:
        self.ended = True
        return self._ensure_summary()

    def get_summary_for_email(self, user_name: str) -> Tuple[str, str]:
        """
        Returns (plain_text, html_ready_text) for email sending.
        """
        summary = self._ensure_summary()

        plain_text = f"Dear {user_name},\n\nHere’s a summary of your recent session:\n\n{summary}\n\n— MindCare AI"
        html_ready = summary.replace("\n", "<br>")

        return plain_text, html_ready

    # ---------- Memory Controls ----------
    def reset_memory(self):
        clear_memory(self.user_id)
        self.conversation_history = []
        self.question_count = 0
        self.ended = False
        self.summary_cached = None

    # ---------- Export ----------
    def get_history(self) -> List[Dict[str, str]]:
        return list(self.conversation_history)