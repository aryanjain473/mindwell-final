import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Bot, 
  User, 
  Clock, 
  ArrowRight, 
  Heart,
  Brain,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'ai';
  mood?: number;
  category?: 'general' | 'mood' | 'advice' | 'journal' | 'crisis';
}

interface RecentChatHistoryProps {
  userId: string;
}

const RecentChatHistory: React.FC<RecentChatHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryIcons = {
    general: <MessageCircle className="h-4 w-4" />,
    mood: <Heart className="h-4 w-4" />,
    advice: <Lightbulb className="h-4 w-4" />,
    journal: <Brain className="h-4 w-4" />,
    crisis: <Heart className="h-4 w-4" />
  };

  const categoryColors = {
    general: 'text-blue-600 bg-blue-100',
    mood: 'text-pink-600 bg-pink-100',
    advice: 'text-yellow-600 bg-yellow-100',
    journal: 'text-purple-600 bg-purple-100',
    crisis: 'text-red-600 bg-red-100'
  };

  useEffect(() => {
    fetchRecentChats();
  }, [userId]);

  const fetchRecentChats = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockChats: ChatMessage[] = [
        {
          id: '1',
          content: 'I\'ve been feeling really anxious lately. Can you help me with some breathing exercises?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          type: 'user',
          mood: 3,
          category: 'mood'
        },
        {
          id: '2',
          content: 'I\'d be happy to help you with breathing exercises! Let\'s try the 4-7-8 technique: Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000).toISOString(),
          type: 'ai',
          category: 'advice'
        },
        {
          id: '3',
          content: 'I want to start journaling but I don\'t know where to begin. Any tips?',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          type: 'user',
          mood: 5,
          category: 'journal'
        },
        {
          id: '4',
          content: 'Great question! Start with just 5 minutes a day. Write about your feelings, what you\'re grateful for, or what happened today. There\'s no right or wrong way to journal.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 1000).toISOString(),
          type: 'ai',
          category: 'advice'
        },
        {
          id: '5',
          content: 'I had a really good day today! I went for a walk and felt much better.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          type: 'user',
          mood: 8,
          category: 'general'
        }
      ];
      setRecentChats(mockChats.slice(0, 3)); // Show only last 3 conversations
    } catch (error) {
      console.error('Error fetching recent chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return '';
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  const getMoodColor = (mood?: number) => {
    if (!mood) return 'text-gray-500';
    if (mood >= 8) return 'text-green-500';
    if (mood >= 6) return 'text-blue-500';
    if (mood >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Recent AI Chats</h3>
            <p className="text-gray-600 text-sm">Your latest conversations with our AI companion</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Continue Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="space-y-4">
        {recentChats.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No recent chats</h4>
            <p className="text-gray-600 mb-4">Start a conversation with our AI companion to get personalized support.</p>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Chatting
            </button>
          </div>
        ) : (
          recentChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {chat.type === 'user' ? (
                    <User className="h-4 w-4 text-blue-600 mr-2" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-600 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {chat.type === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  {chat.mood && (
                    <span className={`ml-2 text-sm ${getMoodColor(chat.mood)}`}>
                      {getMoodEmoji(chat.mood)}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(chat.timestamp)}
                </div>
              </div>
              
              <p className="text-gray-800 text-sm mb-2 line-clamp-2">
                {chat.content}
              </p>
              
              {chat.category && (
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[chat.category]}`}>
                    {categoryIcons[chat.category]}
                    {chat.category.charAt(0).toUpperCase() + chat.category.slice(1)}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">Write Journal</span>
        </button>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center">
          <Lightbulb className="h-4 w-4 text-blue-500 mr-2" />
          <p className="text-sm text-gray-700">
            <strong>Remember:</strong> Our AI is here to support you 24/7. 
            Don't hesitate to reach out whenever you need someone to talk to.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentChatHistory;

