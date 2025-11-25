import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Heart,
  Brain,
  BookOpen,
  MessageCircle,
  MapPin,
  Settings,
  LogOut,
  Flame,
  Lightbulb,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '../utils/axiosConfig';

interface DashboardStats {
  streakDays: number;
  todayMood: number | null;
  todayMoodLogged: boolean;
  lastActivity: string;
}

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggingMood, setLoggingMood] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
    generateSuggestion();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Check if mood was logged today
      const today = new Date().toISOString().split('T')[0];
      const [statsResponse, todayMoodResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/activities?limit=1`)
      ]);

      let todayMood = null;
      let todayMoodLogged = false;

      if (todayMoodResponse.data.success && todayMoodResponse.data.data.length > 0) {
        const latestActivity = todayMoodResponse.data.data[0];
        const activityDate = new Date(latestActivity.createdAt).toISOString().split('T')[0];
        if (activityDate === today) {
          todayMood = latestActivity.mood;
          todayMoodLogged = true;
        }
      }

      if (statsResponse.data.success) {
        setStats({
          streakDays: statsResponse.data.data.streakDays || 0,
          todayMood,
          todayMoodLogged,
          lastActivity: statsResponse.data.data.lastActivity || new Date().toISOString()
        });
      } else {
        setStats({
          streakDays: 0,
          todayMood: null,
          todayMoodLogged: false,
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        streakDays: 0,
        todayMood: null,
        todayMoodLogged: false,
        lastActivity: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestion = () => {
    const hour = new Date().getHours();
    const suggestions = [
      { time: [6, 7, 8, 9], text: "Start your day with a quick mood check-in! 🌅" },
      { time: [10, 11, 12, 13, 14], text: "Take a moment to reflect on how you're feeling today 💭" },
      { time: [15, 16, 17], text: "Mid-day check: How's your energy? Consider a quick meditation 🧘" },
      { time: [18, 19, 20], text: "Evening is perfect for journaling about your day ✍️" },
      { time: [21, 22, 23], text: "Wind down with a gratitude practice or mood reflection 🌙" }
    ];

    const currentSuggestion = suggestions.find(s => s.time.includes(hour)) || suggestions[0];
    setSuggestion(currentSuggestion.text);
  };

  const handleQuickMoodLog = async (mood: number) => {
    try {
      setLoggingMood(true);
      const response = await api.post('/dashboard/mood', {
        mood,
        notes: '',
        activities: ['Quick Mood Check-in']
      });

      if (response.data.success) {
        await fetchDashboardData();
        showNotification('Mood logged! 👍', 'success');
      }
    } catch (error) {
      console.error('Error logging mood:', error);
      showNotification('Failed to log mood. Please try again.', 'error');
    } finally {
      setLoggingMood(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in`;
    notification.innerHTML = `
      ${type === 'success' ? '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' : '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>'}
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 5) return '😐';
    return '😔';
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Great';
    if (mood >= 5) return 'Okay';
    return 'Not great';
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hey {user?.firstName || 'there'}! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Today's Focus - Suggestion */}
        {suggestion && (
          <motion.div 
            className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-4 flex items-start space-x-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lightbulb className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
          </motion.div>
        )}

        {/* Quick Mood Check-in */}
        <motion.div 
          className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {stats?.todayMoodLogged 
                ? `You're feeling ${getMoodLabel(stats.todayMood!)} today`
                : "How are you feeling today?"
              }
            </h2>
            {stats?.todayMoodLogged && stats.todayMood && (
              <div className="text-5xl mb-2">{getMoodEmoji(stats.todayMood)}</div>
            )}
            </div>
            
          {!stats?.todayMoodLogged ? (
            <div className="flex justify-center space-x-4">
              {[
                { mood: 3, emoji: '😔', label: 'Not great', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
                { mood: 4, emoji: '😕', label: 'Low', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
                { mood: 5, emoji: '😐', label: 'Okay', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
                { mood: 7, emoji: '🙂', label: 'Good', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                { mood: 9, emoji: '😊', label: 'Great', color: 'bg-green-50 hover:bg-green-100 border-green-200' }
              ].map((item) => (
                <motion.button
                  key={item.mood}
                  onClick={() => handleQuickMoodLog(item.mood)}
                  disabled={loggingMood}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${item.color} disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl mb-1">{item.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => {
                  setStats(prev => prev ? { ...prev, todayMoodLogged: false, todayMood: null } : null);
                }}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change mood
              </button>
          </div>
          )}
        </motion.div>

        {/* Simple Streak Display */}
        {stats && stats.streakDays > 0 && (
          <motion.div 
            className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <Flame className="h-6 w-6 text-orange-500" />
              <div className="text-center">
                <p className="text-sm text-gray-600">Your streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streakDays} day{stats.streakDays !== 1 ? 's' : ''}</p>
              </div>
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </motion.div>
        )}

        {/* Quick Actions - Essential Only */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/journal')}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all text-center"
            >
              <BookOpen className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Journal</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/chat')}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-center"
            >
              <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">AI Chat</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/therapists')}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center"
            >
              <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Therapists</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/meditation')}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-center"
            >
              <Brain className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Meditate</p>
              </motion.button>
            </div>
        </motion.div>

        {/* Wellness Games Link */}
                <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/wellness-games')}
            className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-center space-x-3">
              <Sparkles className="h-6 w-6" />
              <span className="font-semibold">Explore Wellness Games</span>
              <Sparkles className="h-6 w-6" />
                      </div>
            <p className="text-sm mt-2 opacity-90">8 interactive games for mental wellness</p>
                    </motion.button>
        </motion.div>

        {/* Simple Insight - Only if streak is good */}
        {stats && stats.streakDays >= 3 && (
                <motion.div
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">You're on a roll! 🎉</p>
                <p className="text-xs text-gray-600">Keep logging your mood to maintain your streak.</p>
                      </div>
                  </div>
                </motion.div>
              )}
      </div>
    </div>
  );
};

export default DashboardPage;
