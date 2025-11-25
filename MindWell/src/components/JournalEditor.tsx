import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Calendar, 
  Tag, 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  Wind, 
  CloudFog, 
  Zap,
  Heart,
  Target,
  Lightbulb,
  Smile
} from 'lucide-react';

interface JournalEditorProps {
  journal?: any;
  onSave: (journalData: any) => void;
  onClose: () => void;
  weatherIcons: any;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ 
  journal, 
  onSave, 
  onClose, 
  weatherIcons 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 5,
    tags: [] as string[],
    weather: 'sunny',
    activities: [] as string[],
    gratitude: [] as string[],
    goals: [] as string[],
    reflection: '',
    isPrivate: true
  });

  const [newTag, setNewTag] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const activityOptions = [
    'work', 'exercise', 'social', 'hobby', 'rest', 'travel', 'learning', 
    'family', 'friends', 'self-care', 'cooking', 'reading', 'music', 
    'art', 'sports', 'nature', 'shopping', 'cleaning', 'gaming', 
    'watching', 'other'
  ];

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'rainy', label: 'Rainy', icon: CloudRain },
    { value: 'snowy', label: 'Snowy', icon: Snowflake },
    { value: 'windy', label: 'Windy', icon: Wind },
    { value: 'foggy', label: 'Foggy', icon: CloudFog },
    { value: 'stormy', label: 'Stormy', icon: Zap }
  ];

  useEffect(() => {
    if (journal) {
      setFormData({
        title: journal.title || '',
        content: journal.content || '',
        mood: journal.mood || 5,
        tags: journal.tags || [],
        weather: journal.weather || 'sunny',
        activities: journal.activities || [],
        gratitude: journal.gratitude || [],
        goals: journal.goals || [],
        reflection: journal.reflection || '',
        isPrivate: journal.isPrivate !== undefined ? journal.isPrivate : true
      });
    } else {
      // Set default title for new entries
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        title: `Journal Entry - ${today.toLocaleDateString()}`
      }));
    }
  }, [journal]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddGratitude = () => {
    if (newGratitude.trim() && !formData.gratitude.includes(newGratitude.trim())) {
      setFormData(prev => ({
        ...prev,
        gratitude: [...prev.gratitude, newGratitude.trim()]
      }));
      setNewGratitude('');
    }
  };

  const handleRemoveGratitude = (gratitudeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      gratitude: prev.gratitude.filter(gratitude => gratitude !== gratitudeToRemove)
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal !== goalToRemove)
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {journal ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What's the theme of your day?"
                  required
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling? {getMoodEmoji(formData.mood)}
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">😢</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.mood}
                    onChange={(e) => handleInputChange('mood', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">🤩</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {formData.mood}/10
                  </span>
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather
                </label>
                <div className="flex flex-wrap gap-2">
                  {weatherOptions.map((weather) => {
                    const IconComponent = weather.icon;
                    return (
                      <button
                        key={weather.value}
                        type="button"
                        onClick={() => handleInputChange('weather', weather.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          formData.weather === weather.value
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        {weather.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities Today
                </label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => handleActivityToggle(activity)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.activities.includes(activity)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What happened today?
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={6}
                  placeholder="Write about your day, thoughts, experiences..."
                  required
                />
              </div>

              {/* Gratitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  What are you grateful for today?
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGratitude())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add something you're grateful for..."
                  />
                  <button
                    type="button"
                    onClick={handleAddGratitude}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.gratitude.map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveGratitude(item)}
                        className="ml-1 hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Goals for tomorrow
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="What do you want to achieve tomorrow?"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.goals.map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(item)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Reflection
                </label>
                <textarea
                  value={formData.reflection}
                  onChange={(e) => handleInputChange('reflection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="What did you learn today? Any insights or realizations?"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add tags to categorize your entry..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  Keep this entry private
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                {journal ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JournalEditor;
