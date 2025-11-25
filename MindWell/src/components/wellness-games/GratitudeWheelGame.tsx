import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const GratitudeWheelGame = () => {
  const navigate = useNavigate();
  const [gratitudes, setGratitudes] = useState<string[]>([]);
  const [currentGratitude, setCurrentGratitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const gratitudePrompts = [
    "What made you smile today?",
    "Who are you grateful for?",
    "What challenge did you overcome?",
    "What beauty did you notice?",
    "What skill are you thankful for?",
    "What memory brings you joy?"
  ];

  const [currentPrompt, setCurrentPrompt] = useState(0);

  const handleAddGratitude = () => {
    if (currentGratitude.trim()) {
      setGratitudes([...gratitudes, currentGratitude.trim()]);
      setCurrentGratitude('');
      setCurrentPrompt((prev) => (prev + 1) % gratitudePrompts.length);
    }
  };

  const handleRemove = (index: number) => {
    setGratitudes(gratitudes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (gratitudes.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/wellness-games/gratitude-wheel', {
        gratitudes,
        count: gratitudes.length,
        timestamp: new Date().toISOString()
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
      
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setGratitudes([]);
        setCurrentGratitude('');
      }, 2000);
    } catch (error) {
      console.error('Error saving gratitude:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Gratitude Wheel</h1>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Prompt */}
          <div className="text-center mb-8">
            <motion.div
              key={currentPrompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {gratitudePrompts[currentPrompt]}
              </h2>
            </motion.div>

            {/* Input */}
            <div className="max-w-2xl mx-auto">
              <textarea
                value={currentGratitude}
                onChange={(e) => setCurrentGratitude(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddGratitude();
                  }
                }}
                placeholder="Write what you're grateful for..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={handleAddGratitude}
                className="mt-4 flex items-center space-x-2 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Add to Wheel</span>
              </button>
            </div>
          </div>

          {/* Gratitude Wheel */}
          {gratitudes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Your Gratitude Wheel ({gratitudes.length})
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {gratitudes.map((gratitude, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="relative group"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-3 rounded-full border-2 border-yellow-300 flex items-center space-x-2 max-w-xs">
                      <span className="text-sm text-gray-800">{gratitude}</span>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          {gratitudes.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleSave}
                disabled={isSubmitting || saved}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors mx-auto ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                } disabled:opacity-50`}
              >
                {saved ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Gratitude'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Add 3-5 things you're grateful for each day</li>
            <li>• Focus on small, meaningful moments</li>
            <li>• Regular practice boosts positivity and emotional well-being</li>
            <li>• Your gratitude data helps AI generate personalized insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GratitudeWheelGame;

