import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  CheckCircle,
  Wind,
  BookOpen,
  Target,
  Star,
  Moon,
  Camera,
  Zap
} from 'lucide-react';

interface MobileMoodLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moodData: any) => void;
}

const MobileMoodLogger: React.FC<MobileMoodLoggerProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedMood, setSelectedMood] = useState<'sad' | 'normal' | 'happy'>('normal');
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const moodOptions = [
    { value: 'sad', label: 'Sad', icon: Frown, color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'normal', label: 'Normal', icon: Meh, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-600', bgColor: 'bg-green-100' }
  ];

  const activityOptions = [
    { id: 'meditation', label: 'Meditation', icon: Wind, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'exercise', label: 'Exercise', icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { id: 'gratitude', label: 'Gratitude', icon: Star, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'photo', label: 'Mood Photo', icon: Camera, color: 'text-teal-600', bgColor: 'bg-teal-100' }
  ];

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSave = () => {
    onSave({
      mood: selectedMood,
      notes,
      activities: selectedActivities
    });
    setSelectedMood('normal');
    setNotes('');
    setSelectedActivities([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg mr-3">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Log Your Mood</h3>
                  <p className="text-sm text-gray-600">How are you feeling today?</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Mood Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">How are you feeling?</h4>
              <div className="grid grid-cols-3 gap-3">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === mood.value
                        ? `${mood.bgColor} ${mood.color} border-current`
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <mood.icon className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">What did you do today?</h4>
              <div className="grid grid-cols-2 gap-3">
                {activityOptions.map((activity) => (
                  <motion.button
                    key={activity.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleActivityToggle(activity.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedActivities.includes(activity.id)
                        ? `${activity.bgColor} ${activity.color} border-current`
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <activity.icon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">{activity.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add a note (optional)</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your day? What made you feel this way?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-2xl sm:rounded-b-2xl">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Mood
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileMoodLogger;
