# Facial Emotion Detection Module

## Overview

The Facial Emotion Detection module uses the **DeepFace** library to analyze facial expressions and detect emotions from images. This module is integrated into the MindWell platform to automatically detect user emotions and recommend personalized wellness activities, music, or videos.

## How It Works

### AI Model

The emotion detection is powered by **DeepFace**, an open-source facial recognition and analysis library that uses deep learning models to:

1. **Detect Faces**: Identifies human faces in uploaded images
2. **Analyze Expressions**: Processes facial features to identify emotional states
3. **Classify Emotions**: Categorizes emotions into one of seven categories:
   - **Happy** 😊
   - **Sad** 😢
   - **Angry** 😠
   - **Fear** 😨
   - **Surprise** 😲
   - **Disgust** 🤢
   - **Neutral** 😐

### Technical Architecture

```
User Uploads Image
    ↓
Frontend (FaceMood Component)
    ↓
Backend API (/api/emotion/detect-emotion)
    ↓
Multer (File Upload Handler)
    ↓
Python Script (emotion_detector.py)
    ↓
DeepFace Library
    ↓
Emotion Detection Result
    ↓
Mood Logging (Optional)
    ↓
AI Recommendations
```

## Emotion to Mood Mapping

The detected emotions are mapped to a mood scale (1-10) for integration with the existing mood tracking system:

| Emotion | Mood Score | Description |
|---------|-----------|-------------|
| Happy | 8 | Positive emotional state |
| Surprise | 7 | Pleasant or neutral surprise |
| Neutral | 5 | Balanced emotional state |
| Sad | 4 | Lower mood, may need support |
| Angry | 3 | Negative emotional state |
| Fear | 3 | Anxiety or concern |
| Disgust | 2 | Strong negative reaction |

## How Emotions Map to Activities/Media

### Happy (Mood: 8)
- **Activities**: Maintain positive momentum, gratitude practice, social connection
- **Media**: Upbeat music, motivational videos, celebration content
- **Recommendations**: Continue current activities, share positivity

### Surprise (Mood: 7)
- **Activities**: Exploration, learning new things, trying new experiences
- **Media**: Educational content, discovery videos, inspiring stories
- **Recommendations**: Maintain energy, channel excitement positively

### Neutral (Mood: 5)
- **Activities**: Mindfulness, meditation, gentle exercises
- **Media**: Calming music, nature sounds, balanced content
- **Recommendations**: Self-reflection, routine activities

### Sad (Mood: 4)
- **Activities**: 
  - Guided meditation for emotional support
  - Light exercise to boost endorphins
  - Journaling to process feelings
  - Breathing exercises
- **Media**: 
  - Soothing music
  - Calming videos
  - Uplifting content (gentle)
- **Recommendations**: Self-care activities, emotional support resources

### Angry (Mood: 3)
- **Activities**:
  - Physical exercise to release tension
  - Breathing exercises
  - Stress-relief techniques
  - Mindful walking
- **Media**:
  - Calming music
  - Stress-relief videos
  - Meditation guides
- **Recommendations**: Anger management techniques, physical activity

### Fear (Mood: 3)
- **Activities**:
  - Grounding exercises
  - Deep breathing
  - Progressive muscle relaxation
  - Safety planning
- **Media**:
  - Calming music
  - Guided meditation
  - Anxiety relief content
- **Recommendations**: Anxiety management, support resources

### Disgust (Mood: 2)
- **Activities**:
  - Gentle movement
  - Mindfulness practices
  - Self-compassion exercises
- **Media**:
  - Soothing sounds
  - Positive affirmations
  - Calming visuals
- **Recommendations**: Emotional regulation, self-care

## API Endpoints

### 1. Detect Emotion Only
**POST** `/api/emotion/detect-emotion`

Detects emotion from an uploaded image without logging to the database.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "emotion": "happy",
  "confidence": 0.91
}
```

### 2. Detect and Log Emotion
**POST** `/api/emotion/detect-and-log`

Detects emotion and automatically logs it as a mood entry in the database.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "emotion": "happy",
  "confidence": 0.91,
  "mood": 8,
  "activityId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "message": "Emotion detected and mood logged successfully"
}
```

## Database Schema

### Activity Model (Extended)

The Activity model now includes a `metadata` field to store facial AI detection information:

```javascript
{
  userId: ObjectId,
  type: 'mood',
  mood: 8, // Mapped from emotion
  notes: "Facial emotion detected: happy",
  activities: ["Mood Check-in"],
  tags: ["facial_AI"],
  metadata: {
    source: "facial_AI",
    detected_emotion: "happy",
    confidence: 0.91
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration

### FaceMood Component

The `FaceMood` component provides a user-friendly interface for:

1. **Image Upload**: Users can upload an image file
2. **Camera Capture**: Users can capture a photo using their device camera
3. **Emotion Display**: Shows detected emotion with visual indicators
4. **Mood Logging**: Optionally logs the detected emotion as a mood entry
5. **AI Recommendations**: Triggers recommendation engine based on detected emotion

### Usage Example

```tsx
import FaceMood from './components/FaceMood';

function Dashboard() {
  const handleEmotionDetected = (emotion, confidence, mood) => {
    // Trigger AI recommendations
    suggestForEmotion(emotion);
    // Update dashboard
    refreshDashboard();
  };

  return (
    <FaceMood 
      onEmotionDetected={handleEmotionDetected}
      autoLog={true}
    />
  );
}
```

## Integration with AI Recommendations

When an emotion is detected, the system automatically:

1. **Maps Emotion to Mood**: Converts emotion to 1-10 mood scale
2. **Logs Mood Entry**: Creates an activity log with facial AI metadata
3. **Triggers Recommendations**: Calls the AI recommendation engine
4. **Suggests Activities**: Provides personalized suggestions based on:
   - Detected emotion
   - Confidence level
   - User's mood history
   - Recent activities

## Setup and Installation

### Python Dependencies

```bash
pip install deepface opencv-python
```

### Node.js Dependencies

```bash
npm install multer
```

### File Structure

```
MindWell/
├── server/
│   ├── ai/
│   │   └── emotion_detector.py
│   ├── routes/
│   │   └── emotion.js
│   └── models/
│       └── Activity.js (updated)
├── src/
│   └── components/
│       └── FaceMood.tsx
└── uploads/ (created automatically)
```

## Testing

### 1. Test Emotion Detection

```bash
# Start the server
npm run server

# Test with curl (replace <token> with auth token)
curl -X POST http://localhost:8000/api/emotion/detect-emotion \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

### 2. Test Frontend Component

1. Navigate to the dashboard
2. Click "Facial Mood Detection"
3. Upload an image or capture with camera
4. Verify emotion is detected
5. Check mood is logged (if autoLog is enabled)

### 3. Verify Database Entry

Check that mood entries include facial AI metadata:

```javascript
{
  metadata: {
    source: "facial_AI",
    detected_emotion: "happy",
    confidence: 0.91
  }
}
```

## Error Handling

The system handles various error scenarios:

1. **No Face Detected**: Returns error message
2. **Invalid Image Format**: Validates file type before processing
3. **File Size Limits**: Enforces 10MB maximum file size
4. **Python Script Errors**: Catches and reports DeepFace errors
5. **Authentication Errors**: Requires valid JWT token for mood logging

## Privacy and Security

- **Image Storage**: Uploaded images are temporarily stored and automatically deleted after processing
- **Authentication**: Mood logging requires user authentication
- **Data Privacy**: Emotion data is stored securely with user association
- **No External APIs**: All processing happens locally (DeepFace models downloaded on first use)

## Performance Considerations

- **First Run**: DeepFace downloads models on first use (~500MB)
- **Processing Time**: Typically 2-5 seconds per image
- **File Cleanup**: Images are deleted immediately after processing
- **Caching**: DeepFace models are cached for faster subsequent runs

## Future Enhancements

1. **Real-time Video Analysis**: Continuous emotion detection from video streams
2. **Emotion History**: Track emotion trends over time
3. **Multi-face Detection**: Handle multiple faces in a single image
4. **Advanced Recommendations**: More sophisticated AI-based activity suggestions
5. **Emotion-based Notifications**: Alert users when negative emotions are detected repeatedly

## Troubleshooting

### Issue: "No face detected"
- **Solution**: Ensure image contains a clear face, good lighting, and proper orientation

### Issue: "Python script not found"
- **Solution**: Verify `server/ai/emotion_detector.py` exists and has proper permissions

### Issue: "DeepFace model download fails"
- **Solution**: Check internet connection for first-time model download

### Issue: "File upload fails"
- **Solution**: Verify `uploads/` directory exists and has write permissions

## References

- [DeepFace Documentation](https://github.com/serengil/deepface)
- [OpenCV Documentation](https://opencv.org/)
- [MindWell Platform Documentation](./README.md)

