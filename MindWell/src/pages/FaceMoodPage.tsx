import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceMood from '../components/FaceMood';

const FaceMoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);

  const handleEmotionDetected = async (emotion: string, confidence: number, mood?: number) => {
    console.log('Emotion detected:', { emotion, confidence, mood });
    
    // Mood is automatically logged when autoLog=true (set in FaceMood component)
    if (mood) {
      setDetectedEmotion(emotion);
      setShowSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Facial Mood Detection
          </h1>
          <p className="text-gray-600">
            Upload a photo or capture one with your camera to detect your current emotional state.
            Your mood will be automatically logged and personalized recommendations will be provided.
          </p>
        </div>

        <FaceMood
          key={refreshKey}
          onEmotionDetected={handleEmotionDetected}
          autoLog={true}
        />

        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && detectedEmotion && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg shadow-lg"
            >
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Emotion Detected Successfully!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Your emotion ({detectedEmotion}) has been detected and your mood has been automatically logged. 
                    Check your dashboard for personalized AI recommendations based on your emotional state.
                  </p>
                  <button
                    onClick={handleGoToDashboard}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How it works
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Upload a clear photo of your face or use your camera to capture one</li>
            <li>• Our AI analyzes your facial expression to detect your current emotion</li>
            <li>• Your mood is automatically logged to track your emotional well-being</li>
            <li>• Get personalized recommendations for activities, music, or videos based on your emotion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaceMoodPage;

