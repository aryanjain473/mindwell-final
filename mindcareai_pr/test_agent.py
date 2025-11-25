# test_agent.py
from agent_graph import run_agent_step
from email_utils import send_summary_email

print("🧠 MindCare AI Test Chat (LangGraph Agent)\n(Type 'exit' to quit)\n")

# Test user/session
user_id = "test_user"
session_id = "test_session1"

conversation_history = []

while True:
    user_input = input("You: ")
    if user_input.lower() == "exit":
        break

    # Run one step through the LangGraph agent
    result = run_agent_step(
        user_id=user_id,
        session_id=session_id,
        user_text=user_input,
        language="en"
    )

    reply = result.get("reply") or result.get("question") or "..."
    print(f"AI: {reply}")

    conversation_history.append({"role": "user", "text": user_input})
    conversation_history.append({"role": "assistant", "text": reply})

    # Risk detection
    if result.get("risk") == "high":
        print("⚠️ Risk detected: Please seek immediate professional help or call a crisis hotline.")
        break

# --- End of Chat ---
print("\n📝 Session Summary:")
summary = result.get("summary")
if not summary:
    # If summary wasn’t generated yet, explicitly request it
    final = run_agent_step(
        user_id=user_id,
        session_id=session_id,
        user_text="end",
        language="en"
    )
    summary = final.get("summary", "")

print(summary)

# --- Email Sending ---
print("\n📧 Let's send this summary via email.")
user_name = input("Enter your name: ")
to_email = input("Enter recipient email: ")

try:
    send_summary_email(to_email, "MindCare AI Session Summary", summary, user_name)
    print(f"✅ Summary sent successfully to {to_email}")
except Exception as e:
    print(f"❌ Failed to send email: {e}")
