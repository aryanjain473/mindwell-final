import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const AcademicStressCard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stress/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStressLabel = (score: number | null) => {
    if (!score) return 'No data';
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 rounded-2xl p-6 border border-purple-200 dark:border-purple-700"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate('/stress/academic')}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Academic Stress
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your academic stress levels
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Stress Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Stress</span>
            <span className={`text-sm font-semibold ${getStressColor(stats?.latestScore)}`}>
              {getStressLabel(stats?.latestScore)}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${getStressColor(stats?.latestScore)}`}>
              {stats?.latestScore || '--'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">/100</span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Check-in Streak</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.streak || 0} days
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/stress/academic');
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          <span>Start Stress Check</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default AcademicStressCard;

