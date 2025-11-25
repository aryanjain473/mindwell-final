import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import api from '../utils/axiosConfig';

interface ProgressData {
  totalDays: number;
  activeDays: number;
  averageMood: number;
  moodImprovement: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

const ProgressSummary: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const days = timeRange === 'week' ? 7 : 30;
      
      const [statsResponse, moodHistoryResponse] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get(`/api/dashboard/mood-history?days=${days}`)
      ]);

      if (statsResponse.data.success && moodHistoryResponse.data.success) {
        const stats = statsResponse.data.data;
        const moodHistory = moodHistoryResponse.data.data;
        
        // Calculate progress metrics
        const totalDays = days;
        const activeDays = moodHistory.length;
        const averageMood = stats.averageMood || 0;
        
        // Calculate mood improvement (compare first half vs second half)
        let moodImprovement = 0;
        if (moodHistory.length >= 4) {
          const midPoint = Math.floor(moodHistory.length / 2);
          const firstHalf = moodHistory.slice(midPoint);
          const secondHalf = moodHistory.slice(0, midPoint);
          
          const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.mood, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.mood, 0) / secondHalf.length;
          
          moodImprovement = secondHalfAvg - firstHalfAvg;
        }

        const weeklyGoal = 5; // 5 days per week goal
        const weeklyProgress = Math.min((activeDays / totalDays) * 100, 100);

        setProgressData({
          totalDays,
          activeDays,
          averageMood,
          moodImprovement,
          streakDays: stats.streakDays || 0,
          weeklyGoal,
          weeklyProgress
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodImprovementColor = (improvement: number) => {
    if (improvement > 0.5) return 'text-green-600';
    if (improvement < -0.5) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMoodImprovementIcon = (improvement: number) => {
    if (improvement > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (improvement < -0.5) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-600">No progress data yet</p>
          <p className="text-gray-500 text-sm">Start logging your mood to see progress!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress Summary</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeRange === 'week'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeRange === 'month'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Activity Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Activity Progress</span>
            <span className="text-sm text-gray-600">
              {progressData.activeDays}/{progressData.totalDays} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressData.weeklyProgress}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progressData.weeklyProgress >= 100 
              ? "🎉 Goal achieved! Great job!" 
              : `${Math.round(progressData.weeklyProgress)}% of your weekly goal`
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-teal-600 mr-1" />
              <span className="text-2xl font-bold text-gray-900">{progressData.streakDays}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-5 w-5 text-purple-600 mr-1" />
              <span className="text-2xl font-bold text-gray-900">{progressData.averageMood.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-600">Avg Mood</p>
          </div>
        </div>

        {/* Mood Improvement */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Mood Trend</p>
              <p className="text-xs text-gray-500">
                {timeRange === 'week' ? 'This week' : 'This month'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getMoodImprovementIcon(progressData.moodImprovement)}
              <span className={`text-sm font-medium ${getMoodImprovementColor(progressData.moodImprovement)}`}>
                {progressData.moodImprovement > 0 ? '+' : ''}{progressData.moodImprovement.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-purple-50 rounded-lg border border-teal-200">
          <p className="text-sm text-gray-700">
            {progressData.activeDays >= 5 
              ? "🌟 You're doing amazing! Keep up the great work!"
              : progressData.activeDays >= 3
              ? "💪 Great progress! You're building a healthy habit!"
              : "🚀 Every step counts! Keep logging your mood daily!"
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressSummary;
