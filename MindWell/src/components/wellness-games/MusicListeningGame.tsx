import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, Clock, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

interface SoundOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  file: string;
  color: string;
}

const MusicListeningGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundOption | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  // Sound options - users can add their own files to public/sounds/
  const soundOptions: SoundOption[] = [
    {
      id: 'rain',
      name: 'Rain',
      description: 'Gentle rain sounds for relaxation',
      icon: '🌧️',
      file: '/sounds/rain.mp3',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Calming ocean waves',
      icon: '🌊',
      file: '/sounds/ocean.mp3',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 'forest',
      name: 'Forest',
      description: 'Nature sounds from the forest',
      icon: '🌲',
      file: '/sounds/forest.mp3',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'waterfall',
      name: 'Waterfall',
      description: 'Flowing water sounds',
      icon: '💧',
      file: '/sounds/waterfall.mp3',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      id: 'thunder',
      name: 'Thunderstorm',
      description: 'Distant thunder and rain',
      icon: '⛈️',
      file: '/sounds/thunder.mp3',
      color: 'from-gray-500 to-slate-600'
    },
    {
      id: 'fireplace',
      name: 'Fireplace',
      description: 'Crackling fire sounds',
      icon: '🔥',
      file: '/sounds/fireplace.mp3',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'birds',
      name: 'Birds Chirping',
      description: 'Morning birds in nature',
      icon: '🐦',
      file: '/sounds/birds.mp3',
      color: 'from-yellow-400 to-green-400'
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      description: 'Soothing white noise',
      icon: '⚪',
      file: '/sounds/white-noise.mp3',
      color: 'from-gray-300 to-gray-400'
    }
  ];

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (selectedSound && audioRef.current) {
      // Stop current playback if any
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsTimerActive(false);
      }
      audioRef.current.src = selectedSound.file;
      audioRef.current.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSound]);

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1 && !savingRef.current && !sessionSaved) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  const handlePlayPause = async () => {
    if (!selectedSound) {
      // Use a more user-friendly notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      notification.innerHTML = '<span>⚠️ Please select a sound first</span>';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
      return;
    }

    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsTimerActive(false);
      } else {
        // Preload audio before playing
        if (audioRef.current.readyState < 2) {
          audioRef.current.load();
          await new Promise((resolve) => {
            audioRef.current!.addEventListener('canplay', resolve, { once: true });
          });
        }
        await audioRef.current.play();
        setIsPlaying(true);
        setSessionStarted(true);
        if (timeRemaining > 0) {
          setIsTimerActive(true);
        }
      }
    } catch (error: any) {
      console.error('Error playing audio:', error);
      // More user-friendly error message
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Please allow audio playback in your browser settings'
        : error.name === 'NotSupportedError'
        ? 'Audio format not supported. Please try a different sound.'
        : 'Error playing audio. Please check if the audio file exists.';
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      notification.innerHTML = `<span>❌ ${errorMsg}</span>`;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 5000);
      }, 5000);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsTimerActive(false);
    setSessionStarted(false);
    setSessionEnded(false);
    setSessionSaved(false);
    savingRef.current = false;
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    setTimeRemaining(totalSeconds);
  };

  const handleTimerEnd = async () => {
    // Prevent multiple calls
    if (savingRef.current || sessionSaved) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsTimerActive(false);
    setSessionEnded(true);
    await saveSessionData();
  };

  const saveSessionData = async () => {
    // Prevent multiple saves
    if (savingRef.current || sessionSaved) {
      console.log('⚠️ Session already saved, skipping duplicate save');
      return;
    }
    
    savingRef.current = true;
    try {
      const sessionDuration = (timerMinutes * 60 + timerSeconds) - timeRemaining;
      const totalDuration = timerMinutes * 60 + timerSeconds;
      const completionRate = totalDuration > 0 ? (sessionDuration / totalDuration) * 100 : 100;
      
      await api.post('/wellness-games/music-listening', {
        duration: sessionDuration,
        sound: selectedSound?.name || 'Unknown',
        timerMinutes,
        timerSeconds,
        score: Math.round(completionRate)
      });
      
      console.log('✅ Music Listening session saved successfully');
      setSessionSaved(true);
      
      // Trigger a custom event to refresh stats on the games page
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
    } catch (error: any) {
      console.error('❌ Error saving session:', error);
      // Don't try fallback to avoid double saves - just log the error
    } finally {
      savingRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerChange = (minutes: number, seconds: number) => {
    setTimerMinutes(minutes);
    setTimerSeconds(seconds);
    const totalSeconds = minutes * 60 + seconds;
    setTimeRemaining(totalSeconds);
    if (isTimerActive) {
      setIsTimerActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/wellness-games')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Music className="h-6 w-6 text-indigo-600" />
                  <span>Music & Sound Therapy</span>
                </h1>
                <p className="text-sm text-gray-600">Relax with calming sounds</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sound Selection */}
        {!sessionStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Sound</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {soundOptions.map((sound) => (
                <motion.button
                  key={sound.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSound(sound)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSound?.id === sound.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="text-4xl mb-2">{sound.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{sound.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{sound.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timer Settings */}
        {!sessionStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Set Timer</span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={timerMinutes}
                  onChange={(e) => {
                    const mins = Math.max(0, Math.min(60, parseInt(e.target.value) || 0));
                    handleTimerChange(mins, timerSeconds);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerSeconds}
                  onChange={(e) => {
                    const secs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    handleTimerChange(timerMinutes, secs);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Total duration: {formatTime(timerMinutes * 60 + timerSeconds)}
            </p>
          </motion.div>
        )}

        {/* Main Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6"
        >
          {selectedSound && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedSound.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSound.name}</h2>
              <p className="text-gray-600">{selectedSound.description}</p>
            </div>
          )}

          {/* Timer Display */}
          {sessionStarted && (
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          )}

          {/* Session Ended Message */}
          {sessionEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Session Complete!</h3>
              <p className="text-green-700">Great job! You've completed your relaxation session.</p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                disabled={!selectedSound}
                className={`p-4 rounded-full ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReset}
                className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                <RotateCcw className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Volume Control */}
            {selectedSound && (
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Volume</span>
                  </label>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{Math.round(volume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Waves className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Benefits of Sound Therapy</h3>
              <p className="text-sm text-gray-700">
                Listening to calming sounds can help reduce stress, improve focus, enhance sleep quality, 
                and promote overall relaxation. Set a timer and let the sounds guide you to a calmer state of mind.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MusicListeningGame;

