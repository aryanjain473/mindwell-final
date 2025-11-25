import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../utils/axiosConfig';

interface MoodData {
  date: string;
  mood: number;
  notes?: string;
}

interface MoodChartProps {
  days?: number;
}

const MoodChart: React.FC<MoodChartProps> = ({ days = 7 }) => {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    fetchMoodHistory();
  }, [days]);

  const fetchMoodHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/dashboard/mood-history?days=${days}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setMoodData(data);
        calculateTrend(data);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (data: MoodData[]) => {
    if (data.length < 2) {
      setTrend('stable');
      return;
    }

    const recent = data.slice(0, Math.ceil(data.length / 2));
    const older = data.slice(Math.ceil(data.length / 2));

    const recentAvg = recent.reduce((sum, item) => sum + item.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.mood, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) setTrend('up');
    else if (recentAvg < olderAvg - 0.5) setTrend('down');
    else setTrend('stable');
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-500'; // Happy
    if (mood >= 5) return 'text-yellow-500'; // Normal
    return 'text-red-500'; // Sad
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊'; // Happy
    if (mood >= 5) return '😐'; // Normal
    return '😔'; // Sad
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (moodData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">No mood data yet</p>
          <p className="text-gray-500 text-sm">Start logging your mood to see trends!</p>
        </div>
      </div>
    );
  }

  const maxMood = Math.max(...moodData.map(d => d.mood));
  const minMood = Math.min(...moodData.map(d => d.mood));
  const range = maxMood - minMood || 1;

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mood Trends</h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {getTrendText()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart */}
        <div className="h-32 flex items-end space-x-2">
          {moodData.slice(0, 7).reverse().map((data, index) => {
            const height = ((data.mood - minMood) / range) * 100;
            return (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                  <motion.div
                    className="bg-gradient-to-t from-teal-500 to-purple-500 rounded-t-lg w-full"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg">{getMoodEmoji(data.mood)}</div>
                <div className={`text-xs font-medium ${getMoodColor(data.mood)}`}>
                  {data.mood}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {moodData.length > 0 ? (moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{maxMood}</div>
            <div className="text-sm text-gray-600">Highest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{minMood}</div>
            <div className="text-sm text-gray-600">Lowest</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodChart;
