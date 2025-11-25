import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Flower2, 
  Sparkles, 
  Wind, 
  Flame, 
  Cloud, 
  Moon, 
  Leaf,
  ArrowLeft,
  TrendingUp,
  Clock,
  Music
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  category: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

const WellnessGamesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameStats, setGameStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchGameStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/wellness-games/stats');
      if (response.data.success) {
        setGameStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
      // Set empty stats if API fails - page should still render
      setGameStats({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameStats();
    
    // Refresh stats when page becomes visible (user returns from a game)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGameStats();
      }
    };
    
    // Refresh stats when window gains focus
    const handleFocus = () => {
      fetchGameStats();
    };
    
    // Refresh stats when a game session is saved
    const handleSessionSaved = () => {
      fetchGameStats();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('wellness-game-session-saved', handleSessionSaved);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('wellness-game-session-saved', handleSessionSaved);
    };
  }, []);

  const games: Game[] = [
    {
      id: 'music-listening',
      title: 'Music & Sound Therapy',
      description: 'Relax with calming sounds - rain, ocean, forest, and more',
      icon: <Music className="h-8 w-8" />,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      category: 'Relaxation & Sound Therapy',
      duration: 'Custom',
      difficulty: 'Easy'
    },
    {
      id: 'heart-calm',
      title: 'Heart Calm',
      description: 'Train slow rhythmic breathing for relaxation and heart rate balance',
      icon: <Heart className="h-8 w-8" />,
      color: 'text-red-600',
      bgGradient: 'from-red-50 to-pink-50',
      category: 'Breathing & Heart-Mind Sync',
      duration: '5 min',
      difficulty: 'Easy'
    },
    {
      id: 'gratitude-wheel',
      title: 'Gratitude Wheel',
      description: 'Express gratitude daily through micro reflections',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'text-yellow-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      category: 'Emotion Regulation',
      duration: '3 min',
      difficulty: 'Easy'
    },
    {
      id: 'lotus-bloom',
      title: 'Lotus Bloom',
      description: 'The lotus opens as you maintain steady breathing and focus',
      icon: <Flower2 className="h-8 w-8" />,
      color: 'text-purple-600',
      bgGradient: 'from-purple-50 to-pink-50',
      category: 'Breathing & Mindfulness',
      duration: '7 min',
      difficulty: 'Medium'
    },
    {
      id: 'candle-focus',
      title: 'Candle Focus',
      description: 'Train sustained attention and stillness through meditative focus',
      icon: <Flame className="h-8 w-8" />,
      color: 'text-orange-600',
      bgGradient: 'from-orange-50 to-amber-50',
      category: 'Mindfulness & Attention',
      duration: '10 min',
      difficulty: 'Medium'
    },
    {
      id: 'thought-cloud',
      title: 'Thought Cloud',
      description: 'Identify and release negative thought bubbles for cognitive cleansing',
      icon: <Cloud className="h-8 w-8" />,
      color: 'text-blue-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      category: 'Emotional Regulation',
      duration: '5 min',
      difficulty: 'Easy'
    },
    {
      id: 'dream-waves',
      title: 'Dream Waves',
      description: 'Guided slow breathing waves before bedtime for better sleep',
      icon: <Moon className="h-8 w-8" />,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      category: 'Sleep & Relaxation',
      duration: '8 min',
      difficulty: 'Easy'
    },
    {
      id: 'anulom-vilom',
      title: 'Anulom-Vilom',
      description: 'Practice alternate-nostril breathing for balance and inner focus',
      icon: <Wind className="h-8 w-8" />,
      color: 'text-teal-600',
      bgGradient: 'from-teal-50 to-cyan-50',
      category: 'Yogic & Cultural',
      duration: '10 min',
      difficulty: 'Advanced'
    }
  ];

  const getGameStats = (gameId: string) => {
    return gameStats[gameId] || { sessions: 0, lastPlayed: null, bestScore: 0 };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wellness games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Games</h1>
                <p className="text-sm text-gray-600">Engage with interactive wellness activities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-xl font-bold text-gray-900">
                  {Object.values(gameStats).reduce((sum: number, stat: any) => sum + (stat.sessions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-xl font-bold text-gray-900">
                  {Object.values(gameStats).filter((stat: any) => {
                    if (!stat.lastPlayed) return false;
                    const lastPlayed = new Date(stat.lastPlayed);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return lastPlayed > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Games Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {Object.values(gameStats).filter((stat: any) => stat.sessions > 0).length} / {games.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => {
            const stats = getGameStats(game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/wellness-games/${game.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${game.bgGradient} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-white rounded-lg ${game.color}`}>
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
                  <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{game.duration}</span>
                    </span>
                    <span>{game.category}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600">Sessions</p>
                      <p className="font-semibold text-gray-900">{stats.sessions || 0}</p>
                    </div>
                    {stats.bestScore > 0 && (
                      <div>
                        <p className="text-gray-600">Best Score</p>
                        <p className="font-semibold text-gray-900">{stats.bestScore}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WellnessGamesPage;

