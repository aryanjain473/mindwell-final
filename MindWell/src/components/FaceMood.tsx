import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Smile, Loader2, CheckCircle, AlertCircle, Play, BookOpen, Activity, ExternalLink } from 'lucide-react';
import api from '../utils/axiosConfig';
import { getEmotionDisplay, mapEmotionToMood, triggerRecommendationsForEmotion } from '../utils/emotionUtils';

interface EmotionResult {
  emotion: string;
  confidence: number;
  mood?: number;
  activityId?: string;
  message?: string;
  emotion_scores?: Record<string, number>;
}

interface Recommendation {
  type: 'activity' | 'video' | 'blog' | 'resource' | 'exercise' | 'content';
  title: string;
  description: string;
  url?: string;
  priority?: number;
}

interface FaceMoodProps {
  onEmotionDetected?: (emotion: string, confidence: number, mood?: number) => void;
  autoLog?: boolean;
}

const FaceMood: React.FC<FaceMoodProps> = ({ onEmotionDetected, autoLog = false }) => {
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    await detectEmotion(file);
  };

  const detectEmotion = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const endpoint = autoLog ? '/emotion/detect-and-log' : '/emotion/detect-emotion';
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success || res.data.emotion) {
        const emotionData = res.data;
        
        // Normalize confidence if it's not already a decimal
        if (emotionData.confidence !== undefined) {
          // Ensure confidence is between 0 and 1
          if (emotionData.confidence > 1) {
            emotionData.confidence = emotionData.confidence / 100.0;
          }
          emotionData.confidence = Math.max(0, Math.min(1, emotionData.confidence));
        }
        
        // Ensure mood is set if not provided
        if (!emotionData.mood) {
          emotionData.mood = mapEmotionToMood(emotionData.emotion);
        }
        
        // Log emotion scores for debugging
        if (emotionData.emotion_scores) {
          console.log('Emotion scores:', emotionData.emotion_scores);
          console.log('Detected emotion:', emotionData.emotion, 'Confidence:', emotionData.confidence);
        }
        
        setResult(emotionData);
        
        // Fetch recommendations from backend
        await fetchRecommendations(emotionData.emotion, emotionData.mood);
        
        // Trigger recommendations (for backward compatibility)
        triggerRecommendationsForEmotion(emotionData.emotion, emotionData.mood);
        
        if (onEmotionDetected) {
          onEmotionDetected(emotionData.emotion, emotionData.confidence, emotionData.mood);
        }
      } else {
        throw new Error(res.data.error || 'Failed to detect emotion');
      }
    } catch (err: any) {
      console.error('Error detecting emotion:', err);
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to detect emotion';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Provide helpful suggestions based on error
      if (errorMessage.toLowerCase().includes('no face') || errorMessage.toLowerCase().includes('face detected')) {
        errorMessage = 'No face detected in the image. Please ensure your face is clearly visible and well-lit.';
      } else if (errorMessage.toLowerCase().includes('timeout')) {
        errorMessage = 'Detection took too long. Please try with a smaller or clearer image.';
      } else if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('access')) {
        errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraReady(false);
      
      // Request camera access first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      
      // Show camera UI after stream is obtained
      // This triggers the useEffect to setup the video element
      setShowCamera(true);
      
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access and try again.'
        : err.name === 'NotFoundError'
        ? 'No camera found. Please connect a camera and try again.'
        : err.name === 'NotReadableError'
        ? 'Camera is already in use by another application.'
        : `Could not access camera: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      setShowCamera(false);
      setIsCameraReady(false);
      
      // Clean up if error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      setError('Camera is not ready. Please wait for the camera to load.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context');
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture image. Please try again.');
          return;
        }

        try {
          // Stop camera first
          stopCamera();
          
          // Create file from blob
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          
          // Create preview
          const previewUrl = URL.createObjectURL(blob);
          setPreview(previewUrl);
          
          // Detect emotion
          await detectEmotion(file);
        } catch (err) {
          console.error('Error processing captured photo:', err);
          setError('Error processing captured photo. Please try again.');
          setShowCamera(false);
        }
      }, 'image/jpeg', 0.95); // 95% quality
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Error capturing photo. Please try again.');
    }
  };

  const fetchRecommendations = async (emotion: string, mood?: number) => {
    setIsLoadingRecommendations(true);
    try {
      const res = await api.post('/emotion/generate-recommendations', {
        emotion,
        mood: mood || mapEmotionToMood(emotion)
      });
      
      if (res.data.success && res.data.recommendations) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      // Don't show error to user, just log it
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setError(null);
    setRecommendations([]);
    setIsCameraReady(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clean up any camera streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Setup video stream when showCamera changes
  React.useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      const stream = streamRef.current;
      
      // Set stream if not already set
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Setup event handlers
      const handleLoadedMetadata = async () => {
        try {
          await video.play();
          console.log('Video is playing');
          setIsCameraReady(true);
        } catch (playError) {
          console.error('Error playing video:', playError);
          setError('Error starting camera preview. Please try again.');
        }
      };

      const handleError = (e: any) => {
        console.error('Video error:', e);
        setError('Error loading camera feed. Please try again.');
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);

      // If already loaded, play immediately
      if (video.readyState >= 2) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }
  }, [showCamera]);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);


  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Smile className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Facial Mood Detection</h3>
      </div>

      {!preview && !showCamera && (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Upload a photo or capture one with your camera to detect your current emotional state.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Upload Photo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCamera}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-5 w-5" />
              Use Camera
            </motion.button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}

      {showCamera && (
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '400px',
                objectFit: 'cover',
                backgroundColor: '#000'
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center text-white">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Initializing camera...</p>
                  <p className="text-sm text-gray-400 mt-2">Please wait while we access your camera</p>
                </div>
              </div>
            )}
          </div>
          {error && showCamera && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
          <div className="flex gap-4">
            <motion.button
              whileHover={isCameraReady && !isLoading ? { scale: 1.05 } : {}}
              whileTap={isCameraReady && !isLoading ? { scale: 0.95 } : {}}
              onClick={capturePhoto}
              disabled={!isCameraReady || isLoading}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium ${
                isCameraReady && !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Processing...' : isCameraReady ? '📷 Capture Photo' : '⏳ Waiting for camera...'}
            </motion.button>
            <motion.button
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
              onClick={stopCamera}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain mx-auto"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
              <span className="text-gray-600">Analyzing your expression...</span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className={`p-6 rounded-lg ${getEmotionDisplay(result.emotion).bgColor} border-2 border-current ${getEmotionDisplay(result.emotion).color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getEmotionDisplay(result.emotion).emoji}</span>
                    <div>
                      <h4 className="text-xl font-bold capitalize">{result.emotion}</h4>
                      <p className="text-sm opacity-75">
                        Confidence: {Math.round((result.confidence || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8" />
                </div>

                {result.mood && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-30">
                    <p className="text-sm font-medium">
                      Mood Score: <span className="font-bold">{result.mood}/10</span>
                    </p>
                    {autoLog && result.message && (
                      <p className="text-sm mt-2 opacity-75">{result.message}</p>
                    )}
                  </div>
                )}

                {/* Show all emotion scores for debugging/transparency */}
                {result.emotion_scores && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-30">
                    <p className="text-xs font-medium mb-2 opacity-75">All Emotion Scores:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(result.emotion_scores)
                        .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
                        .map(([emo, score]: [string, any]) => (
                          <div key={emo} className="flex justify-between">
                            <span className="capitalize">{emo}:</span>
                            <span className="font-medium">
                              {Math.round(score * 100)}%
                              {emo === result.emotion && ' ⭐'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations Section */}
              {(isLoadingRecommendations || recommendations.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Smile className="h-5 w-5 text-purple-600" />
                    Personalized Recommendations
                  </h4>
                  
                  {isLoadingRecommendations ? (
                    <div className="flex items-center justify-center gap-3 py-4">
                      <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      <span className="text-gray-600">Generating recommendations...</span>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {rec.type === 'video' && (
                                <div className="p-2 bg-red-100 rounded-lg">
                                  <Play className="h-5 w-5 text-red-600" />
                                </div>
                              )}
                              {rec.type === 'blog' && (
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              {(rec.type === 'activity' || rec.type === 'exercise') && (
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Activity className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              {!['video', 'blog', 'activity', 'exercise'].includes(rec.type) && (
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <Smile className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-800 mb-1">{rec.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                              {rec.url && (
                                <a
                                  href={rec.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                  {rec.type === 'video' ? 'Watch Video' : rec.type === 'blog' ? 'Read Article' : 'Learn More'}
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Another
                </motion.button>
                {!autoLog && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (fileInputRef.current?.files?.[0]) {
                        const formData = new FormData();
                        formData.append('image', fileInputRef.current.files[0]);
                        try {
                          const res = await api.post('/emotion/detect-and-log', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          if (res.data.success) {
                            setResult(res.data);
                            // Fetch recommendations after logging
                            await fetchRecommendations(res.data.emotion, res.data.mood);
                            if (onEmotionDetected) {
                              onEmotionDetected(res.data.emotion, res.data.confidence, res.data.mood);
                            }
                          }
                        } catch (err) {
                          console.error('Error logging mood:', err);
                        }
                      } else if (result) {
                        // If file is not available but result exists, just fetch recommendations
                        await fetchRecommendations(result.emotion, result.mood);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Log Mood
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceMood;

