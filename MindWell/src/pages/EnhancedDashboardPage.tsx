import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
// Removed unused imports
import api from '../utils/axiosConfig';
import DynamicStats from '../components/DynamicStats';
import MoodCharts from '../components/MoodCharts';
import MotivationalQuote from '../components/MotivationalQuote';
import ActivityTimeline from '../components/ActivityTimeline';
import QuickActions from '../components/QuickActions';
import CorrelationInsights from '../components/CorrelationInsights';
import MilestonesStreaks from '../components/MilestonesStreaks';
import Notifications from '../components/Notifications';
import AISuggestions from '../components/AISuggestions';

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
}

const EnhancedDashboardPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState(5);
  const [todayNotes, setTodayNotes] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [showMoodLogger, setShowMoodLogger] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real data from API
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities?limit=50')
      ]);

      if (statsResponse.data.success) {
        const apiStats = statsResponse.data.data;
        setStats({
          ...apiStats,
          mindfulnessScore: calculateMindfulnessScore(apiStats)
        });
      }

      if (activitiesResponse.data.success) {
        const formattedActivities = activitiesResponse.data.data.map((activity: any) => ({
          date: activity.createdAt.split('T')[0],
          mood: activity.mood || 0,
          notes: activity.notes || '',
          activities: activity.activities || [],
          createdAt: activity.createdAt
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      const mockStats: DashboardStats = {
        totalSessions: 0,
        averageMood: 0,
        streakDays: 0,
        lastActivity: new Date().toISOString(),
        mindfulnessScore: 0
      };
      setStats(mockStats);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMindfulnessScore = (apiStats: any) => {
    // Calculate mindfulness score based on consistency and mood patterns
    const baseScore = 50;
    const streakBonus = Math.min(apiStats.streakDays * 2, 30);
    const moodBonus = apiStats.averageMood > 6 ? 20 : 0;
    return Math.min(baseScore + streakBonus + moodBonus, 100);
  };

  const handleLogMood = async () => {
    try {
      const response = await api.post('/dashboard/mood', {
        mood: currentMood,
        notes: todayNotes,
        activities: ['Mood Check-in']
      });

      if (response.data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
        setTodayNotes('');
        setShowMoodLogger(false);
        
        // Show success message
        alert('Mood logged successfully! 🎉');
      }
    } catch (error) {
      console.error('Error logging mood:', error);
      alert('Failed to log mood. Please try again.');
    }
  };

  // Quick action handlers
  const handleBreathingExercise = () => {
    alert('Breathing exercise feature coming soon! 🧘‍♀️');
  };

  const handleJournal = () => {
    alert('Daily journal feature coming soon! 📝');
  };

  const handleSleepTracker = () => {
    alert('Sleep tracker feature coming soon! 😴');
  };

  const handleMeditation = () => {
    alert('Meditation feature coming soon! 🧘');
  };

  const handleGratitude = () => {
    alert('Gratitude practice feature coming soon! 🙏');
  };

  const handlePhoto = () => {
    alert('Mood photo feature coming soon! 📸');
  };

  const handleGoal = () => {
    alert('Goal setting feature coming soon! 🎯');
  };

  const handleExport = () => {
    // Create CSV export
    const csvContent = [
      ['Date', 'Mood', 'Notes', 'Activities'],
      ...activities.map(activity => [
        activity.date,
        activity.mood.toString(),
        activity.notes,
        activity.activities.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Here's your mental wellness overview
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Removed logout and settings buttons from dashboard header */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Dynamic Stats */}
        <DynamicStats stats={stats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions
          onMoodLog={() => setShowMoodLogger(true)}
          onBreathingExercise={handleBreathingExercise}
          onJournal={handleJournal}
          onSleepTracker={handleSleepTracker}
          onMeditation={handleMeditation}
          onGratitude={handleGratitude}
          onPhoto={handlePhoto}
          onGoal={handleGoal}
        />

        {/* Mood Charts */}
        <MoodCharts 
          moodHistory={activities.map(activity => ({
            date: activity.date,
            mood: activity.mood,
            activities: activity.activities
          }))}
          timeRange={timeRange}
        />

        {/* Time Range Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '30d'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Notifications */}
        <Notifications
          streakDays={stats?.streakDays || 0}
          lastMoodLog={stats?.lastActivity ? new Date(stats.lastActivity) : undefined}
          totalSessions={stats?.totalSessions || 0}
          onMoodLog={() => setShowMoodLogger(true)}
        />

        {/* AI Suggestions */}
        <AISuggestions
          currentMood={currentMood}
          averageMood={stats?.averageMood || 0}
          streakDays={stats?.streakDays || 0}
          recentActivities={activities.slice(0, 5).flatMap(a => a.activities)}
          onSuggestionClick={(suggestion) => {
            alert(`Starting ${suggestion.title}! 🚀`);
          }}
        />

        {/* Correlation Insights - Temporarily disabled for debugging */}
        {/* <CorrelationInsights activities={activities} /> */}

        {/* Milestones & Streaks */}
        <MilestonesStreaks
          totalSessions={stats?.totalSessions || 0}
          streakDays={stats?.streakDays || 0}
          averageMood={stats?.averageMood || 0}
          activities={activities}
        />

        {/* Activity Timeline */}
        <ActivityTimeline
          activities={activities}
          onExport={handleExport}
        />

        {/* Mood Logger Modal */}
        {showMoodLogger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowMoodLogger(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Log Your Mood
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling? ({currentMood}/10)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {currentMood >= 9 ? '😄' : currentMood >= 7 ? '😊' : currentMood >= 5 ? '😐' : currentMood >= 3 ? '😔' : '😞'}
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-gray-900">{currentMood}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={todayNotes}
                  onChange={(e) => setTodayNotes(e.target.value)}
                  placeholder="How was your day? Any thoughts to share..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMoodLogger(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogMood}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Log Mood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;
