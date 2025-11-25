import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Brain,
  Zap,
  Award,
  Activity
} from 'lucide-react';

interface StatsData {
  totalSessions: number;
  averageMood: number;
  streakDays: number;
  mindfulnessScore: number;
  lastActivity: string;
}

interface DynamicStatsProps {
  stats: StatsData | null;
  isLoading: boolean;
}

const DynamicStats: React.FC<DynamicStatsProps> = ({ stats, isLoading }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalSessions: 0,
    averageMood: 0,
    streakDays: 0,
    mindfulnessScore: 0
  });

  const controls = useAnimation();

  // Animate numbers when stats change
  useEffect(() => {
    if (stats) {
      const duration = 1.5;
      const steps = 60;
      const stepDuration = (duration * 1000) / steps;

      const animateValue = (start: number, end: number, callback: (value: number) => void) => {
        const increment = (end - start) / steps;
        let current = start;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current = start + (increment * step);
          
          if (step >= steps) {
            current = end;
            clearInterval(timer);
          }
          
          callback(Math.round(current * 10) / 10);
        }, stepDuration);
      };

      animateValue(animatedStats.totalSessions, stats.totalSessions, (value) => {
        setAnimatedStats(prev => ({ ...prev, totalSessions: value }));
      });

      animateValue(animatedStats.averageMood, stats.averageMood, (value) => {
        setAnimatedStats(prev => ({ ...prev, averageMood: value }));
      });

      animateValue(animatedStats.streakDays, stats.streakDays, (value) => {
        setAnimatedStats(prev => ({ ...prev, streakDays: value }));
      });

      animateValue(animatedStats.mindfulnessScore, stats.mindfulnessScore, (value) => {
        setAnimatedStats(prev => ({ ...prev, mindfulnessScore: value }));
      });

      // Trigger streak celebration animation
      if (stats.streakDays > 0) {
        controls.start({
          scale: [1, 1.1, 1],
          transition: { duration: 0.6, repeat: 2 }
        });
      }
    }
  }, [stats, controls]);

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-500';
    if (mood >= 6) return 'text-yellow-500';
    if (mood >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return '😄';
    if (mood >= 7) return '😊';
    if (mood >= 5) return '😐';
    if (mood >= 3) return '😔';
    return '😞';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start!";
    if (streak < 3) return "Keep it up!";
    if (streak < 7) return "You're on fire! 🔥";
    if (streak < 14) return "Incredible streak!";
    return "Legendary! You're unstoppable! 🏆";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Total Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-600">Total Sessions</p>
            <motion.p 
              className="text-3xl font-bold text-blue-900"
              key={animatedStats.totalSessions}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {animatedStats.totalSessions}
            </motion.p>
          </div>
        </div>
        <p className="text-sm text-blue-700">
          {animatedStats.totalSessions === 0 
            ? "Start your wellness journey" 
            : "Sessions completed"
          }
        </p>
      </motion.div>

      {/* Average Mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-500 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">Average Mood</p>
            <motion.div 
              className="flex items-center justify-end"
              key={animatedStats.averageMood}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl font-bold text-green-900">
                {animatedStats.averageMood.toFixed(1)}
              </span>
              <span className="text-lg text-green-700 ml-1">/10</span>
              <span className="text-2xl ml-2">
                {getMoodEmoji(animatedStats.averageMood)}
              </span>
            </motion.div>
          </div>
        </div>
        <p className="text-sm text-green-700">
          {animatedStats.averageMood === 0 
            ? "Log your first mood" 
            : `Your overall mood rating`
          }
        </p>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-lg border border-orange-200"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="p-3 bg-orange-500 rounded-lg"
            animate={controls}
          >
            <Zap className="h-6 w-6 text-white" />
          </motion.div>
          <div className="text-right">
            <p className="text-sm font-medium text-orange-600">Current Streak</p>
            <motion.div 
              className="flex items-center justify-end"
              key={animatedStats.streakDays}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl font-bold text-orange-900">
                {animatedStats.streakDays}
              </span>
              <span className="text-lg text-orange-700 ml-1">days</span>
            </motion.div>
          </div>
        </div>
        <p className="text-sm text-orange-700">
          {getStreakMessage(animatedStats.streakDays)}
        </p>
      </motion.div>

      {/* Mindfulness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-purple-600">Mindfulness</p>
            <motion.div 
              className="flex items-center justify-end"
              key={animatedStats.mindfulnessScore}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl font-bold text-purple-900">
                {animatedStats.mindfulnessScore}%
              </span>
            </motion.div>
          </div>
        </div>
        {/* Progress Ring */}
        <div className="relative w-16 h-16 mx-auto">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-purple-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="text-purple-500"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ 
                strokeDasharray: `${animatedStats.mindfulnessScore} 100` 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
        </div>
        <p className="text-sm text-purple-700 text-center mt-2">
          {animatedStats.mindfulnessScore === 0 
            ? "Start practicing mindfulness" 
            : "Your mindfulness level"
          }
        </p>
      </motion.div>
    </div>
  );
};

export default DynamicStats;
