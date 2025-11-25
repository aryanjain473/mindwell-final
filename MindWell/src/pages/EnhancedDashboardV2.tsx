import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import DailyOverview from '../components/DailyOverview';
import EnhancedMoodTracking from '../components/EnhancedMoodTracking';
import EnhancedQuickActions from '../components/EnhancedQuickActions';
import EnhancedActivityTimeline from '../components/EnhancedActivityTimeline';
import DarkModeToggle from '../components/DarkModeToggle';
import MotivationalQuote from '../components/MotivationalQuote';
import MobileOptimizedLayout from '../components/MobileOptimizedLayout';
import MobileMoodLogger from '../components/MobileMoodLogger';
import AcademicStressCard from '../components/stress/AcademicStressCard';

interface ActivityData {
  date: string;
  mood: number;
  notes: string;
  activities: string[];
  createdAt: string;
}

interface DashboardStats {
  totalSessions: number;
  averageMood: number;
  streakDays: number;
  lastActivity: string;
  mindfulnessScore: number;
  longestStreak: number;
}

const EnhancedDashboardV2: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState<'sad' | 'normal' | 'happy'>('normal');
  const [todayNotes, setTodayNotes] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('Every small step towards wellness is a victory worth celebrating.');
  const [wellnessTip, setWellnessTip] = useState('Take 5 deep breaths before checking your phone in the morning.');
  const [suggestedActivity, setSuggestedActivity] = useState('Try a 4-7-8 Breathing Exercise for 3 minutes');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real data from API
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities')
      ]);

      setStats(statsResponse.data.data);
      setActivities(Array.isArray(activitiesResponse.data.data) ? activitiesResponse.data.data : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setStats({
        totalSessions: 42,
        averageMood: 7.2,
        streakDays: 12,
        lastActivity: new Date().toISOString(),
        mindfulnessScore: 75,
        longestStreak: 28
      });
      setActivities([
        {
          date: new Date().toISOString(),
          mood: 8,
          notes: 'Feeling great today! Had a wonderful morning walk.',
          activities: ['Mood Check-in', 'Breathing Exercise'],
          createdAt: new Date().toISOString()
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          mood: 6,
          notes: 'Decent day, feeling a bit tired.',
          activities: ['Mood Check-in', 'Meditation'],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogMood = async (mood: 'sad' | 'normal' | 'happy', notes: string, selectedActivities: string[]) => {
    try {
      // Convert emoji mood to number scale
      const moodNumber = mood === 'sad' ? 3 : mood === 'normal' ? 6 : 9;
      
      const response = await api.post('/dashboard/mood', {
        mood: moodNumber,
        notes,
        activities: selectedActivities
      });
      
      // Refresh data
      await fetchDashboardData();
      setShowMoodLogger(false);
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  const handleExport = () => {
    const activitiesArray = Array.isArray(activities) ? activities : [];
    const csvContent = [
      ['Date', 'Mood', 'Notes', 'Activities'],
      ...activitiesArray.map(activity => [
        new Date(activity.createdAt).toLocaleDateString(),
        activity.mood,
        activity.notes,
        activity.activities.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mood-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshQuote = () => {
    const quotes = [
      'Every small step towards wellness is a victory worth celebrating.',
      'Your mental health is just as important as your physical health.',
      'Progress, not perfection, is the goal.',
      'Self-care is not selfish; it\'s essential.',
      'You are stronger than you think and more capable than you know.',
      'Every day is a new opportunity to be kind to yourself.',
      'Your feelings are valid, and your journey is unique.',
      'Healing is not linear, and that\'s perfectly okay.'
    ];
    
    const tips = [
      'Take 5 deep breaths before checking your phone in the morning.',
      'Practice gratitude by writing down three things you\'re thankful for each day.',
      'Take a 10-minute walk outside to boost your mood naturally.',
      'Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.',
      'Set aside 5 minutes daily for mindfulness or meditation.',
      'Connect with a friend or loved one for at least 10 minutes today.',
      'Get 7-9 hours of quality sleep to support your mental wellness.',
      'Limit social media to 30 minutes per day to reduce comparison and anxiety.'
    ];

    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setWellnessTip(tips[Math.floor(Math.random() * tips.length)]);
  };

  const handleSaveQuote = () => {
    // In a real app, this would save to user's favorites
    console.log('Quote saved to favorites:', dailyQuote);
  };

  const isMoodLoggedToday = () => {
    if (!Array.isArray(activities) || activities.length === 0) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasLoggedToday = activities.some(activity => {
      const activityDate = new Date(activity.createdAt || activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });
    
    return hasLoggedToday;
  };

  const getCompletedActions = () => {
    if (!Array.isArray(activities) || activities.length === 0) {
      return [];
    }
    
    const today = new Date().toDateString();
    const todayActivities = activities.filter(activity => 
      new Date(activity.createdAt).toDateString() === today
    );
    
    const completed = [];
    if (todayActivities.some(a => a.activities.includes('Mood Check-in'))) completed.push('log-mood');
    if (todayActivities.some(a => a.activities.includes('Journal'))) completed.push('journal');
    if (todayActivities.some(a => a.activities.includes('Breathing Exercise'))) completed.push('breathing');
    if (todayActivities.some(a => a.activities.includes('Meditation'))) completed.push('meditation');
    if (todayActivities.some(a => a.activities.includes('Gratitude Practice'))) completed.push('gratitude');
    if (todayActivities.some(a => a.activities.includes('Sleep Tracker'))) completed.push('sleep-tracker');
    if (todayActivities.some(a => a.activities.includes('Mood Photo'))) completed.push('mood-photo');
    if (todayActivities.some(a => a.activities.includes('Goal Setting'))) completed.push('goal-setting');
    
    return completed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your enhanced dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <MobileOptimizedLayout currentPage="dashboard">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-2 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName || 'User'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  Your enhanced wellness dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Daily Overview */}
        <DailyOverview
          isMoodLoggedToday={isMoodLoggedToday()}
          streakDays={stats?.streakDays || 0}
          longestStreak={stats?.longestStreak || 0}
          suggestedActivity={suggestedActivity}
          dailyQuote={dailyQuote}
          wellnessTip={wellnessTip}
          onLogMood={() => setShowMoodLogger(true)}
          onRefreshQuote={handleRefreshQuote}
          onSaveQuote={handleSaveQuote}
        />

        {/* Enhanced Mood Tracking */}
        <EnhancedMoodTracking
          moodData={Array.isArray(activities) ? activities : []}
          averageMood={stats?.averageMood || 0}
          mindfulnessScore={stats?.mindfulnessScore || 0}
          onTimeRangeChange={setTimeRange}
          timeRange={timeRange}
        />

        {/* Enhanced Quick Actions */}
        <EnhancedQuickActions
          onLogMood={() => setShowMoodLogger(true)}
          onJournal={() => navigate('/journal')}
          onBreathing={() => navigate('/breathing')}
          onMeditation={() => navigate('/meditation')}
          onGratitude={() => navigate('/gratitude')}
          onSleepTracker={() => navigate('/sleep')}
          onMoodPhoto={() => navigate('/face-mood')}
          onGoalSetting={() => navigate('/goals')}
          completedActions={getCompletedActions()}
        />

        {/* Enhanced Activity Timeline */}
        <EnhancedActivityTimeline
          activities={Array.isArray(activities) ? activities : []}
          onExport={handleExport}
        />

        {/* Academic Stress Card */}
        <div className="mb-8">
          <AcademicStressCard />
        </div>

        {/* Future Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* AI Recommendations Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 border border-purple-200 dark:border-purple-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🤖 AI Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Coming soon: Personalized wellness suggestions based on your patterns
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                "Based on your last week's moods, try a short meditation session in the morning."
              </p>
            </div>
          </motion.div>

          {/* Weekly Reports Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📊 Weekly Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Coming soon: Detailed insights and progress summaries
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                "Your weekly mood trend shows a 15% improvement. Keep up the great work!"
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile-Optimized Mood Logger Modal */}
      <MobileMoodLogger
        isOpen={showMoodLogger}
        onClose={() => setShowMoodLogger(false)}
        onSave={(moodData) => handleLogMood(moodData.mood, moodData.notes, moodData.activities)}
      />
      </div>
    </MobileOptimizedLayout>
  );
};

export default EnhancedDashboardV2;
