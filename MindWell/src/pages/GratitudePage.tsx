import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const GratitudePage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-gray-900">Gratitude Practice</h1>
              <p className="text-sm text-gray-600">Express gratitude through daily reflections</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Why Practice Gratitude?</h3>
              <p className="text-sm text-gray-700">
                Regular gratitude practice can improve mood, increase happiness, reduce stress, 
                and enhance overall well-being. Taking time to appreciate the positive aspects 
                of your life can shift your perspective and improve mental health.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gratitude Game Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/wellness-games/gratitude-wheel')}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-full">
              <Sparkles className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Gratitude Wheel</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Express gratitude daily through micro reflections. Spin the wheel and reflect on 
            different aspects of your life that you're grateful for.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="text-sm text-gray-500">⏱️ 3 min</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Easy
            </span>
          </div>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Start Gratitude Practice →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GratitudePage;

