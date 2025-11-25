/**
 * Utility functions for emotion detection and mapping
 */

export interface EmotionResult {
  emotion: string;
  confidence: number;
  mood?: number;
}

/**
 * Maps emotion string to mood scale (1-10)
 */
export const mapEmotionToMood = (emotion: string): number => {
  const emotionLower = emotion.toLowerCase();
  const emotionToMood: Record<string, number> = {
    happy: 8,
    surprise: 7,
    neutral: 5,
    sad: 4,
    angry: 3,
    fear: 3,
    disgust: 2,
  };

  return emotionToMood[emotionLower] || 5;
};

/**
 * Maps emotion to emoji and display configuration
 */
export const getEmotionDisplay = (emotion: string) => {
  const emotionLower = emotion.toLowerCase();
  const emotionConfig: Record<string, { emoji: string; color: string; bgColor: string; label: string }> = {
    happy: { emoji: '😊', color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Happy' },
    sad: { emoji: '😢', color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Sad' },
    angry: { emoji: '😠', color: 'text-red-600', bgColor: 'bg-red-100', label: 'Angry' },
    fear: { emoji: '😨', color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Fear' },
    surprise: { emoji: '😲', color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Surprise' },
    disgust: { emoji: '🤢', color: 'text-green-600', bgColor: 'bg-green-100', label: 'Disgust' },
    neutral: { emoji: '😐', color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Neutral' },
  };

  return emotionConfig[emotionLower] || emotionConfig.neutral;
};

/**
 * Gets activity recommendations based on detected emotion
 */
export const getEmotionRecommendations = (emotion: string): string[] => {
  const emotionLower = emotion.toLowerCase();
  const recommendations: Record<string, string[]> = {
    happy: [
      'Maintain positive momentum with gratitude practice',
      'Share your positive energy with others',
      'Continue activities that bring you joy',
      'Document this positive moment in your journal',
    ],
    sad: [
      'Try a guided meditation for emotional support',
      'Go for a light walk to boost endorphins',
      'Listen to calming music',
      'Practice deep breathing exercises',
      'Write in your journal to process feelings',
    ],
    angry: [
      'Try physical exercise to release tension',
      'Practice breathing exercises',
      'Use stress-relief techniques',
      'Take a mindful walk',
      'Try progressive muscle relaxation',
    ],
    fear: [
      'Practice grounding exercises',
      'Try deep breathing techniques',
      'Use progressive muscle relaxation',
      'Listen to calming music',
      'Try guided meditation for anxiety',
    ],
    surprise: [
      'Channel excitement into positive activities',
      'Try something new and engaging',
      'Maintain your energy with light exercise',
      'Document this moment in your journal',
    ],
    disgust: [
      'Practice mindfulness exercises',
      'Try gentle movement or yoga',
      'Use self-compassion techniques',
      'Listen to soothing sounds',
    ],
    neutral: [
      'Try a mindfulness meditation',
      'Go for a gentle walk',
      'Practice gratitude',
      'Listen to calming music',
    ],
  };

  return recommendations[emotionLower] || recommendations.neutral;
};

/**
 * Triggers AI recommendations based on detected emotion
 * This can be called after emotion detection to update the dashboard
 */
export const triggerRecommendationsForEmotion = (
  emotion: string,
  mood: number,
  onRecommendationsUpdate?: (recommendations: string[]) => void
) => {
  const recommendations = getEmotionRecommendations(emotion);
  
  if (onRecommendationsUpdate) {
    onRecommendationsUpdate(recommendations);
  }

  // Return recommendations for use in components
  return recommendations;
};

