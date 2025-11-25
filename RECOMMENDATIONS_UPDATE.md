# Recommendations System Update

## Changes Made

### 1. **Recommendations Only Show After Facial Emotion Detection**
- Recommendations are now **only generated and displayed when facial emotion is detected**
- Removed recommendations from appearing in every chat message
- Recommendations appear only after user uploads a photo and emotion is detected

### 2. **Enhanced Recommendation Types**
- **Activities**: Self-care activities (meditation, exercise, journaling, etc.)
- **YouTube Videos**: Mood lighting videos and guided practices
  - Mood lighting videos for different emotions (sad, happy, fear, neutral)
  - Meditation and breathing exercise videos
  - Yoga and relaxation videos
- **Blog Links**: Educational articles and resources
  - Healthline articles on mental health
  - Verywell Mind resources
  - Practical tips and strategies

### 3. **Improved UI/UX**
- Recommendations displayed in a dedicated, visually appealing panel
- Color-coded icons for different recommendation types:
  - ▶️ Red icon for YouTube videos
  - 📖 Blue icon for blog links
  - ✨ Green icon for activities/exercises
  - 🆘 Orange icon for crisis resources
- Clickable "Watch" and "Read" buttons for videos and blogs
- Gradient background (purple to blue) for better visual separation
- Hover effects for better interactivity

### 4. **Mood-Specific Resources**

#### Sad Emotions
- Mood lighting: Calming soft warm lights
- Videos: Meditation, mood-boosting music, yoga
- Blogs: Coping with depression, managing sadness

#### Happy Emotions
- Mood lighting: Warm cozy atmosphere
- Videos: Gratitude practice, upbeat music
- Blogs: Maintaining positive mental health

#### Fear/Anxiety
- Mood lighting: Soothing lighting for anxiety
- Videos: Grounding techniques, breathing exercises, relaxation
- Blogs: Coping with anxiety, understanding anxiety disorders

#### Anger
- Videos: Anger management meditation, breathing exercises, yoga
- Blogs: Anger management tips, understanding and controlling anger

#### Neutral
- Mood lighting: Peaceful ambient atmosphere
- Videos: Mindfulness meditation, calming music
- Blogs: Mindfulness and mental health

## How It Works

1. **User uploads photo** → Facial emotion is detected
2. **User sends message with facial emotion** → Chatbot receives emotion data
3. **Backend generates recommendations** → Only if facial emotion is present
4. **Recommendations displayed** → In a dedicated panel within the chat message
5. **User can click links** → Opens YouTube videos or blog articles in new tab

## Technical Implementation

### Backend (Python)
- `generate_recommendations()` function only generates recommendations if `facial_emotion` is present
- Returns empty list if no facial emotion detected
- Includes YouTube video URLs and blog links in recommendation objects

### Backend (Node.js)
- EmotionHistory model updated to support `video` and `blog` types
- Recommendations endpoint generates resources if no existing recommendations

### Frontend (React)
- Recommendations only displayed if `message.recommendations` exists and has items
- Visual indicators for different recommendation types
- Clickable links that open in new tabs
- Better styling with gradients and hover effects

## Example Recommendation Structure

```json
{
  "type": "video",
  "title": "Calming Mood Lighting - Soft Warm Lights",
  "description": "Relaxing mood lighting video to create a peaceful atmosphere",
  "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  "priority": 4
}
```

## Benefits

1. **Better User Experience**: Recommendations only appear when relevant (after emotion detection)
2. **More Actionable**: Users get specific videos and articles they can immediately access
3. **Mood-Specific**: Resources are tailored to the detected emotion
4. **Visual Appeal**: Better UI makes recommendations more engaging
5. **Comprehensive**: Includes activities, videos, and educational content

## Future Enhancements

1. **Real YouTube Video IDs**: Replace placeholder URLs with actual mood lighting videos
2. **User Feedback**: Allow users to rate recommendations
3. **Personalization**: Learn from user preferences over time
4. **More Resources**: Expand library of videos and blog articles
5. **Embedded Videos**: Show video previews directly in chat (if YouTube API allows)



