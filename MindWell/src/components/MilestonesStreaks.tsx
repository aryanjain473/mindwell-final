import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Target, 
  Award,
  Star,
  Flame,
  Clock,
  CheckCircle,
  Lock,
  Zap
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  achieved: boolean;
  category: 'streak' | 'mood' | 'activity' | 'consistency';
  reward: string;
}

interface MilestonesStreaksProps {
  totalSessions: number;
  streakDays: number;
  averageMood: number;
  activities: any[];
}

const MilestonesStreaks: React.FC<MilestonesStreaksProps> = ({ 
  totalSessions, 
  streakDays, 
  averageMood, 
  activities 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'streak' | 'mood' | 'activity' | 'consistency'>('all');

  const milestones: Milestone[] = useMemo(() => [
    // Streak milestones
    {
      id: 'streak-1',
      title: 'First Steps',
      description: 'Log your mood for 1 day in a row',
      icon: <Flame className="h-6 w-6" />,
      requirement: 1,
      current: streakDays,
      achieved: streakDays >= 1,
      category: 'streak',
      reward: '🔥 First streak!'
    },
    {
      id: 'streak-3',
      title: 'Getting Started',
      description: 'Log your mood for 3 days in a row',
      icon: <Flame className="h-6 w-6" />,
      requirement: 3,
      current: streakDays,
      achieved: streakDays >= 3,
      category: 'streak',
      reward: '🎯 Consistency building!'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Log your mood for 7 days in a row',
      icon: <Trophy className="h-6 w-6" />,
      requirement: 7,
      current: streakDays,
      achieved: streakDays >= 7,
      category: 'streak',
      reward: '🏆 Week champion!'
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: 'Log your mood for 30 days in a row',
      icon: <Award className="h-6 w-6" />,
      requirement: 30,
      current: streakDays,
      achieved: streakDays >= 30,
      category: 'streak',
      reward: '👑 Monthly master!'
    },

    // Mood milestones
    {
      id: 'mood-5',
      title: 'Mood Tracker',
      description: 'Log 5 different moods',
      icon: <Target className="h-6 w-6" />,
      requirement: 5,
      current: totalSessions,
      achieved: totalSessions >= 5,
      category: 'mood',
      reward: '📊 Data collector!'
    },
    {
      id: 'mood-10',
      title: 'Mood Explorer',
      description: 'Log 10 different moods',
      icon: <Star className="h-6 w-6" />,
      requirement: 10,
      current: totalSessions,
      achieved: totalSessions >= 10,
      category: 'mood',
      reward: '🌟 Mood explorer!'
    },
    {
      id: 'mood-25',
      title: 'Mood Master',
      description: 'Log 25 different moods',
      icon: <Trophy className="h-6 w-6" />,
      requirement: 25,
      current: totalSessions,
      achieved: totalSessions >= 25,
      category: 'mood',
      reward: '🎖️ Mood master!'
    },

    // Activity milestones
    {
      id: 'activity-3',
      title: 'Activity Starter',
      description: 'Try 3 different activities',
      icon: <Zap className="h-6 w-6" />,
      requirement: 3,
      current: new Set(activities.flatMap(a => a.activities)).size,
      achieved: new Set(activities.flatMap(a => a.activities)).size >= 3,
      category: 'activity',
      reward: '⚡ Activity explorer!'
    },
    {
      id: 'activity-5',
      title: 'Activity Enthusiast',
      description: 'Try 5 different activities',
      icon: <Award className="h-6 w-6" />,
      requirement: 5,
      current: new Set(activities.flatMap(a => a.activities)).size,
      achieved: new Set(activities.flatMap(a => a.activities)).size >= 5,
      category: 'activity',
      reward: '🎯 Activity enthusiast!'
    },

    // Consistency milestones
    {
      id: 'consistency-7',
      title: 'Weekly Warrior',
      description: 'Log mood for 7 days in a week',
      icon: <Calendar className="h-6 w-6" />,
      requirement: 7,
      current: Math.min(streakDays, 7),
      achieved: streakDays >= 7,
      category: 'consistency',
      reward: '📅 Weekly warrior!'
    },
    {
      id: 'consistency-30',
      title: 'Monthly Champion',
      description: 'Log mood for 30 days in a month',
      icon: <Trophy className="h-6 w-6" />,
      requirement: 30,
      current: Math.min(streakDays, 30),
      achieved: streakDays >= 30,
      category: 'consistency',
      reward: '🏅 Monthly champion!'
    }
  ], [totalSessions, streakDays, activities]);

  const filteredMilestones = selectedCategory === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === selectedCategory);

  const achievedMilestones = milestones.filter(m => m.achieved);
  const totalMilestones = milestones.length;
  const achievementRate = Math.round((achievedMilestones.length / totalMilestones) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return 'text-orange-600 bg-orange-100';
      case 'mood': return 'text-blue-600 bg-blue-100';
      case 'activity': return 'text-green-600 bg-green-100';
      case 'consistency': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (achieved: boolean, current: number, requirement: number) => {
    if (achieved) return 'bg-green-500';
    const progress = Math.min(current / requirement, 1);
    if (progress >= 0.8) return 'bg-yellow-500';
    if (progress >= 0.5) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg mr-4">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Milestones & Achievements</h3>
            <p className="text-gray-600 text-sm">Track your wellness journey progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{achievementRate}%</div>
          <div className="text-sm text-gray-600">Achievement Rate</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All', count: milestones.length },
          { key: 'streak', label: 'Streaks', count: milestones.filter(m => m.category === 'streak').length },
          { key: 'mood', label: 'Mood', count: milestones.filter(m => m.category === 'mood').length },
          { key: 'activity', label: 'Activities', count: milestones.filter(m => m.category === 'activity').length },
          { key: 'consistency', label: 'Consistency', count: milestones.filter(m => m.category === 'consistency').length }
        ].map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <AnimatePresence>
          {filteredMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                milestone.achieved
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  milestone.achieved ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {milestone.achieved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">
                    {milestone.current}/{milestone.requirement}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(milestone.category)}`}>
                    {milestone.category}
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">{milestone.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((milestone.current / milestone.requirement) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getProgressColor(milestone.achieved, milestone.current, milestone.requirement)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((milestone.current / milestone.requirement) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>

              {milestone.achieved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full text-center"
                >
                  {milestone.reward}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {achievedMilestones.length}
            </div>
            <div className="text-sm text-yellow-700">Achievements Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {streakDays}
            </div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {totalSessions}
            </div>
            <div className="text-sm text-red-700">Total Sessions</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MilestonesStreaks;
