import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Heart, 
  Wind, 
  Target,
  Calendar,
  Settings,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({ 
  children, 
  currentPage = 'dashboard' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const quickActions = [
    { id: 'mood', label: 'Log Mood', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'breathing', label: 'Breathing', icon: Wind, color: 'text-teal-600', bgColor: 'bg-teal-100' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'journal', label: 'Journal', icon: BookOpen, href: '/journal' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <Heart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MindWell</h1>
                <p className="text-xs text-gray-500">Wellness Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 max-w-sm h-full bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                    <Heart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">MindWell</h2>
                    <p className="text-gray-600 text-sm">Your wellness companion</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Quick Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="px-4 py-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-lg font-medium"
          >
            Quick Actions
            {showQuickActions ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200"
            >
              <div className="grid grid-cols-2 gap-3 p-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center p-3 rounded-lg ${action.bgColor} ${action.color} border border-gray-200`}
                  >
                    <action.icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;