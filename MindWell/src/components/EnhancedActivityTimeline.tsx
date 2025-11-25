import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Clock, 
  Heart,
  Activity,
  BookOpen,
  Wind,
  Target,
  Star,
  Moon,
  Camera,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface ActivityData {
  id: string;
  date: string;
  mood: number;
  notes: string;
  activities: string[];
  createdAt: string;
  duration?: number;
  tags?: string[];
}

interface EnhancedActivityTimelineProps {
  activities: ActivityData[];
  onExport: () => void;
}

const EnhancedActivityTimeline: React.FC<EnhancedActivityTimelineProps> = ({
  activities,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mood' | 'meditation' | 'journal' | 'breathing' | 'gratitude' | 'sleep'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'mood' | 'activity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activityIcons: { [key: string]: React.ReactNode } = {
    'Mood Check-in': <Heart className="h-4 w-4" />,
    'Meditation': <Target className="h-4 w-4" />,
    'Journal': <BookOpen className="h-4 w-4" />,
    'Breathing Exercise': <Wind className="h-4 w-4" />,
    'Gratitude Practice': <Star className="h-4 w-4" />,
    'Sleep Tracker': <Moon className="h-4 w-4" />,
    'Mood Photo': <Camera className="h-4 w-4" />,
    'Goal Setting': <TrendingUp className="h-4 w-4" />,
    'Deep Breathing': <Wind className="h-4 w-4" />,
    'Music Therapy': <Activity className="h-4 w-4" />,
    'Yoga': <Target className="h-4 w-4" />,
    'Social Connection': <Heart className="h-4 w-4" />,
    'Learning': <BookOpen className="h-4 w-4" />
  };

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activities.some(act => act.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Activity type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity =>
        activity.activities.some(act => {
          switch (selectedFilter) {
            case 'mood': return act.includes('Mood');
            case 'meditation': return act.includes('Meditation') || act.includes('Yoga');
            case 'journal': return act.includes('Journal') || act.includes('Learning');
            case 'breathing': return act.includes('Breathing');
            case 'gratitude': return act.includes('Gratitude');
            case 'sleep': return act.includes('Sleep');
            default: return true;
          }
        })
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'mood':
          comparison = a.mood - b.mood;
          break;
        case 'activity':
          comparison = a.activities.length - b.activities.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [activities, searchTerm, selectedFilter, sortBy, sortOrder]);

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😞';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 7) return 'text-green-600 bg-green-100';
    if (mood >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('date');
    setSortOrder('desc');
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
          <div className="p-3 bg-teal-100 rounded-xl mr-4">
            <Calendar className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Activity Timeline</h3>
            <p className="text-gray-600 text-sm">Your wellness journey history</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </button>
          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Activity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Activities</option>
                  <option value="mood">Mood Logs</option>
                  <option value="meditation">Meditation</option>
                  <option value="journal">Journal</option>
                  <option value="breathing">Breathing</option>
                  <option value="gratitude">Gratitude</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="mood">Mood</option>
                  <option value="activity">Activity Count</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedActivities.length} of {activities.length} activities
        </div>
        {(searchTerm || selectedFilter !== 'all') && (
          <div className="text-sm text-teal-600">
            Filters applied
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredAndSortedActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No activities found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start logging your wellness activities'
                }
              </p>
            </motion.div>
          ) : (
            filteredAndSortedActivities.map((activity, index) => (
              <motion.div
                key={activity.id || activity.createdAt || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getMoodColor(activity.mood).split(' ')[1]} border-2 border-white shadow-sm`} />
                      {index < filteredAndSortedActivities.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMoodEmoji(activity.mood)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(activity.mood)}`}>
                            {activity.mood}/10
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(activity.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {activity.activities.map((act, actIndex) => (
                            <span
                              key={`${activity.id || activity.createdAt || index}-${actIndex}-${act}`}
                              className="inline-flex items-center px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 border border-gray-200"
                            >
                              {activityIcons[act] || <Activity className="h-3 w-3 mr-1" />}
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      {activity.notes && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-700 line-clamp-2">{activity.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(activity.createdAt)}</span>
                        {activity.duration && (
                          <span>{activity.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedActivity(
                      expandedActivity === activity.id ? null : activity.id
                    )}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedActivity === activity.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedActivity === activity.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Full Notes</h5>
                          <p className="text-sm text-gray-700">{activity.notes || 'No notes provided'}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Activity Details</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Created: {new Date(activity.createdAt).toLocaleString()}</div>
                            {activity.duration && <div>Duration: {activity.duration} minutes</div>}
                            <div>Activities: {activity.activities.length}</div>
                            {activity.tags && activity.tags.length > 0 && (
                              <div>
                                Tags: {activity.tags.map((tag, tagIndex) => (
                                  <span key={`${activity.id || activity.createdAt || index}-tag-${tagIndex}-${tag}`} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedActivityTimeline;
