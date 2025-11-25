/**
 * Academic Stress Pattern Detection Service
 * Analyzes stress logs to detect patterns and correlations
 */

import { AcademicStressLog, AcademicStressPattern } from '../models/AcademicStress.js';

/**
 * Detect and update patterns for a user
 */
export const detectPatterns = async (userId) => {
  try {
    // Get last 30 days of logs
    const logs = await AcademicStressLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    
    if (logs.length < 3) {
      // Not enough data for pattern detection
      return null;
    }
    
    const patterns = {
      stressTrend: analyzeStressTrend(logs),
      sleepConcentrationCorrelation: analyzeSleepConcentrationCorrelation(logs),
      deadlineStressCorrelation: analyzeDeadlineStressCorrelation(logs),
      workloadStressCorrelation: analyzeWorkloadStressCorrelation(logs),
      emotionPatterns: analyzeEmotionPatterns(logs),
      weeklyPatterns: analyzeWeeklyPatterns(logs),
      timeOfDayPatterns: analyzeTimeOfDayPatterns(logs),
      recommendations: []
    };
    
    // Generate recommendations based on patterns
    patterns.recommendations = generatePatternRecommendations(patterns, logs);
    
    // Update or create pattern document
    await AcademicStressPattern.findOneAndUpdate(
      { userId },
      {
        patterns,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return patterns;
  } catch (error) {
    console.error('Error detecting patterns:', error);
    return null;
  }
};

/**
 * Analyze stress trend over time
 */
const analyzeStressTrend = (logs) => {
  if (logs.length < 2) return null;
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
  
  const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2));
  const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, log) => sum + log.stressScore, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, log) => sum + log.stressScore, 0) / secondHalf.length;
  
  const change = secondAvg - firstAvg;
  const percentChange = (change / firstAvg) * 100;
  
  return {
    direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
    change: Math.round(change),
    percentChange: Math.round(percentChange),
    firstHalfAvg: Math.round(firstAvg),
    secondHalfAvg: Math.round(secondAvg)
  };
};

/**
 * Analyze correlation between sleep and concentration
 */
const analyzeSleepConcentrationCorrelation = (logs) => {
  let lowSleepLowConcentration = 0;
  let lowSleepHighConcentration = 0;
  let highSleepLowConcentration = 0;
  let highSleepHighConcentration = 0;
  
  logs.forEach(log => {
    const lowSleep = log.sleep <= 5;
    const lowConcentration = log.concentration <= 5;
    
    if (lowSleep && lowConcentration) lowSleepLowConcentration++;
    else if (lowSleep && !lowConcentration) lowSleepHighConcentration++;
    else if (!lowSleep && lowConcentration) highSleepLowConcentration++;
    else highSleepHighConcentration++;
  });
  
  const total = logs.length;
  const correlationStrength = (lowSleepLowConcentration / total) * 100;
  
  return {
    correlationStrength: Math.round(correlationStrength),
    lowSleepLowConcentration,
    lowSleepHighConcentration,
    highSleepLowConcentration,
    highSleepHighConcentration,
    total,
    significant: correlationStrength > 50
  };
};

/**
 * Analyze correlation between deadlines and stress
 */
const analyzeDeadlineStressCorrelation = (logs) => {
  let highDeadlineHighStress = 0;
  let highDeadlineLowStress = 0;
  let lowDeadlineHighStress = 0;
  let lowDeadlineLowStress = 0;
  
  logs.forEach(log => {
    const highDeadline = log.deadlines >= 7;
    const highStress = log.stressScore >= 70;
    
    if (highDeadline && highStress) highDeadlineHighStress++;
    else if (highDeadline && !highStress) highDeadlineLowStress++;
    else if (!highDeadline && highStress) lowDeadlineHighStress++;
    else lowDeadlineLowStress++;
  });
  
  const total = logs.length;
  const correlationStrength = (highDeadlineHighStress / total) * 100;
  
  return {
    correlationStrength: Math.round(correlationStrength),
    highDeadlineHighStress,
    highDeadlineLowStress,
    lowDeadlineHighStress,
    lowDeadlineLowStress,
    total,
    significant: correlationStrength > 30
  };
};

/**
 * Analyze correlation between workload and stress
 */
const analyzeWorkloadStressCorrelation = (logs) => {
  let highWorkloadHighStress = 0;
  let highWorkloadLowStress = 0;
  let lowWorkloadHighStress = 0;
  let lowWorkloadLowStress = 0;
  
  logs.forEach(log => {
    const highWorkload = log.workload >= 7;
    const highStress = log.stressScore >= 70;
    
    if (highWorkload && highStress) highWorkloadHighStress++;
    else if (highWorkload && !highStress) highWorkloadLowStress++;
    else if (!highWorkload && highStress) lowWorkloadHighStress++;
    else lowWorkloadLowStress++;
  });
  
  const total = logs.length;
  const correlationStrength = (highWorkloadHighStress / total) * 100;
  
  return {
    correlationStrength: Math.round(correlationStrength),
    highWorkloadHighStress,
    highWorkloadLowStress,
    lowWorkloadHighStress,
    lowWorkloadLowStress,
    total,
    significant: correlationStrength > 30
  };
};

/**
 * Analyze emotion patterns
 */
const analyzeEmotionPatterns = (logs) => {
  const emotionCounts = {
    Anxious: 0,
    Overwhelmed: 0,
    Confused: 0,
    Bored: 0,
    Frustrated: 0
  };
  
  logs.forEach(log => {
    log.emotionTags?.forEach(emotion => {
      if (emotionCounts.hasOwnProperty(emotion)) {
        emotionCounts[emotion]++;
      }
    });
  });
  
  const total = logs.length;
  const percentages = {};
  Object.keys(emotionCounts).forEach(emotion => {
    percentages[emotion] = Math.round((emotionCounts[emotion] / total) * 100);
  });
  
  const mostCommon = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    counts: emotionCounts,
    percentages,
    mostCommon: mostCommon ? { emotion: mostCommon[0], count: mostCommon[1] } : null,
    total
  };
};

/**
 * Analyze weekly patterns (day of week)
 */
const analyzeWeeklyPatterns = (logs) => {
  const dayPatterns = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };
  
  logs.forEach(log => {
    const day = new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    if (dayPatterns[day]) {
      dayPatterns[day].push(log.stressScore);
    }
  });
  
  const averages = {};
  Object.keys(dayPatterns).forEach(day => {
    if (dayPatterns[day].length > 0) {
      averages[day] = Math.round(
        dayPatterns[day].reduce((sum, score) => sum + score, 0) / dayPatterns[day].length
      );
    }
  });
  
  const highestStressDay = Object.entries(averages)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    averages,
    highestStressDay: highestStressDay ? { day: highestStressDay[0], avgStress: highestStressDay[1] } : null
  };
};

/**
 * Analyze time of day patterns
 */
const analyzeTimeOfDayPatterns = (logs) => {
  const timeSlots = {
    morning: [], // 6-12
    afternoon: [], // 12-18
    evening: [], // 18-22
    night: [] // 22-6
  };
  
  logs.forEach(log => {
    const hour = new Date(log.createdAt).getHours();
    if (hour >= 6 && hour < 12) timeSlots.morning.push(log.stressScore);
    else if (hour >= 12 && hour < 18) timeSlots.afternoon.push(log.stressScore);
    else if (hour >= 18 && hour < 22) timeSlots.evening.push(log.stressScore);
    else timeSlots.night.push(log.stressScore);
  });
  
  const averages = {};
  Object.keys(timeSlots).forEach(slot => {
    if (timeSlots[slot].length > 0) {
      averages[slot] = Math.round(
        timeSlots[slot].reduce((sum, score) => sum + score, 0) / timeSlots[slot].length
      );
    }
  });
  
  return { averages };
};

/**
 * Generate recommendations based on detected patterns
 */
const generatePatternRecommendations = (patterns, logs) => {
  const recommendations = [];
  
  // Stress trend recommendations
  if (patterns.stressTrend?.direction === 'increasing') {
    recommendations.push({
      type: 'trend',
      priority: 'high',
      title: 'Stress is Increasing',
      message: 'Your stress levels have been rising. Consider implementing daily stress management practices.',
      action: 'Schedule regular breathing exercises and breaks'
    });
  }
  
  // Sleep-concentration correlation
  if (patterns.sleepConcentrationCorrelation?.significant) {
    recommendations.push({
      type: 'correlation',
      priority: 'high',
      title: 'Sleep Affects Your Focus',
      message: 'We noticed that when your sleep is poor, your concentration drops significantly.',
      action: 'Prioritize 7-9 hours of sleep for better academic performance'
    });
  }
  
  // Deadline-stress correlation
  if (patterns.deadlineStressCorrelation?.significant) {
    recommendations.push({
      type: 'correlation',
      priority: 'medium',
      title: 'Deadlines Trigger Stress',
      message: 'High deadline pressure often leads to elevated stress for you.',
      action: 'Try breaking down assignments into smaller tasks earlier to reduce deadline pressure'
    });
  }
  
  // Emotion patterns
  if (patterns.emotionPatterns?.mostCommon) {
    const { emotion, count } = patterns.emotionPatterns.mostCommon;
    if (count > logs.length * 0.4) {
      recommendations.push({
        type: 'emotion',
        priority: 'medium',
        title: `Frequently Feeling ${emotion}`,
        message: `You often report feeling ${emotion.toLowerCase()}. This might indicate a need for specific coping strategies.`,
        action: `Try targeted exercises for managing ${emotion.toLowerCase()}`
      });
    }
  }
  
  // Weekly patterns
  if (patterns.weeklyPatterns?.highestStressDay) {
    const { day, avgStress } = patterns.weeklyPatterns.highestStressDay;
    if (avgStress >= 70) {
      recommendations.push({
        type: 'weekly',
        priority: 'low',
        title: `${day}s Are Stressful`,
        message: `You tend to experience higher stress on ${day}s.`,
        action: `Plan lighter workloads or extra self-care on ${day}s`
      });
    }
  }
  
  return recommendations;
};

