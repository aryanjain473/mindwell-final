import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award
} from 'lucide-react';

interface MoodData {
  date: string;
  mood: number;
  day: string;
  activities: string[];
}

interface EnhancedMoodTrackingProps {
  moodData: MoodData[];
  averageMood: number;
  mindfulnessScore: number;
  onTimeRangeChange: (range: '7d' | '30d') => void;
  timeRange: '7d' | '30d';
}

const EnhancedMoodTracking: React.FC<EnhancedMoodTrackingProps> = ({
  moodData,
  averageMood,
  mindfulnessScore,
  onTimeRangeChange,
  timeRange
}) => {
  // Process real mood data for chart
  const processedData = moodData.map(item => {
    const date = new Date(item.createdAt || item.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      ...item,
      day: dayName,
      date: date.toLocaleDateString(),
      moodColor: item.mood >= 7 ? '#10B981' : item.mood >= 4 ? '#F59E0B' : '#EF4444',
      moodEmoji: item.mood >= 8 ? '😄' : item.mood >= 6 ? '😊' : item.mood >= 4 ? '😐' : item.mood >= 2 ? '😔' : '😞'
    };
  }).sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());

  // Calculate real statistics
  const totalLogs = moodData.length;
  const thisWeekLogs = moodData.filter(item => {
    const itemDate = new Date(item.createdAt || item.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return itemDate >= weekAgo;
  }).length;
  
  const bestDay = processedData.reduce((best, current) => 
    current.mood > best.mood ? current : best, 
    { mood: 0, day: 'N/A' }
  );

  const consistency = totalLogs > 0 ? Math.round((thisWeekLogs / 7) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Mood: {data.moodEmoji} {data.mood}/10
          </p>
          {data.activities && data.activities.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Activities: {data.activities.join(', ')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const ProgressRing = ({ score, size = 120 }: { score: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#8B5CF6"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-100 rounded-xl mr-4">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Mood & Progress Tracking</h3>
            <p className="text-gray-600 text-sm">Visualize your emotional journey</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTimeRangeChange('7d')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => onTimeRangeChange('30d')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '30d'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Mood Trends Line Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Mood Trends ({timeRange === '7d' ? '7 Days' : '30 Days'})
            </h4>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {processedData.length > 0 ? (
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={({ cx, cy, payload }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={payload?.moodColor || '#8B5CF6'}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-lg font-medium">No mood data yet</p>
                    <p className="text-sm">Start logging your mood to see your progress!</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats and Progress Ring */}
        <div className="space-y-6">
          {/* Mindfulness Score Progress Ring */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              Mindfulness Score
            </h4>
            <div className="flex justify-center mb-4">
              <ProgressRing score={mindfulnessScore} size={100} />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Current Level</div>
              <div className="text-xs text-purple-600 font-medium">
                {mindfulnessScore >= 80 ? 'Expert' : 
                 mindfulnessScore >= 60 ? 'Advanced' : 
                 mindfulnessScore >= 40 ? 'Intermediate' : 'Beginner'}
              </div>
            </div>
          </div>

          {/* Weekly Highlights */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              This Week's Best
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Day</span>
                <span className="font-semibold text-gray-900">{bestDay.day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mood Score</span>
                <span className="font-semibold text-green-600">{bestDay.mood}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average</span>
                <span className="font-semibold text-gray-900">{averageMood.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Quick Stats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Logs</span>
                <span className="font-medium text-gray-900">{totalLogs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Week</span>
                <span className="font-medium text-gray-900">{thisWeekLogs}/7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consistency</span>
                <span className="font-medium text-green-600">{consistency}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedMoodTracking;
