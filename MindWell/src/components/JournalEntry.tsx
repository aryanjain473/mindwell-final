import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag, 
  Heart, 
  Target, 
  Lightbulb,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

interface JournalEntryProps {
  journal: {
    _id: string;
    title: string;
    content: string;
    mood: number;
    tags: string[];
    weather: string;
    activities: string[];
    gratitude: string[];
    goals: string[];
    reflection: string;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (journal: any) => void;
  onDelete: (id: string) => void;
  weatherIcons: any;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ 
  journal, 
  onEdit, 
  onDelete, 
  weatherIcons 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return '🤩';
    if (mood >= 8) return '😁';
    if (mood >= 7) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 5) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 3) return '😔';
    if (mood >= 2) return '😞';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600 bg-green-100';
    if (mood >= 6) return 'text-blue-600 bg-blue-100';
    if (mood >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const WeatherIcon = weatherIcons[journal.weather] || weatherIcons.sunny;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {journal.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(journal.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(journal.createdAt)}
              </div>
              {journal.isPrivate && (
                <div className="flex items-center gap-1 text-gray-500">
                  <EyeOff className="h-4 w-4" />
                  Private
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(journal)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(journal._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mood and Weather */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(journal.mood)}`}>
            <span className="text-lg">{getMoodEmoji(journal.mood)}</span>
            <span>{journal.mood}/10</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <WeatherIcon className="h-5 w-5" />
            <span className="capitalize">{journal.weather}</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {isExpanded ? journal.content : `${journal.content.substring(0, 200)}${journal.content.length > 200 ? '...' : ''}`}
          </p>
        </div>

        {journal.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Activities */}
        {journal.activities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Activities</h4>
            <div className="flex flex-wrap gap-2">
              {journal.activities.map((activity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gratitude */}
        {journal.gratitude.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              Gratitude
            </h4>
            <div className="space-y-1">
              {journal.gratitude.map((item, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {journal.goals.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-500" />
              Goals
            </h4>
            <div className="space-y-1">
              {journal.goals.map((item, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflection */}
        {journal.reflection && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Reflection
            </h4>
            <p className="text-sm text-gray-600 italic">"{journal.reflection}"</p>
          </div>
        )}

        {/* Tags */}
        {journal.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="h-4 w-4 text-green-500" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {journal.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JournalEntry;
