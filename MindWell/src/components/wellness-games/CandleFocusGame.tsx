import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Play, Pause, RotateCcw, ArrowLeft, Target, Zap, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

interface SessionSummary {
  focusTime: number;
  focusScore: number;
  distractions: number;
  flameStability: number;
  completion: number;
}

const CandleFocusGame = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [flameStability, setFlameStability] = useState(100);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [targetDuration, setTargetDuration] = useState(5);
  const [breathCue, setBreathCue] = useState('Inhale slowly through the nose');
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stabilityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMovementRef = useRef<number>(Date.now());
  const movementCleanupRef = useRef<(() => void) | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (isPlaying) {
      setSessionStart(Date.now());
      setSessionSummary(null);
      startFocusTimer();
      startStabilityCheck();
      setupMovementDetection();
      startBreathGuidance();
    } else {
      stopAllIntervals();
      removeMovementDetection();
    }
    return () => {
      stopAllIntervals();
      removeMovementDetection();
    };
  }, [isPlaying]);

  const clearIntervalRef = (ref: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const stopAllIntervals = () => {
    clearIntervalRef(focusIntervalRef);
    clearIntervalRef(stabilityIntervalRef);
    clearIntervalRef(breathIntervalRef);
  };

  const startFocusTimer = () => {
    clearIntervalRef(focusIntervalRef);
    focusIntervalRef.current = setInterval(() => {
      setFocusTime(prev => {
        const newTime = prev + 1;
        if (newTime > bestTime) {
          setBestTime(newTime);
        }
        return newTime;
      });
    }, 1000);
  };

  const startStabilityCheck = () => {
    clearIntervalRef(stabilityIntervalRef);
    stabilityIntervalRef.current = setInterval(() => {
      const timeSinceLastMovement = Date.now() - lastMovementRef.current;
      setFlameStability(prev => {
        if (timeSinceLastMovement < 1500) {
          return Math.max(0, prev - 5);
        }
        return Math.min(100, prev + 1);
      });
    }, 500);
  };

  const setupMovementDetection = () => {
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMovementRef.current > 1000) {
        setDistractions(prev => prev + 1);
        setFlameStability(prev => Math.max(0, prev - 5));
      }
      lastMovementRef.current = now;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    movementCleanupRef.current = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  };

  const removeMovementDetection = () => {
    if (movementCleanupRef.current) {
      movementCleanupRef.current();
      movementCleanupRef.current = null;
    }
  };

  const startBreathGuidance = () => {
    const cues = [
      'Inhale slowly through the nose',
      'Hold softly for two counts',
      'Exhale gently through the mouth',
      'Keep the gaze relaxed and soft'
    ];
    let index = 0;
    clearIntervalRef(breathIntervalRef);
    breathIntervalRef.current = setInterval(() => {
      index = (index + 1) % cues.length;
      setBreathCue(cues[index]);
    }, 4000);
  };

  const handleStart = () => {
    setIsPlaying(true);
    setFocusTime(0);
    setDistractions(0);
    setFlameStability(100);
    setBreathCue('Inhale slowly through the nose');
    lastMovementRef.current = Date.now();
    savingRef.current = false;
  };

  const handleStop = async () => {
    if (!isPlaying) return;
    setIsPlaying(false);
    if (sessionStart && focusTime > 0) {
      const data = await saveSession();
      const completion = Math.min(
        100,
        Math.round((focusTime / (targetDuration * 60)) * 100 || 0)
      );
      setSessionSummary({
        focusTime,
        focusScore: data.focusScore,
        distractions,
        flameStability: Math.round(flameStability),
        completion
      });
    }
  };

  const saveSession = async () => {
    // Prevent multiple saves
    if (savingRef.current || !sessionStart || focusTime === 0) {
      return { focusScore: 0 };
    }
    
    savingRef.current = true;
    try {
      const duration = focusTime;
      const focusScore = Math.max(
        0,
        Math.round((focusTime / 60) * 100 - distractions * 5 + flameStability / 2)
      );
      await api.post('/wellness-games/candle-focus', {
        focusDuration: focusTime,
        bestTime,
        distractions,
        flameStability: Math.round(flameStability),
        focusScore,
        duration
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
      
      return { focusScore };
    } catch (error) {
      console.error('Error saving session:', error);
      return { focusScore: 0 };
    } finally {
      savingRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const focusProgress = Math.min(
    100,
    Math.round((focusTime / (targetDuration * 60)) * 100 || 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Candle Focus</h1>
          <div className="w-10" />
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Choose your focus goal
              </label>
              <div className="flex items-center space-x-3">
                {[2, 5, 10].map(option => (
                  <button
                    key={option}
                    onClick={() => setTargetDuration(option)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      targetDuration === option
                        ? 'bg-orange-100 border-orange-400 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-orange-200'
                    }`}
                    disabled={isPlaying}
                  >
                    {option} min
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sm text-orange-700">
                <Timer className="h-4 w-4" />
                <span>Session progress</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{focusProgress}% complete</span>
                  <span>Goal: {targetDuration} min</span>
                </div>
                <div className="w-full bg-orange-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${focusProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Candle Visualization */}
          <div className="flex justify-center items-center mb-8" style={{ height: '400px' }}>
            <div className="relative">
              {/* Candle */}
              <div className="relative">
                <div className="w-16 h-48 bg-gradient-to-b from-orange-200 to-orange-400 rounded-lg mx-auto shadow-xl">
                  {/* Wick */}
                  <div className="w-1 h-4 bg-gray-800 mx-auto -mt-1" />
                </div>

                {/* Flame */}
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  animate={{
                    scale: isPlaying ? [1, 1.1, 1, 1.05, 1] : 1,
                    opacity:
                      isPlaying && flameStability > 50
                        ? [1, 0.9, 1, 0.95, 1]
                        : flameStability > 50
                        ? 1
                        : 0.5,
                    y: isPlaying && flameStability > 70 ? [0, -2, 0, -1, 0] : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="relative">
                    {/* Outer flame */}
                    <div
                      className={`w-12 h-16 rounded-full ${
                        flameStability > 70
                          ? 'bg-orange-400'
                          : flameStability > 40
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      } opacity-80 blur-sm`}
                      style={{ transform: 'perspective(100px) rotateX(180deg)' }}
                    />
                    {/* Inner flame */}
                    <div
                      className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-10 rounded-full ${
                        flameStability > 70
                          ? 'bg-yellow-300'
                          : flameStability > 40
                          ? 'bg-orange-300'
                          : 'bg-red-400'
                      }`}
                      style={{ transform: 'perspective(100px) rotateX(180deg)' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Focus indicator */}
              {isPlaying && (
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Focus on the flame</div>
                    <div className="text-xs text-gray-500">Stay still, maintain attention</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="text-center text-sm text-gray-600">{breathCue}</div>
            <div className="flex justify-center space-x-4">
              {!isPlaying ? (
                <button
                  onClick={handleStart}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  <span>Start Focus Session</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Pause className="h-5 w-5" />
                  <span>End Session</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setFocusTime(0);
                  setDistractions(0);
                  setFlameStability(100);
                  setSessionSummary(null);
                }}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatTime(focusTime)}</div>
              <div className="text-sm text-gray-600">Current</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{formatTime(bestTime)}</div>
              <div className="text-sm text-gray-600">Best</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{distractions}</div>
              <div className="text-sm text-gray-600">Distractions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(flameStability)}%</div>
              <div className="text-sm text-gray-600">Stability</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span>Focus Training</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Sit comfortably and fix your gaze on the candle flame</li>
            <li>• Keep your body still - movement reduces flame stability</li>
            <li>• Maintain your attention - let thoughts pass without following them</li>
            <li>• The longer you focus, the stronger your attention becomes</li>
            <li>• Practice daily to improve your concentration and mindfulness</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>Micro-challenges</span>
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Keep the pointer still for 60 seconds</li>
                <li>• Stay with the breath cue for a full cycle</li>
                <li>• Notice each distraction without judgment</li>
              </ul>
            </div>
            {sessionSummary && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2">Session summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-500">Focus time</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatTime(sessionSummary.focusTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Completion</p>
                    <p className="text-base font-semibold text-gray-900">
                      {sessionSummary.completion}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Focus score</p>
                    <p className="text-base font-semibold text-gray-900">
                      {sessionSummary.focusScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Calm stability</p>
                    <p className="text-base font-semibold text-gray-900">
                      {sessionSummary.flameStability}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Tip: aim for fewer than {Math.max(1, Math.round(targetDuration / 2))} distractions
                  next time to boost your score.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandleFocusGame;

