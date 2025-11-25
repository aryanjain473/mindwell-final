# feature_recommender.py
"""
Tool to recommend MindWell platform features based on user conversation context.
"""
from typing import List, Dict, Any
import re

# MindWell platform features mapping
MINDWELL_FEATURES = {
    "anxiety": {
        "features": [
            {
                "name": "Breathing Exercises",
                "description": "Practice calming breathing techniques to manage anxiety",
                "route": "/breathing",
                "icon": "🌬️",
                "priority": 5
            },
            {
                "name": "Music & Sound Therapy",
                "description": "Listen to calming sounds like rain, ocean waves to reduce anxiety",
                "route": "/wellness-games/music-listening",
                "icon": "🎵",
                "priority": 4
            },
            {
                "name": "Meditation",
                "description": "Guided meditation sessions to calm your mind",
                "route": "/meditation",
                "icon": "🧘",
                "priority": 4
            },
            {
                "name": "Journal",
                "description": "Write down your thoughts and feelings to process anxiety",
                "route": "/journal",
                "icon": "📝",
                "priority": 3
            }
        ]
    },
    "stress": {
        "features": [
            {
                "name": "Academic Stress Management",
                "description": "Track and manage academic stress with personalized routines",
                "route": "/stress/academic",
                "icon": "📚",
                "priority": 5
            },
            {
                "name": "Breathing Exercises",
                "description": "Quick breathing exercises to reduce stress",
                "route": "/breathing",
                "icon": "🌬️",
                "priority": 4
            },
            {
                "name": "Wellness Games",
                "description": "Interactive games to help manage stress and improve mood",
                "route": "/wellness-games",
                "icon": "🎮",
                "priority": 4
            },
            {
                "name": "Sleep Tracker",
                "description": "Improve sleep quality with guided relaxation exercises",
                "route": "/sleep",
                "icon": "😴",
                "priority": 3
            }
        ]
    },
    "sad": {
        "features": [
            {
                "name": "Gratitude Practice",
                "description": "Focus on positive aspects of life with gratitude exercises",
                "route": "/gratitude",
                "icon": "✨",
                "priority": 5
            },
            {
                "name": "Music & Sound Therapy",
                "description": "Uplifting sounds to improve mood",
                "route": "/wellness-games/music-listening",
                "icon": "🎵",
                "priority": 4
            },
            {
                "name": "Journal",
                "description": "Express your feelings through writing",
                "route": "/journal",
                "icon": "📝",
                "priority": 4
            },
            {
                "name": "Wellness Games",
                "description": "Engaging activities to boost mood",
                "route": "/wellness-games",
                "icon": "🎮",
                "priority": 3
            }
        ]
    },
    "sleep": {
        "features": [
            {
                "name": "Sleep Tracker",
                "description": "Guided exercises for better sleep",
                "route": "/sleep",
                "icon": "😴",
                "priority": 5
            },
            {
                "name": "Music & Sound Therapy",
                "description": "Calming sounds to help you sleep",
                "route": "/wellness-games/music-listening",
                "icon": "🎵",
                "priority": 4
            },
            {
                "name": "Meditation",
                "description": "Evening meditation for relaxation",
                "route": "/meditation",
                "icon": "🧘",
                "priority": 4
            }
        ]
    },
    "lonely": {
        "features": [
            {
                "name": "Find Therapists",
                "description": "Connect with mental health professionals near you",
                "route": "/therapists",
                "icon": "👨‍⚕️",
                "priority": 5
            },
            {
                "name": "Journal",
                "description": "Express your feelings and thoughts",
                "route": "/journal",
                "icon": "📝",
                "priority": 4
            },
            {
                "name": "Gratitude Practice",
                "description": "Focus on connections and positive relationships",
                "route": "/gratitude",
                "icon": "✨",
                "priority": 3
            }
        ]
    },
    "angry": {
        "features": [
            {
                "name": "Breathing Exercises",
                "description": "Calm breathing techniques to manage anger",
                "route": "/breathing",
                "icon": "🌬️",
                "priority": 5
            },
            {
                "name": "Meditation",
                "description": "Mindfulness meditation for emotional regulation",
                "route": "/meditation",
                "icon": "🧘",
                "priority": 4
            },
            {
                "name": "Journal",
                "description": "Write about what's causing your anger",
                "route": "/journal",
                "icon": "📝",
                "priority": 4
            }
        ]
    },
    "default": {
        "features": [
            {
                "name": "Wellness Games",
                "description": "Explore interactive wellness activities",
                "route": "/wellness-games",
                "icon": "🎮",
                "priority": 3
            },
            {
                "name": "Journal",
                "description": "Track your thoughts and feelings",
                "route": "/journal",
                "icon": "📝",
                "priority": 3
            },
            {
                "name": "Find Therapists",
                "description": "Connect with mental health professionals",
                "route": "/therapists",
                "icon": "👨‍⚕️",
                "priority": 3
            }
        ]
    }
}

def recommend_features(user_text: str, emotion_data: Dict[str, Any] = None, conversation_context: str = "") -> List[Dict[str, Any]]:
    """
    Recommend MindWell platform features based on user's conversation and emotional state.
    
    Args:
        user_text: Current user message
        emotion_data: Emotion analysis results
        conversation_context: Previous conversation context
        
    Returns:
        List of feature recommendations
    """
    recommendations = []
    text_lower = (user_text or "").lower()
    context_lower = (conversation_context or "").lower()
    combined_text = f"{text_lower} {context_lower}"
    
    # Detect keywords to determine which features to recommend
    detected_topics = []
    
    # Anxiety-related
    if any(keyword in combined_text for keyword in ["anxious", "anxiety", "worried", "worry", "panic", "nervous", "overwhelmed"]):
        detected_topics.append("anxiety")
    
    # Stress-related
    if any(keyword in combined_text for keyword in ["stress", "stressed", "pressure", "overwhelmed", "exams", "work", "deadline"]):
        detected_topics.append("stress")
    
    # Sadness-related
    if any(keyword in combined_text for keyword in ["sad", "depressed", "down", "hopeless", "unhappy", "miserable"]):
        detected_topics.append("sad")
    
    # Sleep-related
    if any(keyword in combined_text for keyword in ["sleep", "insomnia", "tired", "exhausted", "can't sleep", "restless"]):
        detected_topics.append("sleep")
    
    # Loneliness-related
    if any(keyword in combined_text for keyword in ["lonely", "alone", "isolated", "no one", "nobody", "friend"]):
        detected_topics.append("lonely")
    
    # Anger-related
    if any(keyword in combined_text for keyword in ["angry", "mad", "furious", "irritated", "frustrated", "annoyed"]):
        detected_topics.append("angry")
    
    # Also check emotion data
    if emotion_data:
        emotion = emotion_data.get("emotion", "").lower()
        if emotion in ["anxiety", "fear"]:
            detected_topics.append("anxiety")
        elif emotion in ["sad", "sadness"]:
            detected_topics.append("sad")
        elif emotion in ["anger", "angry"]:
            detected_topics.append("angry")
    
    # Get features for detected topics
    seen_features = set()
    for topic in detected_topics:
        if topic in MINDWELL_FEATURES:
            for feature in MINDWELL_FEATURES[topic]["features"]:
                feature_id = feature["route"]
                if feature_id not in seen_features:
                    recommendations.append({
                        "type": "feature",
                        "title": feature["name"],
                        "description": feature["description"],
                        "route": feature["route"],
                        "icon": feature.get("icon", "✨"),
                        "priority": feature.get("priority", 3)
                    })
                    seen_features.add(feature_id)
    
    # If no specific topics detected, use default recommendations
    if not recommendations:
        for feature in MINDWELL_FEATURES["default"]["features"]:
            recommendations.append({
                "type": "feature",
                "title": feature["name"],
                "description": feature["description"],
                "route": feature["route"],
                "icon": feature.get("icon", "✨"),
                "priority": feature.get("priority", 3)
            })
    
    # Sort by priority and limit to top 2
    recommendations.sort(key=lambda x: x.get("priority", 3), reverse=True)
    return recommendations[:2]

