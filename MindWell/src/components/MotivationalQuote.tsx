import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw, Heart, Sun, Moon } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  category: 'motivation' | 'wellness' | 'mindfulness' | 'gratitude';
  emoji: string;
}

const MotivationalQuote: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const quotes: QuoteData[] = [
    {
      text: "Every small step towards mental wellness is a victory worth celebrating.",
      author: "MindWell Team",
      category: "wellness",
      emoji: "🌟"
    },
    {
      text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
      author: "Unknown",
      category: "wellness",
      emoji: "💚"
    },
    {
      text: "The present moment is the only time over which we have dominion.",
      author: "Thich Nhat Hanh",
      category: "mindfulness",
      emoji: "🧘"
    },
    {
      text: "Gratitude turns what we have into enough.",
      author: "Anonymous",
      category: "gratitude",
      emoji: "🙏"
    },
    {
      text: "You are stronger than you know, braver than you believe, and more capable than you imagine.",
      author: "A.A. Milne",
      category: "motivation",
      emoji: "💪"
    },
    {
      text: "Healing is not linear. It's okay to have setbacks. What matters is that you keep moving forward.",
      author: "Unknown",
      category: "wellness",
      emoji: "🦋"
    },
    {
      text: "The mind is everything. What you think you become.",
      author: "Buddha",
      category: "mindfulness",
      emoji: "🧠"
    },
    {
      text: "Self-care is not selfish. You cannot serve from an empty vessel.",
      author: "Eleanor Brownn",
      category: "wellness",
      emoji: "🕯️"
    },
    {
      text: "Progress, not perfection, is the goal.",
      author: "Unknown",
      category: "motivation",
      emoji: "📈"
    },
    {
      text: "The only way out is through.",
      author: "Robert Frost",
      category: "motivation",
      emoji: "🚪"
    }
  ];

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: "Good morning", emoji: "🌅" };
    if (hour < 17) return { greeting: "Good afternoon", emoji: "☀️" };
    if (hour < 20) return { greeting: "Good evening", emoji: "🌆" };
    return { greeting: "Good night", emoji: "🌙" };
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const refreshQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { greeting, emoji } = getTimeBasedGreeting();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg border border-indigo-200 mb-8"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-indigo-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-indigo-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg border border-indigo-200 mb-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-500 rounded-lg mr-3">
            <Quote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">
              {greeting}, Aryan! {emoji}
            </h3>
            <p className="text-sm text-indigo-600">Here's your daily wellness inspiration</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={refreshQuote}
          className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote?.text}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <blockquote className="text-lg text-gray-800 italic leading-relaxed mb-4">
            "{currentQuote?.text}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm text-indigo-600 font-medium">
              — {currentQuote?.author}
            </cite>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{currentQuote?.emoji}</span>
              <span className="text-xs text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full">
                {currentQuote?.category}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Wellness Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg border border-indigo-200"
      >
        <div className="flex items-center mb-2">
          <Heart className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm font-medium text-indigo-800">Today's Wellness Tip</span>
        </div>
        <p className="text-sm text-indigo-700">
          Take 5 deep breaths before checking your phone in the morning. 
          Start your day with intention, not reaction.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MotivationalQuote;
