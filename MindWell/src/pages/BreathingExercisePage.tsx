import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const BreathingExercisePage = () => {
  const navigate = useNavigate();

  const breathingGames = [
    {
      id: 'heart-calm',
      title: 'Heart Calm',
      description: 'Train slow rhythmic breathing for relaxation and heart rate balance',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-red-50 to-pink-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      duration: '5 min',
      difficulty: 'Easy'
    },
    {
      id: 'anulom-vilom',
      title: 'Anulom-Vilom',
      description: 'Practice alternate-nostril breathing for balance and inner focus',
      icon: <Wind className="h-8 w-8" />,
      color: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-600',
      duration: '10 min',
      difficulty: 'Advanced'
    },
    {
      id: 'lotus-bloom',
      title: 'Lotus Bloom',
      description: 'The lotus opens as you maintain steady breathing and focus',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      duration: '7 min',
      difficulty: 'Medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Breathing Exercises</h1>
              <p className="text-sm text-gray-600">Choose a breathing technique to practice</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Wind className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Why Breathing Exercises?</h3>
              <p className="text-sm text-gray-700">
                Breathing exercises can help reduce stress, improve focus, and promote relaxation. 
                Regular practice can enhance your overall mental wellness and emotional regulation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Breathing Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breathingGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/wellness-games/${game.id}`)}
              className={`bg-gradient-to-br ${game.color} rounded-xl p-6 border-2 ${game.borderColor} hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white rounded-lg ${game.textColor}`}>
                  {game.icon}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  game.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {game.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{game.duration}</span>
                <span className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Start →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercisePage;

