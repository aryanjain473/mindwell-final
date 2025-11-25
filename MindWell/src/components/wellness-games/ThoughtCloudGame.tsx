import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, ArrowLeft, X, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

interface Thought {
  id: string;
  text: string;
  type: 'negative' | 'neutral' | 'positive';
  released: boolean;
}

const ThoughtCloudGame = () => {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [currentThought, setCurrentThought] = useState('');
  const [releasedCount, setReleasedCount] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);

  const negativeThoughts = [
    "I'm not good enough",
    "I always mess things up",
    "Nobody understands me",
    "I'm so stressed",
    "I can't do this",
    "Everything is going wrong",
    "I'm worried about tomorrow",
    "I feel anxious"
  ];

  const handleAddThought = () => {
    if (currentThought.trim()) {
      const thoughtType = detectThoughtType(currentThought);
      setThoughts([...thoughts, {
        id: Date.now().toString(),
        text: currentThought.trim(),
        type: thoughtType,
        released: false
      }]);
      setCurrentThought('');
    }
  };

  const detectThoughtType = (text: string): 'negative' | 'neutral' | 'positive' => {
    const negativeWords = ['not', "can't", "won't", 'worried', 'stressed', 'anxious', 'bad', 'wrong', 'failed'];
    const positiveWords = ['good', 'great', 'happy', 'proud', 'excited', 'grateful', 'love'];
    
    const lowerText = text.toLowerCase();
    if (negativeWords.some(word => lowerText.includes(word))) {
      return 'negative';
    }
    if (positiveWords.some(word => lowerText.includes(word))) {
      return 'positive';
    }
    return 'neutral';
  };

  const handleReleaseThought = (id: string) => {
    setThoughts(thoughts.map(thought => {
      if (thought.id === id && !thought.released) {
        if (thought.type === 'negative') {
          setReleasedCount(prev => prev + 1);
          setSessionScore(prev => prev + 10);
        }
        return { ...thought, released: true };
      }
      return thought;
    }));
  };

  const handleAddRandomNegative = () => {
    const randomThought = negativeThoughts[Math.floor(Math.random() * negativeThoughts.length)];
    setThoughts([...thoughts, {
      id: Date.now().toString(),
      text: randomThought,
      type: 'negative',
      released: false
    }]);
  };

  const handleSave = async () => {
    try {
      const negativeThoughtsCount = thoughts.filter(t => t.type === 'negative' && t.released).length;
      await api.post('/wellness-games/thought-cloud', {
        totalThoughts: thoughts.length,
        negativeThoughts: negativeThoughtsCount,
        releasedCount,
        sessionScore,
        timestamp: new Date().toISOString()
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getThoughtColor = (type: string) => {
    switch (type) {
      case 'negative': return 'bg-red-100 border-red-300 text-red-800';
      case 'positive': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Thought Cloud</h1>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Instructions */}
          <div className="text-center mb-8">
            <Cloud className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Release Negative Thoughts
            </h2>
            <p className="text-sm text-gray-600">
              Identify and release negative thoughts. Watch them float away like clouds.
            </p>
          </div>

          {/* Input Area */}
          <div className="mb-6">
            <textarea
              value={currentThought}
              onChange={(e) => setCurrentThought(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddThought();
                }
              }}
              placeholder="What's on your mind? Type a thought..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleAddThought}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Thought
              </button>
              <button
                onClick={handleAddRandomNegative}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Add Example
              </button>
            </div>
          </div>

          {/* Thought Clouds */}
          <div className="min-h-[300px] relative">
            <AnimatePresence>
              {thoughts.map((thought) => (
                <motion.div
                  key={thought.id}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={thought.released 
                    ? { opacity: 0, scale: 0, y: -100, x: Math.random() * 200 - 100 }
                    : { opacity: 1, scale: 1, y: 0 }
                  }
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute p-4 rounded-2xl border-2 ${getThoughtColor(thought.type)} shadow-lg cursor-pointer ${
                    thought.released ? 'pointer-events-none' : ''
                  }`}
                  style={{
                    left: `${Math.random() * 70}%`,
                    top: `${Math.random() * 60 + 20}%`,
                    maxWidth: '200px'
                  }}
                  onClick={() => !thought.released && handleReleaseThought(thought.id)}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{thought.text}</p>
                    {!thought.released && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReleaseThought(thought.id);
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {thought.released && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2 text-green-600"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {thoughts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Cloud className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No thoughts yet. Add a thought to begin.</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{releasedCount}</div>
              <div className="text-sm text-gray-600">Released</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{thoughts.length}</div>
              <div className="text-sm text-gray-600">Total Thoughts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{sessionScore}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          {/* Save Button */}
          {thoughts.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Sparkles className="h-5 w-5" />
                <span>Save Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Write down thoughts that are bothering you</li>
            <li>• Click on negative thoughts to release them</li>
            <li>• Watch them float away like clouds in the sky</li>
            <li>• This practice helps with cognitive cleansing and emotional regulation</li>
            <li>• Regular practice reduces negative thought patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThoughtCloudGame;

