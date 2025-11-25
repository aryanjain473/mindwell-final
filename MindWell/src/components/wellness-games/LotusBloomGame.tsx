import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flower2, Play, Pause, RotateCcw, ArrowLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const LotusBloomGame = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const [bloomLevel, setBloomLevel] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  const [focusScore, setFocusScore] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  const phases = {
    inhale: { duration: 4000, label: 'Breathe In', color: 'from-pink-400 to-purple-400' },
    hold: { duration: 2000, label: 'Hold', color: 'from-purple-400 to-indigo-400' },
    exhale: { duration: 6000, label: 'Breathe Out', color: 'from-indigo-400 to-pink-400' }
  };

  useEffect(() => {
    if (isPlaying) {
      setSessionStart(Date.now());
      startBreathingCycle();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      const focusInterval = setInterval(() => {
        setFocusTime(prev => {
          const newTime = prev + 1;
          // Bloom increases with focus time and breath consistency
          const newBloom = Math.min(100, bloomLevel + (breathCount * 2) + (newTime / 10));
          setBloomLevel(newBloom);
          setFocusScore(Math.round((newTime / 60) * 100)); // Score based on minutes
          return newTime;
        });
      }, 1000);
      return () => clearInterval(focusInterval);
    }
  }, [isPlaying, breathCount, bloomLevel]);

  const startBreathingCycle = () => {
    const cycle = ['inhale', 'hold', 'exhale'] as const;
    let phaseIndex = 0;

    const executePhase = () => {
      if (!isPlaying) return;
      
      const currentPhase = cycle[phaseIndex];
      setBreathPhase(currentPhase);
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % cycle.length;
        if (phaseIndex === 0) {
          setBreathCount(prev => prev + 1);
        }
        if (isPlaying) {
          executePhase();
        }
      }, phases[currentPhase].duration);
    };

    executePhase();
  };

  const handleStart = () => {
    setIsPlaying(true);
    setBloomLevel(0);
    setFocusTime(0);
    setBreathCount(0);
    setFocusScore(0);
    savingRef.current = false;
  };

  const handleStop = async () => {
    setIsPlaying(false);
    if (sessionStart) {
      await saveSession();
    }
  };

  const saveSession = async () => {
    // Prevent multiple saves
    if (savingRef.current || !sessionStart) return;
    
    savingRef.current = true;
    try {
      const duration = Math.floor((Date.now() - (sessionStart || 0)) / 1000);
      await api.post('/wellness-games/lotus-bloom', {
        bloomPercentage: Math.round(bloomLevel),
        focusDuration: focusTime,
        breathCount,
        focusScore,
        duration
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      savingRef.current = false;
    }
  };

  const currentPhase = phases[breathPhase];
  const petalCount = Math.floor((bloomLevel / 100) * 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Lotus Bloom</h1>
          <div className="w-10" />
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Lotus Visualization */}
          <div className="flex justify-center items-center mb-8" style={{ height: '400px' }}>
            <div className="relative">
              {/* Lotus Base */}
              <motion.div
                className="relative"
                animate={{
                  scale: breathPhase === 'inhale' ? 1.1 : breathPhase === 'exhale' ? 0.95 : 1
                }}
                transition={{
                  duration: phases[breathPhase].duration / 1000,
                  ease: 'easeInOut'
                }}
              >
                {/* Petals */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute bg-gradient-to-br ${currentPhase.color} rounded-full`}
                    style={{
                      width: i < petalCount ? '60px' : '20px',
                      height: i < petalCount ? '60px' : '20px',
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                      transform: `rotate(${i * 45}deg) translateY(-100px)`,
                      opacity: i < petalCount ? 0.8 : 0.3
                    }}
                    animate={{
                      scale: i < petalCount ? 1 : 0.5,
                      opacity: i < petalCount ? 0.8 : 0.3
                    }}
                  />
                ))}
                
                {/* Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className={`w-24 h-24 bg-gradient-to-br ${currentPhase.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <Flower2 className="h-12 w-12 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="text-center mb-6">
            <motion.div
              key={breathPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-gray-900"
            >
              {currentPhase.label}
            </motion.div>
            <div className="text-sm text-gray-600 mt-2">
              Follow the rhythm to help the lotus bloom
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Start Blooming</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Pause className="h-5 w-5" />
                <span>Stop</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsPlaying(false);
                setBloomLevel(0);
                setFocusTime(0);
                setBreathCount(0);
                setFocusScore(0);
              }}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{Math.round(bloomLevel)}%</div>
              <div className="text-sm text-gray-600">Bloom</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{breathCount}</div>
              <div className="text-sm text-gray-600">Breaths</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Focus</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{focusScore}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>How to Bloom</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Breathe in slowly (4 seconds) - Watch the lotus expand</li>
            <li>• Hold your breath (2 seconds) - Maintain focus</li>
            <li>• Breathe out slowly (6 seconds) - Let the petals open</li>
            <li>• Maintain steady rhythm to help the lotus fully bloom</li>
            <li>• Each breath cycle helps the lotus grow and your focus improve</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LotusBloomGame;

