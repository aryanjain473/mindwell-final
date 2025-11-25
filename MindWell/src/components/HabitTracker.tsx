import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Flame, 
  Award, 
  Plus, 
  Edit3, 
  Trash2,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import habitsService from '../services/habitsService';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'wellness' | 'productivity' | 'social' | 'learning' | 'fitness' | 'mindfulness';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  createdAt: string;
  isActive: boolean;
}

interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

interface HabitTrackerProps {
  userId: string;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'wellness' as const,
    frequency: 'daily' as const,
    targetCount: 1
  });

  const categoryColors = {
    wellness: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    productivity: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    social: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    learning: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    fitness: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    mindfulness: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' }
  };

  const categoryIcons = {
    wellness: '🌱',
    productivity: '⚡',
    social: '👥',
    learning: '📚',
    fitness: '💪',
    mindfulness: '🧘'
  };

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const response = await habitsService.getHabits();
      if (response.success) {
        setHabits(response.data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      // Set empty array on error
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const existingCompletion = completions.find(
        c => c.habitId === habitId && c.date === date
      );
      
      const newCompleted = !existingCompletion?.completed;
      
      // Call API to toggle completion
      const response = await habitsService.toggleCompletion(habitId, date, newCompleted);
      
      if (response.success) {
        // Update local state
        const newCompletion: HabitCompletion = {
          habitId,
          date,
          completed: newCompleted
        };

        if (existingCompletion) {
          setCompletions(prev => 
            prev.map(c => 
              c.habitId === habitId && c.date === date 
                ? newCompletion 
                : c
            )
          );
        } else {
          setCompletions(prev => [...prev, newCompletion]);
        }

        // Refresh habits to get updated streaks
        await fetchHabits();
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };


  const getCompletionStatus = (habitId: string, date: string) => {
    const completion = completions.find(
      c => c.habitId === habitId && c.date === date
    );
    return completion?.completed || false;
  };

  const getWeeklyProgress = (habit: Habit) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekCompletions = completions.filter(
      c => c.habitId === habit.id && 
           new Date(c.date) >= weekAgo && 
           c.completed
    ).length;
    
    return Math.min((weekCompletions / (habit.targetCount * 7)) * 100, 100);
  };

  const getTotalStreakDays = () => {
    return habits.reduce((total, habit) => total + habit.currentStreak, 0);
  };

  const getActiveHabitsCount = () => {
    return habits.filter(habit => habit.isActive).length;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-xl mr-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Habit Tracker</h3>
            <p className="text-gray-600 text-sm">Build positive habits and track your progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddHabit(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <div className="text-3xl font-bold text-orange-600 mb-1">{getTotalStreakDays()}</div>
          <div className="text-sm text-orange-700 font-medium">Total Streak Days</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-1">{getActiveHabitsCount()}</div>
          <div className="text-sm text-blue-700 font-medium">Active Habits</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak)) : 0}
          </div>
          <div className="text-sm text-green-700 font-medium">Best Streak</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {habits.reduce((total, habit) => total + habit.totalCompletions, 0)}
          </div>
          <div className="text-sm text-purple-700 font-medium">Total Completions</div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h4>
            <p className="text-gray-600 mb-4">Start building positive habits to improve your wellness journey.</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border-2 ${categoryColors[habit.category].border} ${categoryColors[habit.category].bg} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{categoryIcons[habit.category]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{habit.name}</h4>
                    <p className="text-xs text-gray-600">{habit.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-white/50 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {/* Handle delete */}}
                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-white/50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Flame className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="font-semibold text-orange-600 text-sm">{habit.currentStreak}</span>
                  </div>
                  <div className="text-xs text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="font-semibold text-blue-600 text-sm">{habit.longestStreak}</span>
                  </div>
                  <div className="text-xs text-gray-600">Best</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="font-semibold text-green-600 text-sm">{habit.totalCompletions}</span>
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>

              {/* Weekly Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">This Week</span>
                  <span className="text-xs font-medium text-gray-900">
                    {getWeeklyProgress(habit).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${getWeeklyProgress(habit)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id, new Date().toISOString().split('T')[0])}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      getCompletionStatus(habit.id, new Date().toISOString().split('T')[0])
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getCompletionStatus(habit.id, new Date().toISOString().split('T')[0]) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {getCompletionStatus(habit.id, new Date().toISOString().split('T')[0]) ? 'Done' : 'Mark Done'}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {habit.frequency} • {habit.targetCount} per {habit.frequency.slice(0, -2)}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Motivational Message */}
      {habits.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-orange-500 mr-2" />
            <p className="text-sm text-gray-700">
              <strong>Keep it up!</strong> Consistency is key to building lasting habits. 
              Every small step counts towards your wellness goals.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HabitTracker;
