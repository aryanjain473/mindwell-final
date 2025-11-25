import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Download, 
  Search,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ActivityData {
  date: string;
  mood: number;
  notes: string;
  activities: string[];
  createdAt: string;
}

interface ActivityTimelineProps {
  activities: ActivityData[];
  onExport: () => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, onExport }) => {
  const [filters, setFilters] = useState({
    moodRange: { min: 1, max: 10 },
    searchTerm: '',
    selectedActivities: [] as string[],
    dateRange: { start: '', end: '' }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'mood'>('date');

  const allActivities = useMemo(() => {
    const uniqueActivities = new Set<string>();
    activities.forEach(activity => {
      activity.activities.forEach(act => uniqueActivities.add(act));
    });
    return Array.from(uniqueActivities);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities
      .filter(activity => {
        // Mood range filter
        if (activity.mood < filters.moodRange.min || activity.mood > filters.moodRange.max) {
          return false;
        }

        // Search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesSearch = 
            activity.notes.toLowerCase().includes(searchLower) ||
            activity.activities.some(act => act.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }

        // Activity filter
        if (filters.selectedActivities.length > 0) {
          const hasSelectedActivity = activity.activities.some(act => 
            filters.selectedActivities.includes(act)
          );
          if (!hasSelectedActivity) return false;
        }

        // Date range filter
        if (filters.dateRange.start && filters.dateRange.end) {
          const activityDate = new Date(activity.date);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          if (activityDate < startDate || activityDate > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return b.mood - a.mood;
        }
      });
  }, [activities, filters, sortBy]);

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return '😄';
    if (mood >= 7) return '😊';
    if (mood >= 5) return '😐';
    if (mood >= 3) return '😔';
    return '😞';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600 bg-green-100';
    if (mood >= 6) return 'text-yellow-600 bg-yellow-100';
    if (mood >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const clearFilters = () => {
    setFilters({
      moodRange: { min: 1, max: 10 },
      searchTerm: '',
      selectedActivities: [],
      dateRange: { start: '', end: '' }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-teal-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Activity Timeline</h3>
            <span className="ml-3 px-2 py-1 bg-teal-100 text-teal-600 text-sm rounded-full">
              {filteredActivities.length} entries
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </motion.button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'mood')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="date">Date (Newest First)</option>
            <option value="mood">Mood (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-gray-50 border-b border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search notes or activities..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Mood Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.moodRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      moodRange: { ...prev.moodRange, min: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.moodRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      moodRange: { ...prev.moodRange, max: parseInt(e.target.value) || 10 }
                    }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Activities Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities
                </label>
                <select
                  multiple
                  value={filters.selectedActivities}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, selectedActivities: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  size={3}
                >
                  {allActivities.map(activity => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No activities found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or log your first mood!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={`${activity.date}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{getMoodEmoji(activity.mood)}</span>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMoodColor(activity.mood)}`}>
                          {activity.mood}/10
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {activity.notes && (
                      <p className="text-gray-700 mb-3 italic">"{activity.notes}"</p>
                    )}
                    
                    {activity.activities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activity.activities.map((act, actIndex) => (
                          <span
                            key={actIndex}
                            className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityTimeline;
