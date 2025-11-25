import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Plus, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';

interface Goal {
  _id?: string;
  title: string;
  description: string;
  targetDate?: string;
  completed: boolean;
  createdAt?: string;
}

const GoalsPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      // For now, use localStorage. In production, this would be an API call
      const savedGoals = localStorage.getItem('wellness-goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    localStorage.setItem('wellness-goals', JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      _id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate || undefined,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    setNewGoal({ title: '', description: '', targetDate: '' });
    setShowAddForm(false);
  };

  const handleToggleComplete = (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal._id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal._id !== goalId);
    saveGoals(updatedGoals);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Goals</h1>
                <p className="text-sm text-gray-600">Set and track your wellness objectives</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
              <p className="text-sm text-gray-600">Track your wellness journey</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{completedCount} completed</span>
            <span>{totalCount} total</span>
          </div>
        </motion.div>

        {/* Add Goal Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Meditate daily for 10 minutes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Add details about your goal..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewGoal({ title: '', description: '', targetDate: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center"
          >
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">Start your wellness journey by setting your first goal!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Add Your First Goal
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
                  goal.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100 hover:border-teal-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(goal._id!)}
                      className={`mt-1 p-2 rounded-full transition-colors ${
                        goal.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400 hover:bg-teal-200'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          goal.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p
                          className={`text-sm mb-3 ${
                            goal.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {goal.description}
                        </p>
                      )}
                      {goal.targetDate && (
                        <p className="text-xs text-gray-500">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal._id!)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;

