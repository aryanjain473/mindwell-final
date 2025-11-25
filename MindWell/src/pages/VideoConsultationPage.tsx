import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageCircle, 
  Share2, 
  Settings,
  Users,
  Clock,
  Minimize2,
  Maximize2,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Session {
  _id: string;
  appointment: {
    _id: string;
    scheduledAt: string;
    duration: number;
    type: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profile: {
      avatar?: string;
    };
  };
  therapist: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      profile: {
        avatar?: string;
      };
    };
  };
  status: string;
  startedAt: string;
  sessionData: {
    moodBefore?: number;
    anxietyLevel?: number;
    stressLevel?: number;
    energyLevel?: number;
  };
}

const VideoConsultationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'therapist';
    message: string;
    timestamp: Date;
    type: 'text' | 'file' | 'image' | 'link';
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (session && session.status === 'active') {
      const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setSession(data.data);
        setChatMessages(data.data.chat || []);
      } else {
        console.error('Error fetching session:', data.message);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          appointmentId: session.appointment._id,
          sessionData: session.sessionData
        })
      });

      const data = await response.json();
      if (data.success) {
        setSession(prev => prev ? { ...prev, status: 'active' } : null);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/session/${session._id}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionData: {
            moodAfter
          },
          notes: {
            userNotes: sessionNotes
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/dashboard', { 
          state: { 
            message: 'Session completed successfully!',
            session: data.data
          }
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    try {
      const response = await fetch(`/api/session/${session._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage,
          messageType: 'text'
        })
      });

      const data = await response.json();
      if (data.success) {
        setChatMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = () => {
    if (!session?.startedAt) return 0;
    const startTime = new Date(session.startedAt).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - startTime) / 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Session not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isTherapist = user?.role === 'therapist';
  const otherParticipant = isTherapist ? session.user : session.therapist.userId;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </h1>
              <p className="text-sm text-gray-400">
                {session.appointment.type} • {session.appointment.duration} min
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTime(getSessionDuration())}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500">End-to-end encrypted</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className={`flex-1 flex flex-col ${showChat ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Video Container */}
          <div className="flex-1 relative bg-gray-800">
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
                <img
                  src={otherParticipant.profile?.avatar || '/default-avatar.png'}
                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* Session Status */}
            {session.status !== 'active' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Session Ready</h2>
                  <p className="text-gray-300 mb-6">
                    {session.status === 'scheduled' ? 'Click to start the session' : 'Session is not active'}
                  </p>
                  {session.status === 'scheduled' && (
                    <button
                      onClick={startSession}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors ${
                  showChat ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setShowEndModal(true)}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-full lg:w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Session Chat</h3>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">End Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling after this session? (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={moodAfter || ''}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any thoughts or insights from this session..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={endSession}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoConsultationPage;
