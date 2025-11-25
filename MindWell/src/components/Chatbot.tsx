import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  MessageCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  risk?: 'low' | 'medium' | 'high';
  emotion?: any;
  facialEmotion?: any;
  recommendations?: Recommendation[];
}

interface Recommendation {
  type: 'activity' | 'resource' | 'exercise' | 'content' | 'video' | 'blog';
  title: string;
  description: string;
  url?: string;  // For YouTube videos and blog links
  priority: number;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  facialEmotion?: {
    emotion: string;
    confidence: number;
    mood: number;
  } | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, className = '', facialEmotion }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [sessionDecision, setSessionDecision] = useState<string | null>(null);
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Email summary options
  const [showStartOptions, setShowStartOptions] = useState(false);
  const [emailForSummary, setEmailForSummary] = useState<string>(user?.email || '');
  const [consentEmailSummary, setConsentEmailSummary] = useState<boolean>(false);
  // Store current facial emotion for sending with messages
  const [currentFacialEmotion, setCurrentFacialEmotion] = useState<{
    emotion: string;
    confidence: number;
    mood: number;
  } | null>(facialEmotion || null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update current facial emotion when prop changes
  useEffect(() => {
    if (facialEmotion) {
      setCurrentFacialEmotion(facialEmotion);
    }
  }, [facialEmotion]);

  // Start a new chat session
  const startSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/chatbot/session/start', {
        email: consentEmailSummary && emailForSummary ? emailForSummary : undefined,
        consentEmail: consentEmailSummary
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setIsSessionActive(true);
        
        // Add the initial message from the AI
        const initialMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data.initialMessage,
          timestamp: new Date()
        };
        setMessages([initialMessage]);
        setShowStartOptions(false);
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      setError(error.response?.data?.message || 'Failed to start chat session');
    } finally {
      setIsLoading(false);
    }
  };

  // Render summary with light formatting for headings
  const renderSummary = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <p key={idx} className="mt-3 text-sm font-semibold text-teal-800">
                {trimmed.replace(/^###\s+/, '')}
              </p>
            );
          }
          if (/^\*\*.+\*\*$/.test(trimmed)) {
            return (
              <p key={idx} className="text-sm font-semibold text-teal-900">
                {trimmed.replace(/\*\*/g, '')}
              </p>
            );
          }
          return (
            <p key={idx} className="text-sm text-teal-900">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  // Send a message to the chatbot
  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Support exit command to finish the session
      const isExit = ['exit', '/exit', 'quit', '/quit', 'end', '/end'].includes(
        userMessage.content.trim().toLowerCase()
      );

      // Prepare request body with optional facial emotion
      const requestBody: any = {
        sessionId,
        message: userMessage.content,
        finished: isExit
      };

      // Include facial emotion if available
      if (currentFacialEmotion && currentFacialEmotion.emotion) {
        requestBody.facialEmotion = {
          emotion: currentFacialEmotion.emotion,
          confidence: currentFacialEmotion.confidence,
          mood: currentFacialEmotion.mood
        };
        // Clear facial emotion after sending (user can detect again if needed)
        setCurrentFacialEmotion(null);
      }

      const response = await api.post('/chatbot/session/respond', requestBody);

      if (response.data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.assistantReply,
          timestamp: new Date(),
          risk: response.data.risk,
          emotion: response.data.emotion,
          facialEmotion: response.data.facialEmotion,
          recommendations: response.data.recommendations || []
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Update current recommendations
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          setCurrentRecommendations(response.data.recommendations);
        }

        // Check if session is finished
        if (response.data.sessionFinished) {
          setIsSessionActive(false);
          setSessionDecision(response.data.decisionType || null);
          // Handle session summary if needed
          if (response.data.summary) {
            setSessionSummary(response.data.summary);
          }
          // Inline toast for email delivery status
          if (response.data.emailAttempted) {
            const delivered = response.data.emailSent;
            const systemMsg: Message = {
              id: (Date.now() + 3).toString(),
              role: 'assistant',
              content: delivered ? 'Summary emailed successfully.' : 'Attempted to email the summary but it failed.',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, systemMsg]);
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly end session from UI (button)
  const endSession = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chatbot/session/respond', {
        sessionId,
        message: '[Session ended by user]',
        finished: true
      });

      if (response.data.success) {
        setIsSessionActive(false);
        setSessionDecision(response.data.decisionType || null);
        if (response.data.summary) {
          setSessionSummary(response.data.summary);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: response.data.assistantReply || 'Session ended. Take care 💚',
          timestamp: new Date(),
          risk: response.data.risk,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Error ending session:', error);
      setError(error.response?.data?.message || 'Failed to end session');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get risk level styling
  const getRiskStyling = (risk?: string) => {
    switch (risk) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-green-500 bg-green-50';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">MindCare AI</h3>
              <p className="text-sm opacity-90">Your mental health companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isSessionActive && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to MindCare AI
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                I'm here to listen and provide support. Start a conversation whenever you're ready.
              </p>
              {/* Start options toggle */}
              {!showStartOptions ? (
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setShowStartOptions(true)}
                    className="text-sm text-teal-700 hover:text-teal-800"
                  >
                    Customize start options
                  </button>
                  <button
                    onClick={startSession}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-teal-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Starting...</span>
                      </div>
                    ) : (
                      'Start Conversation'
                    )}
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={consentEmailSummary}
                      onChange={(e) => setConsentEmailSummary(e.target.checked)}
                    />
                    <span>Email me the session summary</span>
                  </label>
                  <input
                    type="email"
                    value={emailForSummary}
                    onChange={(e) => setEmailForSummary(e.target.value)}
                    disabled={!consentEmailSummary}
                    placeholder="you@example.com"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                  {consentEmailSummary && !emailForSummary.trim() && (
                    <p className="mt-1 text-xs text-red-600">Please enter an email address to receive the summary</p>
                  )}
                  <div className="mt-3 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setShowStartOptions(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startSession}
                      disabled={isLoading || (consentEmailSummary && !emailForSummary.trim())}
                      className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:from-teal-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Starting...' : 'Start now'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                        : `bg-gray-100 text-gray-800 ${getRiskStyling(message.risk)}`
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-5 h-5 mt-1 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="w-5 h-5 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* Emotion Information */}
                        {(message.emotion || message.facialEmotion) && message.role === 'assistant' && (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {message.facialEmotion && message.facialEmotion.emotion && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                😊 Face: {message.facialEmotion.emotion} ({Math.round(message.facialEmotion.confidence * 100)}%)
                              </span>
                            )}
                            {message.emotion && message.emotion.emotion && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                💬 Text: {message.emotion.emotion} ({Math.round(message.emotion.confidence * 100)}%)
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Recommendations - Show for all types now (max 2) */}
                        {message.recommendations && message.recommendations.length > 0 && message.role === 'assistant' && (
                          <div className="mt-3 p-2.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                            <p className="text-xs font-semibold text-purple-800 mb-1.5 flex items-center gap-1.5">
                              <span>💡</span> Recommendations
                            </p>
                            <div className="space-y-1.5">
                              {message.recommendations.slice(0, 2).map((rec, idx) => {
                                const handleClick = () => {
                                  if (rec.type === 'feature' && rec.route) {
                                    onClose(); // Close chatbot
                                    navigate(rec.route);
                                  } else if (rec.type === 'therapist' && rec.route) {
                                    onClose(); // Close chatbot
                                    navigate(rec.route);
                                  } else if (rec.url) {
                                    window.open(rec.url, '_blank', 'noopener,noreferrer');
                                  }
                                };

                                return (
                                  <div 
                                    key={idx} 
                                    className={`bg-white rounded-md p-2 border border-purple-100 hover:shadow-sm transition-shadow ${
                                      (rec.type === 'feature' || rec.type === 'therapist') ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={handleClick}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        {rec.type === 'video' && <span className="text-red-500 text-xs flex-shrink-0">▶️</span>}
                                        {rec.type === 'blog' && <span className="text-blue-500 text-xs flex-shrink-0">📖</span>}
                                        {(rec.type === 'activity' || rec.type === 'exercise') && <span className="text-green-500 text-xs flex-shrink-0">✨</span>}
                                        {rec.type === 'resource' && <span className="text-orange-500 text-xs flex-shrink-0">🆘</span>}
                                        {rec.type === 'feature' && <span className="text-indigo-500 text-xs flex-shrink-0">{rec.icon || '✨'}</span>}
                                        {rec.type === 'therapist' && <span className="text-teal-500 text-xs flex-shrink-0">👨‍⚕️</span>}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-800 text-xs truncate">{rec.title}</p>
                                        </div>
                                      </div>
                                      {(rec.url || rec.route) && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClick();
                                          }}
                                          className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors whitespace-nowrap flex-shrink-0"
                                        >
                                          {rec.type === 'video' ? 'Watch' : 
                                           rec.type === 'blog' ? 'Read' : 
                                           rec.type === 'feature' ? 'Try' :
                                           rec.type === 'therapist' ? 'Find' : 'Open'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {message.risk && message.risk !== 'low' && (
                          <div className="mt-2 flex items-center space-x-1 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Risk level: {message.risk}</span>
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl p-4 flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </motion.div>
          )}

          {/* Summary Panel */}
          {!isSessionActive && sessionSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-teal-50 border border-teal-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-800">Session Summary</p>
                  {sessionDecision && (
                    <p className="text-xs text-teal-700 mt-1">Decision: {sessionDecision}</p>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div className="mt-2">{renderSummary(sessionSummary)}</div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    // reset for new session
                    setSessionSummary(null);
                    setSessionDecision(null);
                    setMessages([]);
                    setSessionId(null);
                    setIsSessionActive(false);
                  }}
                  className="text-sm text-teal-700 hover:text-teal-800 font-medium"
                >
                  Start New Conversation
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isSessionActive && (
          <div className="border-t border-gray-200 p-4">
            {/* Facial Emotion Indicator */}
            {currentFacialEmotion && currentFacialEmotion.emotion && (
              <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">😊</span>
                  <div className="text-xs">
                    <p className="font-medium text-purple-800">
                      Emotion detected: {currentFacialEmotion.emotion}
                    </p>
                    <p className="text-purple-600">
                      Mood: {currentFacialEmotion.mood}/10 • Confidence: {Math.round(currentFacialEmotion.confidence * 100)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentFacialEmotion(null)}
                  className="text-purple-500 hover:text-purple-700 text-xs"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentFacialEmotion ? "Your emotion will be included with your message..." : "Type your message..."}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-3 rounded-full hover:from-teal-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={endSession}
                disabled={isLoading}
                className="px-4 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Chatbot;
