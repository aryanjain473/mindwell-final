import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const SleepTrackerPage = () => {
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
              <h1 className="text-2xl font-bold text-gray-900">Sleep & Relaxation</h1>
              <p className="text-sm text-gray-600">Improve your sleep quality with guided exercises</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Moon className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Better Sleep Starts Here</h3>
              <p className="text-sm text-gray-700">
                Quality sleep is essential for mental wellness. Guided breathing exercises before 
                bedtime can help calm your mind, reduce stress, and prepare your body for restful sleep.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dream Waves Game Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/wellness-games/dream-waves')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-200 hover:shadow-lg transition-all cursor-pointer text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-full">
              <Moon className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dream Waves</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Guided slow breathing waves before bedtime for better sleep. Follow the gentle 
            rhythm of the waves to relax your mind and body, preparing you for a restful night.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="text-sm text-gray-500">⏱️ 8 min</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Easy
            </span>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Start Sleep Exercise →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SleepTrackerPage;

