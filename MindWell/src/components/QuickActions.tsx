import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Calendar,
  MapPin,
  BookOpen,
  Target
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  route: string;
  available: boolean;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [journalClickCount, setJournalClickCount] = useState(0);

  const actions: QuickAction[] = [
    {
      id: 'ai-chat',
      title: 'AI Chat',
      description: 'Talk to our AI companion',
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      route: '/chat',
      available: true
    },
    {
      id: 'mood-check',
      title: 'Mood Check',
      description: 'Log your current mood',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      route: '#mood-logger',
      available: true
    },
    {
      id: 'find-therapists',
      title: 'Find Therapists',
      description: 'Discover nearby professionals',
      icon: MapPin,
      color: 'text-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
      borderColor: 'border-teal-200',
      route: '/therapists',
      available: true
    },
    {
      id: 'progress',
      title: 'Progress',
      description: 'View your wellness journey',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      route: '#progress',
      available: true
    },
    {
      id: 'meditation',
      title: 'Meditation',
      description: 'Guided mindfulness sessions',
      icon: Brain,
      color: 'text-green-600',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      route: '/meditation',
      available: false
    },
    {
      id: 'journal',
      title: 'Daily Journal',
      description: 'Write about your day',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      route: '/journal',
      available: true
    },
    {
      id: 'goals',
      title: 'Goals',
      description: 'Set and track objectives',
      icon: Target,
      color: 'text-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-200',
      route: '/goals',
      available: false
    },
    {
      id: 'appointments',
      title: 'Appointments',
      description: 'Manage your sessions',
      icon: Calendar,
      color: 'text-cyan-600',
      bgColor: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-200',
      route: '/appointments',
      available: false
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    console.log('QuickAction clicked:', action);
    
    // Track journal clicks specifically
    if (action.id === 'journal') {
      setJournalClickCount(prev => {
        const newCount = prev + 1;
        console.log(`${newCount} Journal clicked`);
        return newCount;
      });
    }
    
    if (!action.available) {
      // Show coming soon message for unavailable features
      alert(`${action.title} feature coming soon! 🚀`);
      return;
    }

    if (action.route.startsWith('#')) {
      // Scroll to element on same page
      const element = document.querySelector(action.route);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to different page
      console.log('Navigating to:', action.route);
      navigate(action.route);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 text-teal-600 mr-2" />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`p-4 text-center rounded-lg transition-all duration-200 border-2 ${
              action.available
                ? `bg-gradient-to-br ${action.bgColor} hover:shadow-md ${action.borderColor} hover:scale-105`
                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            whileHover={action.available ? { scale: 1.05 } : {}}
            whileTap={action.available ? { scale: 0.95 } : {}}
          >
            <action.icon className={`h-8 w-8 mx-auto mb-2 ${
              action.available ? action.color : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              action.available ? action.color.replace('text-', 'text-').replace('-600', '-800') : 'text-gray-500'
            }`}>
              {action.title}
            </p>
            <p className={`text-xs mt-1 ${
              action.available ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {action.description}
            </p>
            {!action.available && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  Coming Soon
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;