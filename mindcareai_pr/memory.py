import json
import os
from datetime import datetime
import uuid
from typing import Dict, Any, Optional
from langgraph.store.memory import InMemoryStore

# File to store memory
# keep memory.json next to this module to avoid scattering files in CWD
BASE_DIR = os.path.dirname(__file__)
MEMORY_FILE = os.path.join(BASE_DIR, "memory.json")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "checkpoints")
MAX_MEMORY_LENGTH = 10  # keep only last 10 messages per user


# ---------- Internal Helpers ----------
def _load_data():
    """Load full memory file safely and normalize legacy keys."""
    if not os.path.exists(MEMORY_FILE):
        return {}
    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

    migrated = False
    # Normalize legacy messages that used "message" -> convert to "text"
    if isinstance(data, dict):
        for user_id, msgs in data.items():
            if isinstance(msgs, list):
                for msg in msgs:
                    if isinstance(msg, dict):
                        if "message" in msg and "text" not in msg:
                            # migrate old key to new key in-memory
                            msg["text"] = msg.pop("message")
                            migrated = True

    # Persist migration back to disk so legacy files are upgraded once
    if migrated:
        _save_data(data)

    return data


def _save_data(data: dict):
    """Save full memory file safely."""
    # Write atomically: write to a temp file then replace the target.
    temp_path = MEMORY_FILE + ".tmp"
    # Ensure directory exists (defensive)
    os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    # Atomic replace
    os.replace(temp_path, MEMORY_FILE)


# ---------- Short-term Memory Manager ----------
class ShortTermMemoryManager:
    """Manages short-term memory for active chat sessions using LangGraph's InMemoryStore."""
    
    def __init__(self):
        self.store = InMemoryStore()
        self.active_sessions: Dict[str, str] = {}  # user_id -> thread_id mapping
    
    def start_session(self, user_id: str, session_id: str) -> str:
        """Start a new short-term memory session and return thread_id."""
        thread_id = f"session_{session_id}_{user_id}"
        self.active_sessions[user_id] = thread_id
        return thread_id
    
    def add_message(self, user_id: str, role: str, message: str, metadata: Optional[Dict[str, Any]] = None):
        """Add a message to short-term memory."""
        if user_id not in self.active_sessions:
            return
        
        thread_id = self.active_sessions[user_id]
        
        # Store message with metadata
        message_data = {
            "role": role,
            "text": message,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Use LangGraph's store to persist the message
        self.store.put(thread_id, f"message_{datetime.now().timestamp()}", message_data)
    
    def get_conversation_history(self, user_id: str) -> list:
        """Get conversation history from short-term memory."""
        if user_id not in self.active_sessions:
            return []
        
        thread_id = self.active_sessions[user_id]
        
        # Get all messages for this thread
        messages = []
        try:
            # Get all keys for this thread
            all_data = self.store.get(thread_id)
            if all_data:
                # Sort by timestamp and return as list
                sorted_messages = sorted(all_data.items(), key=lambda x: x[1].get('timestamp', ''))
                messages = [msg_data for key, msg_data in sorted_messages]
        except Exception:
            pass
        
        return messages
    
    def get_context_for_llm(self, user_id: str, max_messages: int = 10) -> str:
        """Get formatted conversation context for LLM."""
        history = self.get_conversation_history(user_id)
        
        # Take only the last max_messages
        recent_history = history[-max_messages:] if len(history) > max_messages else history
        
        context_parts = []
        for msg in recent_history:
            role = msg.get('role', 'User').capitalize()
            text = msg.get('text', '')
            context_parts.append(f"{role}: {text}")
        
        return "\n".join(context_parts)
    
    def end_session(self, user_id: str):
        """End the short-term memory session and clean up."""
        if user_id in self.active_sessions:
            thread_id = self.active_sessions[user_id]
            # Clear the thread data
            try:
                self.store.delete(thread_id)
            except Exception:
                pass
            # Remove from active sessions
            del self.active_sessions[user_id]
    
    def is_session_active(self, user_id: str) -> bool:
        """Check if user has an active short-term memory session."""
        return user_id in self.active_sessions


# ---------- Memory Manager Class ----------
class MemoryManager:
    def __init__(self, max_length: int = MAX_MEMORY_LENGTH):
        self.max_length = max_length
        self.short_term = ShortTermMemoryManager()  # Add short-term memory

    def start_session(self, user_id: str):
        """Initialize an empty session for a user."""
        data = _load_data()
        if user_id not in data:
            data[user_id] = []
            _save_data(data)

    def add_message(self, user_id: str, role: str, message: str):
        """Save a message (user or agent) to memory."""
        data = _load_data()
        if user_id not in data:
            data[user_id] = []

        # store using "text" key to match agent_graph and other modules
        data[user_id].append({
            "role": role,
            "text": message,
            "timestamp": datetime.now().isoformat()
        })

        # Keep memory short
        if len(data[user_id]) > self.max_length:
            data[user_id] = data[user_id][-self.max_length:]

        _save_data(data)

    def get_history(self, user_id: str):
        """Get conversation history for a user."""
        data = _load_data()
        return data.get(user_id, [])

    def clear(self, user_id: str):
        """Clear memory for a specific user."""
        data = _load_data()
        if user_id in data:
            del data[user_id]
            _save_data(data)

    # Backward-compatible alias used elsewhere in the project
    def end_session(self, user_id: str):
        """Alias to clear() for compatibility with older callers."""
        return self.clear(user_id)

    def get_full_conversation(self, user_id: str) -> str:
        """Return formatted conversation history for context."""
        history = self.get_history(user_id)
        return "\n".join([
            f"{msg.get('role','User').capitalize()}: {msg.get('text', '')}"
            for msg in history
        ])

    # ---------- Checkpointing ----------
    def save_checkpoint(self, user_id: str, *, label: str | None = None, extra: dict | None = None) -> dict:
        """Persist an immutable snapshot of the user's memory.

        Returns a metadata dict containing checkpoint_id and path.
        """
        os.makedirs(CHECKPOINT_DIR, exist_ok=True)
        checkpoint_id = f"{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}_{uuid.uuid4().hex[:8]}"
        filename = f"{user_id}__{checkpoint_id}.json"
        path = os.path.join(CHECKPOINT_DIR, filename)

        payload = {
            "user_id": user_id,
            "checkpoint_id": checkpoint_id,
            "label": label or "auto",
            "created_at": datetime.utcnow().isoformat(),
            "history": self.get_history(user_id),
            "extra": extra or {},
        }

        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

        return {"checkpoint_id": checkpoint_id, "path": path}

    def list_checkpoints(self, user_id: str) -> list[dict]:
        """List checkpoints for a user (lightweight metadata)."""
        if not os.path.isdir(CHECKPOINT_DIR):
            return []
        items: list[dict] = []
        for name in os.listdir(CHECKPOINT_DIR):
            if not name.startswith(f"{user_id}__") or not name.endswith(".json"):
                continue
            path = os.path.join(CHECKPOINT_DIR, name)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                items.append({
                    "checkpoint_id": data.get("checkpoint_id"),
                    "label": data.get("label"),
                    "created_at": data.get("created_at"),
                })
            except Exception:
                continue
        # newest first
        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return items

    def restore_checkpoint(self, user_id: str, checkpoint_id: str) -> bool:
        """Replace current memory with a checkpoint snapshot."""
        filename_prefix = f"{user_id}__{checkpoint_id}"
        candidate = None
        if os.path.isdir(CHECKPOINT_DIR):
            for name in os.listdir(CHECKPOINT_DIR):
                if name.startswith(filename_prefix) and name.endswith(".json"):
                    candidate = os.path.join(CHECKPOINT_DIR, name)
                    break
        if not candidate:
            return False
        try:
            with open(candidate, "r", encoding="utf-8") as f:
                data = json.load(f)
            # overwrite user's history with checkpoint
            full = _load_data()
            full[user_id] = data.get("history", [])
            _save_data(full)
            return True
        except Exception:
            return False


# ---------- Singleton ----------
memory_manager = MemoryManager()
