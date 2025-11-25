# Emotion Detection & Chatbot Integration

## Overview

This document describes the integration between the facial emotion detection system and the chatbot to provide personalized recommendations based on combined emotion analysis.

## Features

### 1. **Combined Emotion Analysis**
- **Text-based Emotion**: Analyzed from user messages using ML model
- **Facial Emotion**: Detected from uploaded images using DeepFace
- **Combined Analysis**: Both sources are combined to provide more accurate emotion assessment

### 2. **Personalized Recommendations**
- Recommendations are generated based on:
  - Detected emotions (text + facial)
  - Mood levels (1-10 scale)
  - Risk assessment
  - Historical emotion patterns
- Recommendations include:
  - Activities (meditation, exercise, journaling, etc.)
  - Resources (crisis support, etc.)
  - Exercises (breathing, grounding, etc.)

### 3. **Emotion History Tracking**
- All emotion data is stored in the database
- Tracks both text and facial emotions
- Stores recommendations for future reference
- Enables pattern analysis over time

## Architecture

### Backend (Python - FastAPI)

#### Modified Files:
- `mindcareai_pr/main.py`
  - Added `FacialEmotionData` model
  - Updated `RespondRequest` to accept optional facial emotion
  - Modified `/session/respond` endpoint to forward facial emotion to agent

- `mindcareai_pr/agent_graph.py`
  - Enhanced `empathetic_reply()` to accept facial emotion
  - Added `generate_recommendations()` function
  - Updated `AgentState` to include `facial_emotion` and `recommendations`
  - Modified emotion analysis to consider both text and facial emotions
  - Updated risk assessment to include facial mood levels

### Backend (Node.js - Express)

#### New Files:
- `MindWell/server/models/EmotionHistory.js`
  - MongoDB model for storing emotion history
  - Includes text emotion, facial emotion, combined emotion
  - Stores recommendations and context
  - Provides methods for pattern analysis

#### Modified Files:
- `MindWell/server/routes/chatbot.js`
  - Updated to accept `facialEmotion` in request body
  - Forwards facial emotion to Python AI service
  - Automatically saves emotion history to database
  - Returns recommendations in response

- `MindWell/server/routes/emotion.js`
  - Added `/save-history` endpoint
  - Added `/history` endpoint to get emotion history
  - Added `/patterns` endpoint to get emotion patterns
  - Added `/recommendations` endpoint to get personalized recommendations

### Frontend (React/TypeScript)

#### Modified Files:
- `MindWell/src/components/Chatbot.tsx`
  - Added `facialEmotion` prop support
  - Updated message interface to include emotion data and recommendations
  - Added UI to display emotion information in messages
  - Added UI to display personalized recommendations
  - Added facial emotion indicator in input area
  - Automatically includes facial emotion when sending messages

## API Endpoints

### Chatbot Endpoints

#### POST `/api/chatbot/session/respond`
**Request Body:**
```json
{
  "sessionId": "string",
  "message": "string",
  "finished": false,
  "facialEmotion": {
    "emotion": "happy",
    "confidence": 0.85,
    "mood": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "assistantReply": "string",
  "risk": "low",
  "emotion": {...},
  "facialEmotion": {...},
  "recommendations": [
    {
      "type": "activity",
      "title": "Guided meditation",
      "description": "Try guided meditation to help improve your mood",
      "priority": 5
    }
  ]
}
```

### Emotion History Endpoints

#### POST `/api/emotion/save-history`
Save emotion history from chatbot interaction.

#### GET `/api/emotion/history`
Get user's emotion history.
- Query params: `sessionId` (optional), `limit` (default: 10)

#### GET `/api/emotion/patterns`
Get user's emotion patterns and trends.
- Query params: `days` (default: 30)

#### GET `/api/emotion/recommendations`
Get personalized recommendations based on emotion history.
- Query params: `limit` (default: 5)

## Usage

### 1. **Using Facial Emotion in Chatbot**

```typescript
// In a component that has access to facial emotion detection
import Chatbot from './components/Chatbot';

// After detecting facial emotion
const facialEmotion = {
  emotion: "happy",
  confidence: 0.85,
  mood: 8
};

// Pass to chatbot
<Chatbot 
  isOpen={isOpen}
  onClose={onClose}
  facialEmotion={facialEmotion}
/>
```

### 2. **Accessing Emotion History**

```typescript
// Get emotion history
const response = await api.get('/emotion/history?limit=10');

// Get emotion patterns
const patterns = await api.get('/emotion/patterns?days=30');

// Get recommendations
const recommendations = await api.get('/emotion/recommendations?limit=5');
```

## Emotion Mapping

### Facial Emotions to Mood
- **Happy**: 8/10
- **Surprise**: 7/10
- **Neutral**: 5/10
- **Sad**: 4/10
- **Angry**: 3/10
- **Fear**: 3/10
- **Disgust**: 2/10

### Text Emotions to Mood
- **Joy/Happy**: 8/10
- **Sadness/Sad**: 3/10
- **Anger/Angry**: 2/10
- **Fear/Anxiety**: 3/10
- **Neutral**: 5/10

## Recommendation Generation

Recommendations are generated based on:
1. **Primary Emotion**: Determined by prioritizing facial emotion (more immediate) over text emotion
2. **Mood Score**: Combined from both sources
3. **Risk Level**: Higher risk triggers additional support resources
4. **Historical Patterns**: Long-term patterns influence recommendations

### Recommendation Types
- **Activity**: Meditation, exercise, journaling, etc.
- **Resource**: Crisis support, helplines, etc.
- **Exercise**: Breathing, grounding, relaxation, etc.
- **Content**: Music, videos, articles, etc.

## Database Schema

### EmotionHistory Model
```javascript
{
  userId: ObjectId,
  sessionId: String,
  textEmotion: {
    emotion: String,
    polarity: String,
    risk: String,
    confidence: Number,
    source: String
  },
  facialEmotion: {
    emotion: String,
    confidence: Number,
    mood: Number
  },
  combinedEmotion: {
    primaryEmotion: String,
    confidence: Number,
    mood: Number,
    riskLevel: String
  },
  recommendations: [{
    type: String,
    title: String,
    description: String,
    priority: Number
  }],
  context: {
    userMessage: String,
    chatbotResponse: String,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Future Enhancements

1. **Real-time Emotion Detection**: Integrate webcam for real-time facial emotion detection during chat
2. **Voice Emotion Analysis**: Add voice tone analysis for even more comprehensive emotion detection
3. **Machine Learning Recommendations**: Use ML models to improve recommendation accuracy based on user feedback
4. **Emotion Trends Dashboard**: Visualize emotion patterns over time
5. **Personalized Intervention Plans**: Generate long-term intervention plans based on emotion history

## Testing

### Test Scenarios
1. Chatbot with text-only emotion
2. Chatbot with facial emotion only
3. Chatbot with both text and facial emotion
4. Emotion history storage and retrieval
5. Recommendation generation
6. Emotion pattern analysis

### Example Test Flow
1. Detect facial emotion using FaceMood component
2. Start chatbot session
3. Send message with facial emotion
4. Verify emotion is included in request
5. Verify recommendations are returned
6. Verify emotion history is saved
7. Retrieve emotion history and verify data

## Notes

- Facial emotion is prioritized over text emotion when both are available (more immediate/accurate)
- Emotion history saving is non-blocking (async) to avoid delaying chat responses
- Recommendations are generated in real-time based on current emotion state
- Historical patterns are used to provide context-aware recommendations
- All emotion data is stored securely and associated with user accounts



