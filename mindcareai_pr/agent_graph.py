# agent_graph.py
import os
from typing import List, TypedDict, Optional, Literal, Dict, Any

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# Tools
from tools.wikipedia_tool import search_wikipedia
from tools.sentiment_tool import analyze_sentiment
from tools.emotion_tool import analyze_emotion
from tools.feature_recommender import recommend_features

# Local memory
from memory import memory_manager

load_dotenv()

# -----------------------------
# LLM Setup
# -----------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model=MODEL,
    temperature=0.6,
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

# -----------------------------
# Safety / Risk
# -----------------------------
RISK_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die",
    "hurt myself", "no reason to live", "cut myself", "self harm",
    "self-harm", "harm myself", "die by suicide", "suicidal"
]

def risk_check(text: str) -> Literal["high", "low"]:
    t = (text or "").lower()
    return "high" if any(kw in t for kw in RISK_KEYWORDS) else "low"

# -----------------------------
# LLM Helpers
# -----------------------------
def _call_llm(system_prompt: str, user_content: str) -> str:
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]
    resp = llm(messages)
    return (resp.content or "").strip()

def empathetic_reply(user_text: str, language: str = "en", conversation_context: str = "", emotion_data: dict = None, facial_emotion: dict = None) -> str:
    lang_name = LANG_MAP.get(language, "English")
    
    # Check if this is a personal question about conversation details
    text_lower = user_text.lower()
    is_personal_question = any(phrase in text_lower for phrase in [
        "my name", "what's my name", "what is my name", "do you know my name",
        "remember me", "do you remember", "what did i say", "what did i tell you"
    ])
    
    # Build context-aware prompt
    context_info = ""
    if conversation_context:
        context_info = f"\n\nPrevious conversation context:\n{conversation_context}"
    
    # Add emotion context if available (combine text and facial emotion)
    emotion_context = ""
    emotion_sources = []
    
    # Text-based emotion
    if emotion_data:
        emotion = emotion_data.get("emotion", "")
        confidence = emotion_data.get("confidence", 0)
        risk = emotion_data.get("risk", "low")
        
        if emotion and confidence > 0.5:  # Only use if confident
            emotion_sources.append(f"text analysis shows {emotion} (confidence: {confidence:.2f}, risk: {risk})")
    
    # Facial emotion
    if facial_emotion:
        facial_emo = facial_emotion.get("emotion", "")
        facial_conf = facial_emotion.get("confidence", 0)
        facial_mood = facial_emotion.get("mood")
        
        if facial_emo and facial_conf and facial_conf > 0.5:  # Only use if confident
            mood_info = f" (mood level: {facial_mood}/10)" if facial_mood else ""
            emotion_sources.append(f"facial expression shows {facial_emo} (confidence: {facial_conf:.2f}{mood_info})")
    
    # Combine emotion information
    if emotion_sources:
        emotion_context = f"\n\nEmotion Analysis: {' and '.join(emotion_sources)}. Use this comprehensive emotional information to provide personalized, targeted support and recommendations."
    
    if is_personal_question:
        system_prompt = (
            "You are a compassionate mental health assistant having a conversation with a user. "
            f"Respond in {lang_name}. "
            "The user is asking about information from your current conversation. "
            "Look through the conversation context and provide the information they're asking for. "
            "If they ask for their name, look for where they mentioned their name in the conversation. "
            "If they ask what they told you, summarize the key things they shared. "
            "Be warm and personal, using their name if you found it in the conversation. "
            "If you can't find the specific information they're asking for, kindly let them know you don't have that information from this conversation."
        )
    else:
        system_prompt = (
            "You are a compassionate, non-judgmental mental health assistant. "
            f"Respond in {lang_name}. Keep 2–3 sentences. "
            "Validate feelings in plain language, reflect back one key concern, "
            "and offer one simple coping suggestion. "
            "Use the user's name if mentioned in the conversation context. "
            "Be personal and remember details from the current conversation. "
            "If emotion analysis is provided, use it to tailor your response to their emotional state. "
            "You can mention that helpful features and resources are available below, but don't list them in detail. "
            "Avoid medical diagnoses. If user appears at immediate risk, encourage contacting local emergency services or trusted support."
        )
    
    full_user_content = user_text + context_info + emotion_context
    return _call_llm(system_prompt, full_user_content)

def generate_recommendations(text_emotion: dict = None, facial_emotion: dict = None, user_text: str = "") -> List[Dict[str, Any]]:
    """
    Generate personalized recommendations based on combined text and facial emotion analysis.
    Only generates recommendations if facial emotion is detected.
    Returns a list of recommendation dictionaries with YouTube videos and blog links.
    """
    recommendations = []
    
    # Only generate recommendations if facial emotion is detected
    if not facial_emotion or not facial_emotion.get("emotion"):
        return recommendations  # Return empty if no facial emotion
    
    # Emotion mapping to activities, YouTube videos, and blog links
    emotion_resources = {
        "sad": {
            "activities": ["Guided meditation", "Light walk", "Journaling", "Deep breathing"],
            "youtube_videos": [
                {
                    "title": "10 Minute Meditation for Depression & Anxiety",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Guided meditation to help ease feelings of sadness"
                },
                {
                    "title": "Calming Mood Lighting - Soft Warm Lights",
                    "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    "description": "Relaxing mood lighting video to create a peaceful atmosphere"
                },
                {
                    "title": "Mood Boosting Music - Uplifting & Happy",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Calming music to help improve your mood"
                }
            ],
            "blog_links": [
                {
                    "title": "Coping with Depression: 10 Tips",
                    "url": "https://www.healthline.com/health/depression/how-to-fight-depression",
                    "description": "Practical strategies for managing depression"
                },
                {
                    "title": "Understanding and Managing Sadness",
                    "url": "https://www.verywellmind.com/how-to-deal-with-sadness-3144590",
                    "description": "Learn healthy ways to process and manage sadness"
                }
            ]
        },
        "sadness": {
            "activities": ["Guided meditation", "Light walk", "Journaling", "Deep breathing"],
            "youtube_videos": [
                {
                    "title": "10 Minute Meditation for Depression & Anxiety",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Guided meditation to help ease feelings of sadness"
                },
                {
                    "title": "Mood Boosting Music - Uplifting & Happy",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Calming music to help improve your mood"
                }
            ],
            "blog_links": [
                {
                    "title": "Coping with Depression: 10 Tips",
                    "url": "https://www.healthline.com/health/depression/how-to-fight-depression",
                    "description": "Practical strategies for managing depression"
                }
            ]
        },
        "happy": {
            "activities": ["Gratitude practice", "Share positivity", "Social connection", "Continue joyful activities"],
            "youtube_videos": [
                {
                    "title": "Warm Mood Lighting - Cozy Atmosphere",
                    "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    "description": "Beautiful warm lighting to maintain your positive mood"
                },
                {
                    "title": "Morning Gratitude Practice",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Start your day with gratitude and positivity"
                },
                {
                    "title": "Happy Mood Playlist - Upbeat Music",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Maintain your positive energy with uplifting music"
                }
            ],
            "blog_links": [
                {
                    "title": "How to Maintain Positive Mental Health",
                    "url": "https://www.healthline.com/health/mental-health/how-to-maintain-positive-mental-health",
                    "description": "Tips for sustaining positive mental wellbeing"
                }
            ]
        },
        "anger": {
            "activities": ["Physical exercise", "Breathing exercises", "Stress-relief techniques", "Mindful walking"],
            "youtube_videos": [
                {
                    "title": "Anger Management Meditation",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Meditation techniques to help manage anger"
                },
                {
                    "title": "5 Minute Breathing Exercise for Anger",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Quick breathing exercises to calm anger"
                },
                {
                    "title": "Yoga for Anger and Stress Relief",
                    "url": "https://www.youtube.com/watch?v=hJbRpHZr_d0",
                    "description": "Yoga poses to release tension and anger"
                }
            ],
            "blog_links": [
                {
                    "title": "Anger Management: Tips and Techniques",
                    "url": "https://www.healthline.com/health/anger-management",
                    "description": "Effective strategies for managing anger"
                },
                {
                    "title": "Understanding Anger and How to Control It",
                    "url": "https://www.verywellmind.com/anger-management-strategies-4178870",
                    "description": "Learn about anger and healthy coping mechanisms"
                }
            ]
        },
        "angry": {
            "activities": ["Physical exercise", "Breathing exercises", "Stress-relief techniques", "Mindful walking"],
            "youtube_videos": [
                {
                    "title": "Anger Management Meditation",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Meditation techniques to help manage anger"
                },
                {
                    "title": "5 Minute Breathing Exercise for Anger",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Quick breathing exercises to calm anger"
                }
            ],
            "blog_links": [
                {
                    "title": "Anger Management: Tips and Techniques",
                    "url": "https://www.healthline.com/health/anger-management",
                    "description": "Effective strategies for managing anger"
                }
            ]
        },
        "fear": {
            "activities": ["Grounding exercises", "Deep breathing", "Progressive muscle relaxation", "Calming music"],
            "youtube_videos": [
                {
                    "title": "Soothing Mood Lighting for Anxiety",
                    "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    "description": "Calming mood lighting to help reduce anxiety and fear"
                },
                {
                    "title": "Grounding Techniques for Anxiety",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Learn grounding exercises to manage fear and anxiety"
                },
                {
                    "title": "Calming Anxiety with Breathing Exercises",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Breathing techniques to calm fear and anxiety"
                }
            ],
            "blog_links": [
                {
                    "title": "Coping with Anxiety and Fear",
                    "url": "https://www.healthline.com/health/anxiety/how-to-cope-with-anxiety",
                    "description": "Practical tips for managing anxiety and fear"
                },
                {
                    "title": "Understanding Anxiety Disorders",
                    "url": "https://www.verywellmind.com/anxiety-disorders-4157215",
                    "description": "Learn about anxiety and effective treatment options"
                }
            ]
        },
        "anxiety": {
            "activities": ["Grounding exercises", "Deep breathing", "Progressive muscle relaxation", "Calming music"],
            "youtube_videos": [
                {
                    "title": "Grounding Techniques for Anxiety",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Learn grounding exercises to manage anxiety"
                },
                {
                    "title": "Calming Anxiety with Breathing Exercises",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Breathing techniques to calm anxiety"
                }
            ],
            "blog_links": [
                {
                    "title": "Coping with Anxiety and Fear",
                    "url": "https://www.healthline.com/health/anxiety/how-to-cope-with-anxiety",
                    "description": "Practical tips for managing anxiety"
                }
            ]
        },
        "neutral": {
            "activities": ["Mindfulness meditation", "Gentle walk", "Gratitude practice", "Calming music"],
            "youtube_videos": [
                {
                    "title": "Peaceful Mood Lighting - Ambient Atmosphere",
                    "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    "description": "Gentle mood lighting for a balanced, peaceful environment"
                },
                {
                    "title": "10 Minute Mindfulness Meditation",
                    "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    "description": "Practice mindfulness for emotional balance"
                },
                {
                    "title": "Calming Music for Relaxation",
                    "url": "https://www.youtube.com/watch?v=4zLfCnGVeL4",
                    "description": "Peaceful music for relaxation and balance"
                }
            ],
            "blog_links": [
                {
                    "title": "Mindfulness and Mental Health",
                    "url": "https://www.healthline.com/health/mindfulness",
                    "description": "Learn about the benefits of mindfulness practice"
                }
            ]
        }
    }
    
    # Get primary emotion from facial emotion (required for recommendations)
    primary_emotion = facial_emotion.get("emotion", "").lower()
    mood_score = facial_emotion.get("mood", 5)
    confidence = facial_emotion.get("confidence", 0.5)
    
    # Get resources for this emotion
    emotion_data = emotion_resources.get(primary_emotion, emotion_resources["neutral"])
    activities = emotion_data.get("activities", [])
    youtube_videos = emotion_data.get("youtube_videos", [])
    blog_links = emotion_data.get("blog_links", [])
    
    # Add activities (limit based on mood)
    if mood_score <= 3:
        # Low mood - focus on support and self-care
        for i, activity in enumerate(activities[:2], 1):
            recommendations.append({
                "type": "activity",
                "title": activity,
                "description": f"Try {activity.lower()} to help improve your mood",
                "priority": 5 - i
            })
    else:
        # Medium to high mood
        for i, activity in enumerate(activities[:2], 1):
            recommendations.append({
                "type": "activity",
                "title": activity,
                "description": f"Consider {activity.lower()} for emotional wellness",
                "priority": 3
            })
    
    # Add YouTube videos (always include 2-3 videos)
    for video in youtube_videos[:3]:
        recommendations.append({
            "type": "video",
            "title": video["title"],
            "description": video["description"],
            "url": video["url"],
            "priority": 4 if mood_score <= 3 else 3
        })
    
    # Add blog links (1-2 links)
    for blog in blog_links[:2]:
        recommendations.append({
            "type": "blog",
            "title": blog["title"],
            "description": blog["description"],
            "url": blog["url"],
            "priority": 3
        })
    
    # Add crisis resources for high-risk situations
    if text_emotion and text_emotion.get("risk") == "high":
        recommendations.append({
            "type": "resource",
            "title": "Crisis Support Resources",
            "description": "If you're in immediate distress, please reach out to crisis helplines or trusted support",
            "url": "https://www.crisistextline.org/",
            "priority": 5
        })
    
    # Sort by priority (higher priority first)
    recommendations.sort(key=lambda x: x.get("priority", 3), reverse=True)
    
    return recommendations[:8]  # Return top 8 recommendations

def next_question(history: List[Dict[str, str]], language: str = "en") -> str:
    lang_name = LANG_MAP.get(language, "English")
    # ✅ normalize "text" / "content"
    convo_text = "\n".join(
        f"{m.get('role', 'User').capitalize()}: {m.get('text') or m.get('content', '')}"
        for m in history if (m.get("text") or m.get("content"))
    )
    system_prompt = (
        "You are a supportive mental health assistant. "
        f"Ask the next best open-ended QUESTION in {lang_name}, under 20 words. "
        "Be gentle and specific to the user's recent message. "
        "Use the user's name if mentioned in the conversation. "
        "Be personal and reference previous conversation details. "
        "Do not include guidance or tips here—just a question. "
        "If the conversation seems complete, ask a brief closing question inviting anything else to share."
    )
    return _call_llm(system_prompt, convo_text)

def summarize(history: List[Dict[str, str]], language: str = "en") -> str:
    lang_name = LANG_MAP.get(language, "English")
    # ✅ normalize "text" / "content"
    convo_text = "\n".join(
        f"{m.get('role', 'User').capitalize()}: {m.get('text') or m.get('content', '')}"
        for m in history if (m.get("text") or m.get("content"))
    )
    system_prompt = (
        f"""
            You are summarizing a mental health support session. 
            Extract user information explicitly mentioned in the conversation. 
            Fill out the following categories as best as possible. 
            If the user mentions something indirectly, infer it. 
            Only say "No information provided" if the user truly gave no clue.

            Conversation:
            {convo_text}

            Now create a structured summary in {lang_name}:
            ### Overall Mood
            (Describe the mood based on conversation)

             BOLD(Sleep)
            (Summarize sleep-related issues if mentioned. Example: "User reported trouble falling asleep" instead of "No information provided".)

            Appetite
            (Summarize appetite-related mentions if any.)

             Main Stressors
            (Identify specific problems or stressors like exams, family issues, health concerns.)

             Protective Factors / Supports
            (Any support system or coping strategies mentioned.)

            ### Risk Level
            (Low, Medium, High - based on severity of stress, hopelessness, or harmful thoughts.)
            """
    )
    return _call_llm(system_prompt, convo_text)

# -----------------------------
# Graph State
# -----------------------------
class AgentState(TypedDict):
    user_id: str
    session_id: str
    language: str
    input_text: str
    messages: List[Dict[str, str]]
    risk: Literal["high", "low"]
    sentiment: Optional[Dict[str, Any]]
    emotion: Optional[Dict[str, Any]]  # Text-based emotion analysis
    facial_emotion: Optional[Dict[str, Any]]  # Facial emotion data
    reply: Optional[str]
    question: Optional[str]
    summary: Optional[str]
    done: bool
    recommendations: Optional[List[Dict[str, Any]]]  # Personalized recommendations

# -----------------------------
# Nodes
# -----------------------------
def node_init(state: AgentState) -> AgentState:
    # Initialize with existing messages from state (LangGraph checkpointer handles persistence)
    if not state.get("messages"):
        state["messages"] = []
    
    # Add current user input to messages if it's not already there
    current_input = state.get("input_text", "").strip()
    if current_input and state["messages"]:
        # Check if this input is already the last user message
        last_msg = state["messages"][-1] if state["messages"] else {}
        if last_msg.get("role") != "user" or last_msg.get("text") != current_input:
            state["messages"].append({"role": "user", "text": current_input})
    elif current_input and not state["messages"]:
        state["messages"].append({"role": "user", "text": current_input})
    
    state.setdefault("language", "en")
    state.setdefault("risk", "low")
    state.setdefault("sentiment", None)
    state.setdefault("emotion", None)
    state.setdefault("facial_emotion", None)
    state.setdefault("reply", None)
    state.setdefault("question", None)
    state.setdefault("summary", None)
    state.setdefault("done", False)
    state.setdefault("recommendations", None)
    return state

def node_risk_check(state: AgentState) -> AgentState:
    state["risk"] = risk_check(state.get("input_text", "") or "")
    return state

def node_sentiment(state: AgentState) -> AgentState:
    text = state.get("input_text", "") or ""
    if text.strip():
        state["sentiment"] = analyze_sentiment(text)
    return state

def node_emotion(state: AgentState) -> AgentState:
    """Analyze emotion using the trained ML model"""
    text = state.get("input_text", "") or ""
    if text.strip():
        try:
            emotion_data = analyze_emotion(text)
            state["emotion"] = emotion_data
            
            # Update risk level based on emotion analysis
            emotion_risk = emotion_data.get("risk", "low")
            current_risk = state.get("risk", "low")
            
            # Use higher risk level between keyword-based and emotion-based
            risk_levels = {"low": 1, "medium": 2, "high": 3}
            if risk_levels.get(emotion_risk, 1) > risk_levels.get(current_risk, 1):
                state["risk"] = emotion_risk
            
            # Also consider facial emotion risk if available
            facial_emotion = state.get("facial_emotion")
            if facial_emotion:
                facial_mood = facial_emotion.get("mood", 5)
                # Low mood (1-3) increases risk assessment
                if facial_mood <= 3 and risk_levels.get(current_risk, 1) < 2:
                    state["risk"] = "medium"
                
        except Exception as e:
            print(f"Emotion analysis failed: {e}")
            # Fallback to basic sentiment if emotion analysis fails
            pass
    return state

def node_crisis_response(state: AgentState) -> AgentState:
    crisis = (
        "I'm really sorry you're feeling this way. Your safety matters. "
        "If you might be in immediate danger, please contact your local emergency services, "
        "reach a trusted person nearby, or a licensed professional/helpline in your area."
    )
    state["reply"] = crisis
    state["messages"].append({"role": "assistant", "text": crisis})
    # Also update our custom memory for backup
    memory_manager.add_message(state["session_id"], "assistant", crisis)
    return state

def node_router(state: AgentState) -> AgentState:
    return state

def route_reply_or_knowledge(state: AgentState) -> str:
    text = (state.get("input_text") or "").lower()
    
    # Check for personal questions first (should use conversation context)
    personal_questions = [
        "my name", "what's my name", "what is my name", "do you know my name",
        "remember me", "do you remember", "what did i say", "what did i tell you",
        "my age", "my job", "my work", "my family", "my friends",
        "how am i feeling", "what am i feeling", "my mood", "my emotions"
    ]
    
    if any(phrase in text for phrase in personal_questions):
        return "normal"  # Use conversation context instead of knowledge lookup
    
    # Check for general knowledge questions
    if any(keyword in text for keyword in ["what is", "explain", "research", "study", "who is", "information"]):
        return "knowledge"
    
    return "normal"

def node_knowledge_lookup(state: AgentState) -> AgentState:
    text = state.get("input_text", "").strip()
    if not text:
        return state
    wiki_result = search_wikipedia(text)
    state["reply"] = wiki_result
    state["messages"].append({"role": "assistant", "text": wiki_result})
    # Also update our custom memory for backup
    memory_manager.add_message(state["session_id"], "assistant", wiki_result)
    return state

def node_empathetic_reply(state: AgentState) -> AgentState:
    text = state.get("input_text", "") or ""
    lang = state.get("language", "en")
    
    # Get conversation context from the state messages (LangGraph checkpointer)
    conversation_context = "\n".join([
        f"{msg.get('role', 'User').capitalize()}: {msg.get('text', '')}"
        for msg in state.get("messages", [])[-10:]  # Last 10 messages for context
    ])
    
    # Get emotion data for enhanced response (both text and facial)
    emotion_data = state.get("emotion")
    facial_emotion_data = state.get("facial_emotion")
    
    # Generate all types of recommendations
    recommendations = []
    
    # 1. Check if therapist recommendation is needed (highest priority)
    text_lower = text.lower()
    context_lower = conversation_context.lower()
    needs_professional = any(indicator in text_lower or indicator in context_lower for indicator in [
        "therapist", "counselor", "doctor", "professional", "help", "support",
        "can't cope", "struggling", "need help", "don't know what to do",
        "suicidal", "harm", "crisis", "emergency"
    ])
    
    risk_level = state.get("risk", "low")
    if needs_professional or risk_level in ["medium", "high"] or (emotion_data and emotion_data.get("risk") in ["medium", "high"]):
        therapist_recommendation = {
            "type": "therapist",
            "title": "Find Nearby Therapists",
            "description": "Connect with licensed mental health professionals",
            "route": "/therapists",
            "icon": "👨‍⚕️",
            "priority": 10,  # Highest priority
            "action": "nearby_search"
        }
        recommendations.append(therapist_recommendation)
    
    # 2. Generate MindWell feature recommendations (limit to 1-2 based on whether therapist is included)
    feature_recommendations = recommend_features(text, emotion_data, conversation_context)
    max_features = 2 if not recommendations else 1  # If therapist is included, only 1 feature
    recommendations.extend(feature_recommendations[:max_features])
    
    # 3. Only add content recommendations if we have space and facial emotion is detected
    if len(recommendations) < 2 and facial_emotion_data and facial_emotion_data.get("emotion"):
        content_recommendations = generate_recommendations(emotion_data, facial_emotion_data, text)
        # Only add top priority content recommendation if space available
        if content_recommendations:
            recommendations.append(content_recommendations[0])
    
    # Sort by priority and limit to exactly 2 recommendations
    recommendations.sort(key=lambda x: x.get("priority", 3), reverse=True)
    state["recommendations"] = recommendations[:2] if recommendations else None
    
    reply = empathetic_reply(text, lang, conversation_context, emotion_data, facial_emotion_data)
    state["reply"] = reply
    
    # Add assistant reply to messages (LangGraph checkpointer will persist this)
    state["messages"].append({"role": "assistant", "text": reply})
    
    # Also update our custom memory for backup
    memory_manager.add_message(state["session_id"], "assistant", reply)
    
    return state

def node_next_question(state: AgentState) -> AgentState:
    lang = state.get("language", "en")
    q = next_question(state["messages"], lang)
    state["question"] = q
    state["messages"].append({"role": "assistant", "text": q})
    # Also update our custom memory for backup
    memory_manager.add_message(state["session_id"], "assistant", q)
    return state

def node_summarize(state: AgentState) -> AgentState:
    lang = state.get("language", "en")
    state["summary"] = summarize(state["messages"], lang)
    state["done"] = True
    return state

# -----------------------------
# Routers / Conditions
# -----------------------------
def route_after_risk(state: AgentState) -> str:
    return "crisis" if state.get("risk") == "high" else "ok"

def route_continue_or_end(state: AgentState) -> str:
    text = (state.get("input_text") or "").strip().lower()
    if text in {"end", "finish", "stop", "done"}:
        return "end"
    assistant_turns = sum(1 for m in state["messages"] if m["role"] == "assistant")
    return "end" if assistant_turns >= 8 else "continue"

# -----------------------------
# Build Graph
# -----------------------------
def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("init", node_init)
    graph.add_node("risk_check", node_risk_check)
    graph.add_node("analyze_sentiment", node_sentiment)
    graph.add_node("analyze_emotion", node_emotion)
    graph.add_node("crisis_response", node_crisis_response)
    graph.add_node("router_reply_or_knowledge", node_router)
    graph.add_node("knowledge_lookup", node_knowledge_lookup)
    graph.add_node("empathetic_reply", node_empathetic_reply)
    graph.add_node("next_question", node_next_question)
    graph.add_node("summarize", node_summarize)

    graph.set_entry_point("init")
    graph.add_edge("init", "risk_check")
    graph.add_edge("risk_check", "analyze_sentiment")
    graph.add_edge("analyze_sentiment", "analyze_emotion")

    graph.add_conditional_edges("analyze_emotion", route_after_risk, {
        "crisis": "crisis_response",
        "ok": "router_reply_or_knowledge"
    })

    graph.add_edge("crisis_response", "empathetic_reply")

    graph.add_conditional_edges("router_reply_or_knowledge", route_reply_or_knowledge, {
        "knowledge": "knowledge_lookup",
        "normal": "empathetic_reply"
    })

    graph.add_edge("knowledge_lookup", "next_question")

    graph.add_conditional_edges("empathetic_reply", route_continue_or_end, {
        "continue": "next_question",
        "end": "summarize"
    })

    graph.add_edge("next_question", END)
    graph.add_edge("summarize", END)

    return graph

# -----------------------------
# Public Runner
# -----------------------------
_memory = MemorySaver()
GRAPH = build_graph().compile(checkpointer=_memory)

def run_agent_step(
    *,
    user_id: str,
    session_id: str,
    user_text: str,
    language: str = "en",
    facial_emotion: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    # Use session_id as thread_id for LangGraph checkpointer
    thread_id = f"user_{user_id}_session_{session_id}"

    # First, try to get existing state from checkpointer
    try:
        existing_state = GRAPH.get_state({"configurable": {"thread_id": thread_id}})
        if existing_state and existing_state.values:
            # Load existing messages from checkpointer
            existing_messages = existing_state.values.get("messages", [])
        else:
            existing_messages = []
    except Exception:
        existing_messages = []

    state: AgentState = {
        "user_id": user_id,
        "session_id": session_id,
        "language": language,
        "input_text": user_text,
        "messages": existing_messages,  # Load existing conversation
        "risk": "low",
        "sentiment": None,
        "emotion": None,
        "facial_emotion": facial_emotion,  # Add facial emotion to state
        "reply": None,
        "question": None,
        "summary": None,
        "done": False,
        "recommendations": None,
    }

    # Use LangGraph with proper thread_id for conversation persistence
    result = GRAPH.invoke(state, config={"configurable": {"thread_id": thread_id}})

    return {
        "risk": result.get("risk"),
        "sentiment": result.get("sentiment"),
        "emotion": result.get("emotion"),
        "facial_emotion": result.get("facial_emotion"),
        "reply": result.get("reply"),
        "question": result.get("question"),
        "summary": result.get("summary"),
        "done": result.get("done", False),
        "messages": result.get("messages", []),
        "recommendations": result.get("recommendations", []),
    }
