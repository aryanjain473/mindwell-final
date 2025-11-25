import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  RefreshCw, 
  Bookmark, 
  CheckCircle,
  Clock,
  TrendingUp,
  Heart,
  Zap
} from 'lucide-react';

interface DailyOverviewProps {
  isMoodLoggedToday: boolean;
  streakDays: number;
  longestStreak: number;
  suggestedActivity: string;
  dailyQuote: string;
  wellnessTip: string;
  onLogMood: () => void;
  onRefreshQuote: () => void;
  onSaveQuote: () => void;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({
  isMoodLoggedToday,
  streakDays,
  longestStreak,
  suggestedActivity,
  dailyQuote,
  wellnessTip,
  onLogMood,
  onRefreshQuote,
  onSaveQuote
}) => {
  const [isQuoteSaved, setIsQuoteSaved] = useState(false);

  const handleSaveQuote = () => {
    onSaveQuote();
    setIsQuoteSaved(true);
    setTimeout(() => setIsQuoteSaved(false), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStreakMessage = () => {
    if (streakDays === 0) return "Start your wellness journey today!";
    if (streakDays === 1) return "Great start! Keep it going!";
    if (streakDays < 7) return `${streakDays} days strong!`;
    if (streakDays < 30) return `Amazing ${streakDays}-day streak!`;
    return `Incredible ${streakDays}-day streak!`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Your Day Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getGreeting()}! 🌅</h2>
              <p className="text-gray-600">Here's your daily wellness overview</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Today's Progress</div>
            <div className="flex items-center space-x-2">
              {isMoodLoggedToday ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="font-medium">Completed</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <Clock className="h-5 w-5 mr-1" />
                  <span className="font-medium">Pending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Streak Progress */}
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Streak Progress</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{streakDays}</div>
            <div className="text-sm text-gray-600 mb-2">Current Streak</div>
            <div className="text-xs text-gray-500">Best: {longestStreak} days</div>
            <div className="mt-2 text-sm text-blue-700 font-medium">
              {getStreakMessage()}
            </div>
          </div>

          {/* Suggested Activity */}
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center mb-3">
              <Zap className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Today's Focus</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">{suggestedActivity}</p>
            <button
              onClick={onLogMood}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              {isMoodLoggedToday ? 'Update Mood' : 'Log Your Mood'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Week</span>
                <span className="font-medium text-gray-900">5/7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Streak</span>
                <span className="font-medium text-gray-900">{longestStreak} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Logs</span>
                <span className="font-medium text-gray-900">42</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Quote & Wellness Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl mr-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Daily Inspiration</h3>
              <p className="text-gray-600 text-sm">Your wellness quote and tip for today</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshQuote}
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
              title="Get new quote"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleSaveQuote}
              className={`p-2 rounded-lg transition-colors ${
                isQuoteSaved 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-purple-600 hover:text-purple-700 hover:bg-purple-100'
              }`}
              title="Save quote"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Quote */}
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="h-4 w-4 text-pink-500 mr-2" />
              Quote of the Day
            </h4>
            <blockquote className="text-gray-700 italic leading-relaxed">
              "{dailyQuote}"
            </blockquote>
          </div>

          {/* Wellness Tip */}
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 text-yellow-500 mr-2" />
              Wellness Tip
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {wellnessTip}
            </p>
          </div>
        </div>

        {isQuoteSaved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm text-center"
          >
            Quote saved to your favorites! 💚
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DailyOverview;
