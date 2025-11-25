import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  BookOpen, 
  Wind, 
  Camera, 
  Moon, 
  Star, 
  Target,
  CheckCircle,
  Clock,
  Zap,
  Play,
  Plus,
  TrendingUp
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  priority: 'high' | 'medium' | 'low';
  completedToday: boolean;
  estimatedTime: string;
  category: 'core' | 'secondary' | 'new';
  action: () => void;
}

interface EnhancedQuickActionsProps {
  onLogMood: () => void;
  onJournal: () => void;
  onBreathing: () => void;
  onMeditation: () => void;
  onGratitude: () => void;
  onSleepTracker: () => void;
  onMoodPhoto: () => void;
  onGoalSetting: () => void;
  completedActions: string[];
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({
  onLogMood,
  onJournal,
  onBreathing,
  onMeditation,
  onGratitude,
  onSleepTracker,
  onMoodPhoto,
  onGoalSetting,
  completedActions
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    // Core Actions (High Priority)
    {
      id: 'log-mood',
      title: 'Log Mood',
      description: 'Track how you\'re feeling right now',
      icon: <Heart className="h-6 w-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      borderColor: 'border-pink-200',
      priority: 'high',
      completedToday: completedActions.includes('log-mood'),
      estimatedTime: '2 min',
      category: 'core',
      action: onLogMood
    },
    {
      id: 'journal',
      title: 'Daily Journal',
      description: 'Reflect on your day and thoughts',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      priority: 'high',
      completedToday: completedActions.includes('journal'),
      estimatedTime: '5 min',
      category: 'core',
      action: onJournal
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: '4-7-8 breathing technique',
      icon: <Wind className="h-6 w-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      borderColor: 'border-teal-200',
      priority: 'high',
      completedToday: completedActions.includes('breathing'),
      estimatedTime: '3 min',
      category: 'core',
      action: onBreathing
    },

    // Secondary Actions (Medium Priority)
    {
      id: 'meditation',
      title: 'Meditation',
      description: 'Guided mindfulness session',
      icon: <Target className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      priority: 'medium',
      completedToday: completedActions.includes('meditation'),
      estimatedTime: '10 min',
      category: 'secondary',
      action: onMeditation
    },
    {
      id: 'gratitude',
      title: 'Gratitude Practice',
      description: 'Write down what you\'re grateful for',
      icon: <Star className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      priority: 'medium',
      completedToday: completedActions.includes('gratitude'),
      estimatedTime: '3 min',
      category: 'secondary',
      action: onGratitude
    },
    {
      id: 'sleep-tracker',
      title: 'Sleep Tracker',
      description: 'Log your sleep quality and duration',
      icon: <Moon className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200',
      priority: 'medium',
      completedToday: completedActions.includes('sleep-tracker'),
      estimatedTime: '1 min',
      category: 'secondary',
      action: onSleepTracker
    },

    // New Actions (Low Priority)
    {
      id: 'mood-photo',
      title: 'Mood Photo',
      description: 'Capture a moment that represents your mood',
      icon: <Camera className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      priority: 'low',
      completedToday: completedActions.includes('mood-photo'),
      estimatedTime: '2 min',
      category: 'new',
      action: onMoodPhoto
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Set and track your wellness goals',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      priority: 'low',
      completedToday: completedActions.includes('goal-setting'),
      estimatedTime: '5 min',
      category: 'new',
      action: onGoalSetting
    }
  ];

  const coreActions = actions.filter(action => action.category === 'core');
  const secondaryActions = actions.filter(action => action.category === 'secondary');
  const newActions = actions.filter(action => action.category === 'new');

  const completedCount = completedActions.length;
  const totalActions = actions.length;
  const completionRate = Math.round((completedCount / totalActions) * 100);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '⚪';
      default: return '⚪';
    }
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
            <Zap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 text-sm">Your daily wellness activities</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Today's Progress</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Daily Progress</h4>
          <span className="text-sm text-indigo-600 font-medium">
            {completedCount}/{totalActions} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Core Actions (High Priority) */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Play className="h-5 w-5 text-red-600 mr-2" />
          Core Actions
          <span className="ml-2 text-sm text-gray-500">(Essential for today)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {coreActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={action.action}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                action.completedToday
                  ? `${action.bgColor} ${action.borderColor} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                {getPriorityIcon(action.priority)}
              </div>

              {/* Completion Status */}
              {action.completedToday && (
                <div className="absolute top-2 left-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              {/* Action Icon */}
              <div className={`p-3 rounded-lg mb-3 ${action.completedToday ? action.bgColor : 'bg-gray-100'}`}>
                <div className={action.completedToday ? action.color : 'text-gray-400'}>
                  {action.icon}
                </div>
              </div>

              {/* Action Info */}
              <h5 className={`font-semibold mb-2 ${action.completedToday ? 'text-gray-900' : 'text-gray-700'}`}>
                {action.title}
              </h5>
              <p className={`text-sm mb-3 ${action.completedToday ? 'text-gray-600' : 'text-gray-500'}`}>
                {action.description}
              </p>

              {/* Time Estimate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {action.estimatedTime}
                </div>
                {action.completedToday ? (
                  <div className="text-xs text-green-600 font-medium">Completed ✓</div>
                ) : (
                  <div className="text-xs text-indigo-600 font-medium">Start →</div>
                )}
              </div>

              {/* Hover Effect */}
              {hoveredAction === action.id && !action.completedToday && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-indigo-500 bg-opacity-10 rounded-xl flex items-center justify-center"
                >
                  <Plus className="h-6 w-6 text-indigo-600" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-yellow-600 mr-2" />
          Secondary Actions
          <span className="ml-2 text-sm text-gray-500">(Recommended)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {secondaryActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 3) * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                action.completedToday
                  ? `${action.bgColor} ${action.borderColor} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                {getPriorityIcon(action.priority)}
              </div>

              {/* Completion Status */}
              {action.completedToday && (
                <div className="absolute top-2 left-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              {/* Action Icon */}
              <div className={`p-3 rounded-lg mb-3 ${action.completedToday ? action.bgColor : 'bg-gray-100'}`}>
                <div className={action.completedToday ? action.color : 'text-gray-400'}>
                  {action.icon}
                </div>
              </div>

              {/* Action Info */}
              <h5 className={`font-semibold mb-2 ${action.completedToday ? 'text-gray-900' : 'text-gray-700'}`}>
                {action.title}
              </h5>
              <p className={`text-sm mb-3 ${action.completedToday ? 'text-gray-600' : 'text-gray-500'}`}>
                {action.description}
              </p>

              {/* Time Estimate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {action.estimatedTime}
                </div>
                {action.completedToday ? (
                  <div className="text-xs text-green-600 font-medium">Completed ✓</div>
                ) : (
                  <div className="text-xs text-indigo-600 font-medium">Try →</div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* New Actions */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="h-5 w-5 text-green-600 mr-2" />
          New Features
          <span className="ml-2 text-sm text-gray-500">(Explore when ready)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {newActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 6) * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                action.completedToday
                  ? `${action.bgColor} ${action.borderColor} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* New Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                NEW
              </div>

              {/* Completion Status */}
              {action.completedToday && (
                <div className="absolute top-2 left-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              {/* Action Icon */}
              <div className={`p-3 rounded-lg mb-3 ${action.completedToday ? action.bgColor : 'bg-gray-100'}`}>
                <div className={action.completedToday ? action.color : 'text-gray-400'}>
                  {action.icon}
                </div>
              </div>

              {/* Action Info */}
              <h5 className={`font-semibold mb-2 ${action.completedToday ? 'text-gray-900' : 'text-gray-700'}`}>
                {action.title}
              </h5>
              <p className={`text-sm mb-3 ${action.completedToday ? 'text-gray-600' : 'text-gray-500'}`}>
                {action.description}
              </p>

              {/* Time Estimate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {action.estimatedTime}
                </div>
                {action.completedToday ? (
                  <div className="text-xs text-green-600 font-medium">Completed ✓</div>
                ) : (
                  <div className="text-xs text-green-600 font-medium">Explore →</div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedQuickActions;
