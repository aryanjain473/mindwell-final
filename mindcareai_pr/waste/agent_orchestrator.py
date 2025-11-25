# agent_orchestrator.py
import os
from typing import Dict, Any

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage

# Import tools
from tools.sentiment_tool import analyze_sentiment
from tools.wikipedia_tool import search_wikipedia
from tools.arxiv_tool import search_arxiv

# Import MentalHealthAgent core
from waste.mental_health_agent import (
    generate_empathetic_reply,
    generate_next_question,
    summarize_session,
    risk_check
)

from memory import load_memory, save_message

load_dotenv()

# =========================
# Config & LLM
# =========================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model=MODEL,
    temperature=0.6
)


# =========================
# Orchestrator Agent
# =========================
class AgentOrchestrator:
    """
    This orchestrator decides whether to:
    - Use LLM directly for empathetic chat
    - Call a tool (sentiment, Wikipedia, ArXiv)
    """

    def __init__(self, user_id: str, language: str = "en"):
        self.user_id = user_id
        self.language = language
        self.conversation_history = load_memory(user_id)

    def _add_to_memory(self, role: str, text: str):
        save_message(self.user_id, role, text)
        self.conversation_history.append({"role": role, "text": text})

    def route_message(self, user_text: str) -> Dict[str, Any]:
        """
        Decide how to handle the user message.
        """
        # Always store user input
        self._add_to_memory("user", user_text)

        # Step 1: Check for risk
        risk_level = risk_check(user_text)
        if risk_level == "high":
            crisis_msg = (
                "⚠️ I’m really concerned about your safety. "
                "If you are in immediate danger, please call your local emergency number. "
                "You can also reach a trusted person or a licensed professional in your area."
            )
            self._add_to_memory("assistant", crisis_msg)
            return {"type": "safety", "text": crisis_msg, "risk": "high"}

        # Step 2: Tool or LLM?
        decision_prompt = (
            "You are an AI assistant orchestrator. "
            "Decide if the user's request needs:\n"
            "- 'sentiment' → run a quick sentiment analysis\n"
            "- 'wikipedia' → search factual info\n"
            "- 'arxiv' → search academic papers\n"
            "- 'chat' → continue mental health conversation\n\n"
            f"User: {user_text}\n\nAnswer with only one word: sentiment, wikipedia, arxiv, chat"
        )
        decision = llm([SystemMessage(content=decision_prompt)])
        decision = decision.content.strip().lower()

        # Step 3: Call the right handler
        if decision == "sentiment":
            result = analyze_sentiment(user_text)
            reply = f"📝 Sentiment detected: {result['label']} (score={result['polarity']:.2f})"
        elif decision == "wikipedia":
            reply = search_wikipedia(user_text)
        elif decision == "arxiv":
            reply = search_arxiv(user_text)
        else:  # default = empathetic chat
            reply = generate_empathetic_reply(user_text, self.language)

        # Store assistant reply
        self._add_to_memory("assistant", reply)

        return {
            "type": decision,
            "text": reply,
            "risk": risk_level
        }

    def summarize(self) -> str:
        """Return structured session summary."""
        return summarize_session(self.conversation_history, self.language)
