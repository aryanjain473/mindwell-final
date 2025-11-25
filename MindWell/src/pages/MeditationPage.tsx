import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Flame, Flower2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MeditationPage = () => {
  const navigate = useNavigate();

  const meditationGames = [
    {
      id: 'candle-focus',
      title: 'Candle Focus',
      description: 'Train sustained attention and stillness through meditative focus',
      icon: <Flame className="h-8 w-8" />,
      color: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      duration: '10 min',
      difficulty: 'Medium'
    },
    {
      id: 'lotus-bloom',
      title: 'Lotus Bloom',
      description: 'The lotus opens as you maintain steady breathing and focus',
      icon: <Flower2 className="h-8 w-8" />,
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
              <h1 className="text-2xl font-bold text-gray-900">Meditation</h1>
              <p className="text-sm text-gray-600">Guided mindfulness sessions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Target className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Benefits of Meditation</h3>
              <p className="text-sm text-gray-700">
                Regular meditation practice can improve focus, reduce anxiety, enhance emotional well-being, 
                and promote a sense of inner peace. Start with just a few minutes daily.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Meditation Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meditationGames.map((game, index) => (
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
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
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

export default MeditationPage;

