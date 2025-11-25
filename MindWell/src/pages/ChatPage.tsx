import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  MessageCircle, 
  History, 
  Settings,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

interface ChatSession {
  session_id: string;
  created_at: string;
  summary?: string;
  risk_level?: string;
  message_count?: number;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's chat sessions
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/chatbot/sessions');

      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setError(error.response?.data?.message || 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">MindCare AI</h1>
                  <p className="text-sm text-gray-500">Your mental health companion</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Chat History
                </h2>
                <button
                  onClick={fetchSessions}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchSessions}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No chat sessions yet</p>
                  <p className="text-sm text-gray-400">
                    Start a conversation to see your history here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const rawId = (session as any)?.session_id || (session as any)?.sessionId || (session as any)?._id || '';
                    const idLabel = typeof rawId === 'string' ? rawId : String(rawId ?? '');
                    const createdAt = (session as any)?.created_at || (session as any)?.createdAt || '';
                    const hasDate = typeof createdAt === 'string' && createdAt.length > 0;
                    const messageCount = (session as any)?.message_count ?? (session as any)?.messageCount;
                    const riskLevel = (session as any)?.risk_level ?? (session as any)?.riskLevel;
                    return (
                    <motion.div
                      key={idLabel || Math.random().toString(36)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {idLabel ? `Session ${idLabel.slice(0, 8)}...` : 'Session'}
                          </p>
                          {hasDate && (
                            <p className="text-xs text-gray-500">
                              {formatDate(createdAt)}
                            </p>
                          )}
                        </div>
                        {riskLevel && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}
                          >
                            {riskLevel}
                          </span>
                        )}
                      </div>
                      
                      {session.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                      
                      {typeof messageCount === 'number' && (
                        <p className="text-xs text-gray-400 mt-2">
                          {messageCount} messages
                        </p>
                      )}
                    </motion.div>
                  );})}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">New Conversation</h3>
                    <p className="text-sm text-gray-500">
                      Start a new chat session with MindCare AI
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ready to Chat?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    I'm here to listen and provide support. Click the chat button to start a conversation.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>24/7 Available</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Confidential & Secure</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>AI-Powered Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
