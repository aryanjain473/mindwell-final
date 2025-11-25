import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  Heart,
  Target,
  Lightbulb
} from 'lucide-react';

interface JournalStatsProps {
  stats: {
    totalEntries: number;
    recentEntries: number;
    averageMood: number;
    moodDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
}

const JournalStats: React.FC<JournalStatsProps> = ({ stats }) => {
  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    return '😔';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-blue-600';
    if (mood >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'High';
    if (mood >= 6) return 'Good';
    if (mood >= 4) return 'Medium';
    return 'Low';
  };

  const totalMoodEntries = stats.moodDistribution.reduce((sum, item) => sum + item.count, 0);
  const highMoodPercentage = stats.moodDistribution.find(item => item._id === 'high')?.count || 0;
  const highMoodPercent = totalMoodEntries > 0 ? Math.round((highMoodPercentage / totalMoodEntries) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Entries</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-xl">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.recentEntries} entries this month
        </p>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-gray-900">{stats.recentEntries}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-xl">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.recentEntries > 0 ? 'Great consistency!' : 'Start journaling today'}
        </p>
      </motion.div>

      {/* Average Mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Mood</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageMood.toFixed(1)}/10
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-xl">
            <span className="text-2xl">{getMoodEmoji(Math.round(stats.averageMood))}</span>
          </div>
        </div>
        <p className={`text-sm font-medium mt-2 ${getMoodColor(Math.round(stats.averageMood))}`}>
          {getMoodLabel(Math.round(stats.averageMood))} overall
        </p>
      </motion.div>

      {/* Positive Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Positive Days</p>
            <p className="text-3xl font-bold text-gray-900">{highMoodPercent}%</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Days with mood 7+ out of 10
        </p>
      </motion.div>

      {/* Mood Distribution Chart */}
      {stats.moodDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2 lg:col-span-4 bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Mood Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.moodDistribution.map((item, index) => {
              const percentage = totalMoodEntries > 0 ? Math.round((item.count / totalMoodEntries) * 100) : 0;
              const getMoodInfo = (moodType: string) => {
                switch (moodType) {
                  case 'high':
                    return { label: 'High (7-10)', color: 'bg-green-500', emoji: '😄' };
                  case 'medium':
                    return { label: 'Medium (4-6)', color: 'bg-yellow-500', emoji: '😐' };
                  case 'low':
                    return { label: 'Low (1-3)', color: 'bg-red-500', emoji: '😔' };
                  default:
                    return { label: 'Unknown', color: 'bg-gray-500', emoji: '❓' };
                }
              };
              
              const moodInfo = getMoodInfo(item._id);
              
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">{moodInfo.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{moodInfo.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full ${moodInfo.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{item.count} entries</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JournalStats;
