import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  videoId?: string; // For YouTube videos
  title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  videoId,
  title = 'Demo Video' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Reset states when modal opens
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Reset video when URL changes
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            {videoId ? (
              // YouTube embed
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              // Direct video file
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
                      <p className="text-white text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="text-center p-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold mb-2">Error loading video</p>
                      <p className="text-gray-400 text-sm mb-4">{errorMessage}</p>
                      <button
                        onClick={() => {
                          setHasError(false);
                          setIsLoading(true);
                          if (videoRef.current) {
                            videoRef.current.load();
                          }
                        }}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={() => {
                    setIsLoading(false);
                    setHasError(false);
                  }}
                  onCanPlay={() => {
                    setIsLoading(false);
                  }}
                  onError={(e) => {
                    setIsLoading(false);
                    setHasError(true);
                    const target = e.target as HTMLVideoElement;
                    const error = target.error;
                    if (error) {
                      let message = 'Failed to load video. ';
                      switch (error.code) {
                        case error.MEDIA_ERR_ABORTED:
                          message += 'Video loading was aborted.';
                          break;
                        case error.MEDIA_ERR_NETWORK:
                          message += 'Network error while loading video.';
                          break;
                        case error.MEDIA_ERR_DECODE:
                          message += 'Video decoding error.';
                          break;
                        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                          message += 'Video format not supported.';
                          break;
                        default:
                          message += 'Unknown error occurred.';
                      }
                      setErrorMessage(message);
                    } else {
                      setErrorMessage('Video file not found or cannot be loaded.');
                    }
                    console.error('Video error:', error);
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </>
            ) : (
              // Placeholder - you can replace this with your actual demo video
              <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Demo Video Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We're preparing an amazing demo video for you!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    To add your demo video, either:
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-left max-w-md mx-auto">
                    <li>• Upload a video file and set the videoUrl prop</li>
                    <li>• Add a YouTube video ID and set the videoId prop</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;

