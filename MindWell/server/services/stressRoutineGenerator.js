/**
 * Academic Stress Routine Generator
 * Generates personalized micro-routines based on stress levels, emotions, and patterns
 */

export const generateRoutine = (stressData, patterns = null) => {
  const { workload, deadlines, concentration, sleep, emotionTags, stressScore } = stressData;
  
  const routine = {
    type: 'academic_stress',
    duration: 0,
    steps: [],
    rationale: '',
    priority: 'high'
  };
  
  // Determine routine type based on stress score
  if (stressScore >= 70) {
    // High stress - focus on calming
    routine.type = 'calming';
    routine.priority = 'high';
    routine.rationale = 'Your stress levels are high. Let\'s focus on calming your mind and body first.';
    
    // Add breathing exercise
    routine.steps.push({
      id: 'breathing',
      title: '5-Minute Calming Breath',
      description: 'Slow, deep breathing to activate your body\'s relaxation response',
      game: 'heart-calm',
      duration: 5,
      order: 1,
      icon: '💨'
    });
    
    // If overwhelmed or anxious, add grounding
    if (emotionTags.includes('Overwhelmed') || emotionTags.includes('Anxious')) {
      routine.steps.push({
        id: 'grounding',
        title: 'Quick Grounding Exercise',
        description: 'Take 2 minutes to notice 5 things you can see, 4 you can touch, 3 you can hear',
        game: null,
        duration: 2,
        order: 2,
        icon: '🌍'
      });
    }
    
    // Add gratitude if frustrated
    if (emotionTags.includes('Frustrated')) {
      routine.steps.push({
        id: 'gratitude',
        title: 'Gratitude Reflection',
        description: 'Reflect on 3 things that went well today, no matter how small',
        game: 'gratitude-wheel',
        duration: 3,
        order: 3,
        icon: '✨'
      });
    }
    
  } else if (stressScore >= 40) {
    // Moderate stress - balanced approach
    routine.type = 'balanced';
    routine.priority = 'medium';
    routine.rationale = 'You\'re experiencing moderate stress. Let\'s balance calming with focus.';
    
    // Start with brief breathing
    routine.steps.push({
      id: 'breathing',
      title: '3-Minute Breathing Reset',
      description: 'Quick breathing exercise to center yourself',
      game: 'heart-calm',
      duration: 3,
      order: 1,
      icon: '💨'
    });
    
    // Add focus exercise if concentration is low
    if (concentration <= 5) {
      routine.steps.push({
        id: 'focus',
        title: '10-Minute Focus Sprint',
        description: 'Train your attention with a focused meditation session',
        game: 'candle-focus',
        duration: 10,
        order: 2,
        icon: '🕯️'
      });
    }
    
    // Add task triage if deadlines are high
    if (deadlines >= 7) {
      routine.steps.push({
        id: 'triage',
        title: 'Task Triage',
        description: 'Break down your tasks: What\'s urgent? What can wait? What can be delegated?',
        game: null,
        duration: 5,
        order: 3,
        icon: '📋'
      });
    }
    
  } else {
    // Low stress - productivity boosters
    routine.type = 'productivity';
    routine.priority = 'low';
    routine.rationale = 'Your stress is manageable. Let\'s boost your productivity and focus.';
    
    // Quick focus exercise
    routine.steps.push({
      id: 'focus',
      title: '5-Minute Focus Boost',
      description: 'Sharpen your concentration for better study sessions',
      game: 'candle-focus',
      duration: 5,
      order: 1,
      icon: '🕯️'
    });
    
    // Add study planning if workload is high
    if (workload >= 7) {
      routine.steps.push({
        id: 'planning',
        title: 'Study Plan Breakdown',
        description: 'Break your workload into manageable 25-minute Pomodoro blocks',
        game: null,
        duration: 5,
        order: 2,
        icon: '📚'
      });
    }
    
    // Add gratitude for positive reinforcement
    routine.steps.push({
      id: 'gratitude',
      title: 'Daily Gratitude',
      description: 'Acknowledge what you\'re grateful for to maintain positive momentum',
      game: 'gratitude-wheel',
      duration: 2,
      order: 3,
      icon: '✨'
    });
  }
  
  // Add sleep recommendations if sleep is low
  if (sleep <= 5) {
    routine.steps.push({
      id: 'sleep',
      title: 'Sleep Preparation',
      description: 'Try the Dream Waves exercise before bed tonight to improve sleep quality',
      game: 'dream-waves',
      duration: 8,
      order: routine.steps.length + 1,
      icon: '🌙',
      scheduled: 'evening'
    });
    
    routine.rationale += ' Your sleep score is low - consider prioritizing rest tonight.';
  }
  
  // Add pattern-based recommendations
  if (patterns) {
    if (patterns.sleepConcentrationCorrelation > patterns.totalDays * 0.5) {
      routine.steps.push({
        id: 'pattern-sleep',
        title: 'Sleep & Focus Connection',
        description: 'We noticed your concentration improves with better sleep. Try establishing a consistent sleep schedule.',
        game: null,
        duration: 0,
        order: routine.steps.length + 1,
        icon: '💡',
        type: 'insight'
      });
    }
    
    if (patterns.deadlineStressCorrelation > patterns.totalDays * 0.3) {
      routine.steps.push({
        id: 'pattern-deadlines',
        title: 'Deadline Management',
        description: 'You tend to experience high stress before deadlines. Try breaking tasks into smaller chunks earlier.',
        game: null,
        duration: 0,
        order: routine.steps.length + 1,
        icon: '💡',
        type: 'insight'
      });
    }
  }
  
  // Calculate total duration
  routine.duration = routine.steps.reduce((sum, step) => sum + (step.duration || 0), 0);
  
  return routine;
};

/**
 * Generate insights based on current stress check
 */
export const generateInsights = (stressData, patterns = null) => {
  const { workload, deadlines, concentration, sleep, emotionTags, stressScore } = stressData;
  
  const insights = [];
  
  // Stress level insight
  if (stressScore >= 70) {
    insights.push({
      type: 'warning',
      title: 'High Stress Detected',
      message: 'Your stress levels are elevated. It\'s important to take time for self-care and relaxation.',
      icon: '⚠️'
    });
  } else if (stressScore >= 40) {
    insights.push({
      type: 'info',
      title: 'Moderate Stress',
      message: 'You\'re managing, but some stress-reduction techniques could help you feel more balanced.',
      icon: 'ℹ️'
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Low Stress',
      message: 'Great job managing your stress! Keep up the good habits.',
      icon: '✅'
    });
  }
  
  // Sleep insight
  if (sleep <= 5) {
    insights.push({
      type: 'warning',
      title: 'Sleep Quality Concern',
      message: 'Your sleep score is low. Poor sleep can significantly impact your academic performance and stress levels.',
      icon: '😴'
    });
  }
  
  // Concentration insight
  if (concentration <= 5) {
    insights.push({
      type: 'info',
      title: 'Focus Challenge',
      message: 'Your concentration is low. This might be related to stress, sleep, or needing a break.',
      icon: '🎯'
    });
  }
  
  // Emotion-specific insights
  if (emotionTags.includes('Overwhelmed')) {
    insights.push({
      type: 'info',
      title: 'Feeling Overwhelmed',
      message: 'When feeling overwhelmed, break tasks into smaller steps and focus on one thing at a time.',
      icon: '🌊'
    });
  }
  
  if (emotionTags.includes('Confused')) {
    insights.push({
      type: 'info',
      title: 'Feeling Confused',
      message: 'Confusion often comes from information overload. Try clarifying your priorities and asking for help when needed.',
      icon: '❓'
    });
  }
  
  // Pattern-based insights
  if (patterns) {
    if (patterns.trend === 'increasing') {
      insights.push({
        type: 'warning',
        title: 'Stress Trend',
        message: 'Your stress has been increasing recently. Consider implementing more regular stress management practices.',
        icon: '📈'
      });
    }
    
    if (patterns.sleepConcentrationCorrelation > patterns.totalDays * 0.5) {
      insights.push({
        type: 'info',
        title: 'Sleep & Focus Pattern',
        message: 'We\'ve noticed a strong connection between your sleep quality and concentration. Prioritizing sleep may improve your focus.',
        icon: '🔗'
      });
    }
  }
  
  return insights;
};

