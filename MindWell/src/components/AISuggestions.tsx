import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Heart, 
  Zap, 
  Target, 
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'meditation' | 'exercise' | 'journal' | 'breathing' | 'gratitude' | 'social' | 'sleep';
  title: string;
  description: string;
  reason: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
}

interface AISuggestionsProps {
  currentMood: number;
  averageMood: number;
  streakDays: number;
  recentActivities: string[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  currentMood,
  averageMood,
  streakDays,
  recentActivities,
  onSuggestionClick
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSuggestions();
  }, [currentMood, averageMood, streakDays, recentActivities]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSuggestions: Suggestion[] = [];

    // Mood-based suggestions
    if (currentMood < 4) {
      newSuggestions.push({
        id: 'low-mood-meditation',
        type: 'meditation',
        title: 'Guided Meditation',
        description: 'A 10-minute meditation to help lift your spirits',
        reason: 'Your mood seems low today. Meditation can help reset your emotional state.',
        duration: '10 minutes',
        difficulty: 'easy',
        icon: <Brain className="h-6 w-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    if (currentMood < 6) {
      newSuggestions.push({
        id: 'mood-boost-exercise',
        type: 'exercise',
        title: 'Quick Energy Boost',
        description: '5 minutes of light exercise to increase endorphins',
        reason: 'Physical activity releases feel-good chemicals that can improve your mood.',
        duration: '5 minutes',
        difficulty: 'easy',
        icon: <Zap className="h-6 w-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    // Streak-based suggestions
    if (streakDays === 0) {
      newSuggestions.push({
        id: 'start-streak',
        type: 'journal',
        title: 'Daily Reflection',
        description: 'Start a daily journaling habit to build consistency',
        reason: 'Starting a daily practice can help build momentum and self-awareness.',
        duration: '5 minutes',
        difficulty: 'easy',
        icon: <Target className="h-6 w-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    if (streakDays > 0 && streakDays < 7) {
      newSuggestions.push({
        id: 'maintain-streak',
        type: 'gratitude',
        title: 'Gratitude Practice',
        description: 'Write down 3 things you\'re grateful for today',
        reason: 'You\'re building a great streak! Gratitude practice can enhance your positive mindset.',
        duration: '3 minutes',
        difficulty: 'easy',
        icon: <Heart className="h-6 w-6" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    // Activity-based suggestions
    if (!recentActivities.includes('Meditation') && currentMood < 7) {
      newSuggestions.push({
        id: 'try-meditation',
        type: 'meditation',
        title: 'Mindfulness Break',
        description: 'Try a short mindfulness exercise you haven\'t done recently',
        reason: 'You haven\'t meditated recently, and it could help improve your current mood.',
        duration: '8 minutes',
        difficulty: 'medium',
        icon: <Brain className="h-6 w-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    if (!recentActivities.includes('Exercise') && currentMood < 8) {
      newSuggestions.push({
        id: 'try-exercise',
        type: 'exercise',
        title: 'Movement Break',
        description: 'Get your body moving with some light physical activity',
        reason: 'Physical activity can boost your mood and energy levels naturally.',
        duration: '15 minutes',
        difficulty: 'medium',
        icon: <Zap className="h-6 w-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    // General wellness suggestions
    if (currentMood >= 7) {
      newSuggestions.push({
        id: 'maintain-positive',
        type: 'gratitude',
        title: 'Positive Momentum',
        description: 'Capture this positive moment with a gratitude journal entry',
        reason: 'You\'re feeling great! Documenting positive moments can help maintain this energy.',
        duration: '5 minutes',
        difficulty: 'easy',
        icon: <Heart className="h-6 w-6" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
      });
    }

    // Breathing exercise suggestion
    newSuggestions.push({
      id: 'breathing-exercise',
      type: 'breathing',
      title: '4-7-8 Breathing',
      description: 'Calm your nervous system with this proven breathing technique',
      reason: 'Breathing exercises can help reduce stress and improve focus anytime.',
      duration: '3 minutes',
      difficulty: 'easy',
      icon: <Zap className="h-6 w-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      action: () => onSuggestionClick(newSuggestions[newSuggestions.length - 1])
    });

    setSuggestions(newSuggestions.slice(0, 4)); // Limit to 4 suggestions
    setIsGenerating(false);
  };

  const markAsCompleted = (suggestionId: string) => {
    setCompletedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg mr-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">AI Wellness Suggestions</h3>
            <p className="text-gray-600 text-sm">Personalized recommendations based on your mood and patterns</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {isGenerating ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">AI is analyzing your patterns...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No suggestions available</p>
          <p className="text-gray-400 text-sm">Try logging more activities to get personalized recommendations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  completedSuggestions.has(suggestion.id)
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${suggestion.bgColor}`}>
                    <div className={suggestion.color}>
                      {suggestion.icon}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                      {getDifficultyIcon(suggestion.difficulty)} {suggestion.difficulty}
                    </span>
                    {completedSuggestions.has(suggestion.id) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                <p className="text-gray-700 text-sm mb-3">{suggestion.description}</p>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    <Lightbulb className="h-3 w-3 inline mr-1" />
                    Why this helps:
                  </p>
                  <p className="text-sm text-gray-700">{suggestion.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {suggestion.duration}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {suggestion.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!completedSuggestions.has(suggestion.id) && (
                      <button
                        onClick={() => {
                          onSuggestionClick(suggestion);
                          markAsCompleted(suggestion.id);
                        }}
                        className="flex items-center px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Try Now
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                    {completedSuggestions.has(suggestion.id) && (
                      <span className="text-green-600 text-sm font-medium">
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* AI Insight Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
      >
        <div className="flex items-center mb-2">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-medium text-purple-900">AI Insight</span>
        </div>
        <p className="text-purple-800 text-sm">
          Based on your current mood ({currentMood}/10), {streakDays}-day streak, and recent activities, 
          these suggestions are tailored to help you maintain or improve your mental wellness. 
          The AI learns from your patterns to provide increasingly personalized recommendations.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AISuggestions;
