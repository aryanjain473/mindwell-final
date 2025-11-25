import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  Mail, 
  CheckCircle, 
  X, 
  Settings,
  Calendar,
  Heart,
  Zap,
  Target
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'insight' | 'tip';
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

interface NotificationsProps {
  streakDays: number;
  lastMoodLog?: Date;
  totalSessions: number;
  onMoodLog: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ 
  streakDays, 
  lastMoodLog, 
  totalSessions, 
  onMoodLog 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    moodReminders: true,
    achievementAlerts: true,
    weeklySummary: true,
    insights: true,
    reminderTime: '18:00'
  });

  useEffect(() => {
    generateNotifications();
  }, [streakDays, lastMoodLog, totalSessions]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Check if mood logging is needed
    const today = new Date();
    const lastLogDate = lastMoodLog ? new Date(lastMoodLog) : null;
    const needsMoodLog = !lastLogDate || 
      lastLogDate.toDateString() !== today.toDateString();

    if (needsMoodLog && settings.moodReminders) {
      newNotifications.push({
        id: 'mood-reminder',
        type: 'reminder',
        title: 'Daily Mood Check-in',
        message: "Don't forget to log your mood today! It only takes a minute.",
        icon: <Heart className="h-5 w-5" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        timestamp: new Date(),
        read: false,
        action: onMoodLog
      });
    }

    // Streak reminders
    if (streakDays > 0 && streakDays % 7 === 0 && settings.achievementAlerts) {
      newNotifications.push({
        id: 'streak-milestone',
        type: 'achievement',
        title: 'Streak Milestone!',
        message: `Amazing! You've maintained a ${streakDays}-day streak. Keep it up!`,
        icon: <Zap className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        timestamp: new Date(),
        read: false
      });
    }

    // Session milestones
    if (totalSessions > 0 && totalSessions % 10 === 0 && settings.achievementAlerts) {
      newNotifications.push({
        id: 'session-milestone',
        type: 'achievement',
        title: 'Session Milestone!',
        message: `Congratulations! You've logged ${totalSessions} mood sessions.`,
        icon: <Target className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        timestamp: new Date(),
        read: false
      });
    }

    // Weekly summary reminder
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 && settings.weeklySummary) { // Sunday
      newNotifications.push({
        id: 'weekly-summary',
        type: 'tip',
        title: 'Weekly Summary Available',
        message: "Check out your weekly mood insights and patterns.",
        icon: <Calendar className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        timestamp: new Date(),
        read: false
      });
    }

    // Random wellness tips
    const tips = [
      {
        title: 'Mindfulness Tip',
        message: 'Take 5 deep breaths before checking your phone in the morning.',
        icon: <Heart className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Wellness Reminder',
        message: 'Regular mood tracking helps identify patterns and triggers.',
        icon: <Target className="h-5 w-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
      },
      {
        title: 'Self-Care Tip',
        message: 'Even 5 minutes of meditation can improve your mood significantly.',
        icon: <Zap className="h-5 w-5" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100'
      }
    ];

    if (settings.insights && Math.random() > 0.7) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      newNotifications.push({
        id: `tip-${Date.now()}`,
        type: 'tip',
        title: randomTip.title,
        message: randomTip.message,
        icon: randomTip.icon,
        color: randomTip.color,
        bgColor: randomTip.bgColor,
        timestamp: new Date(),
        read: false
      });
    }

    setNotifications(prev => [...prev, ...newNotifications]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
            <p className="text-gray-600 text-sm">Stay on track with your wellness journey</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.moodReminders}
                  onChange={(e) => setSettings(prev => ({ ...prev, moodReminders: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Mood logging reminders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.achievementAlerts}
                  onChange={(e) => setSettings(prev => ({ ...prev, achievementAlerts: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Achievement alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.weeklySummary}
                  onChange={(e) => setSettings(prev => ({ ...prev, weeklySummary: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Weekly summaries</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.insights}
                  onChange={(e) => setSettings(prev => ({ ...prev, insights: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Wellness tips</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm">We'll notify you about important updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unreadCount > 0 && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          )}

          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                      <div className={notification.color}>
                        {notification.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${notification.color}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {notification.action && (
                      <button
                        onClick={notification.action}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Action
                      </button>
                    )}
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Notifications;
