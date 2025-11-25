import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, RotateCcw, ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const HeartCalmGame = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [inhaleTime, setInhaleTime] = useState(4);
  const [exhaleTime, setExhaleTime] = useState(6);
  const [holdTime, setHoldTime] = useState(2);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [calmnessIndex, setCalmnessIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const savingRef = useRef(false);

  const phases = {
    inhale: { duration: inhaleTime, color: 'bg-blue-400', label: 'Inhale' },
    hold: { duration: holdTime, color: 'bg-purple-400', label: 'Hold' },
    exhale: { duration: exhaleTime, color: 'bg-teal-400', label: 'Exhale' },
    pause: { duration: 1, color: 'bg-gray-300', label: 'Pause' }
  };

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      runBreathingCycle();
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
  }, [isPlaying, inhaleTime, exhaleTime, holdTime]);

  const runBreathingCycle = () => {
    const cycle = ['inhale', 'hold', 'exhale', 'pause'] as const;
    let currentPhaseIndex = 0;
    
    const executePhase = () => {
      const currentPhase = cycle[currentPhaseIndex];
      setPhase(currentPhase);
      const phaseDuration = phases[currentPhase].duration;
      setTimeRemaining(phaseDuration);
      
      let countdown = phaseDuration;
      const phaseInterval = setInterval(() => {
        countdown--;
        setTimeRemaining(countdown);
        
        if (countdown <= 0) {
          clearInterval(phaseInterval);
          currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
          
          if (currentPhaseIndex === 0) {
            setCycleCount(prev => {
              const newCount = prev + 1;
              recordCycleData(newCount);
              return newCount;
            });
          }
          
          if (isPlaying) {
            executePhase();
          }
        }
      }, 1000);
    };
    
    executePhase();
  };

  const recordCycleData = (cycleNum: number) => {
    const cycleTime = Date.now() - startTimeRef.current;
    const idealTime = (inhaleTime + holdTime + exhaleTime + 1) * 1000;
    const consistency = 1 - Math.abs(cycleTime - idealTime) / idealTime;
    
    setSessionData(prev => {
      const newData = [...prev, {
        cycle: cycleNum,
        time: cycleTime,
        consistency: Math.max(0, consistency),
        timestamp: Date.now()
      }];
      
      // Calculate calmness index (average consistency over last 5 cycles)
      const recentCycles = newData.slice(-5);
      const avgConsistency = recentCycles.reduce((sum, d) => sum + d.consistency, 0) / recentCycles.length;
      setCalmnessIndex(Math.round(avgConsistency * 100));
      
      return newData;
    });
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCycleCount(0);
    setSessionData([]);
    setCalmnessIndex(0);
    savingRef.current = false;
  };

  const handleStop = () => {
    setIsPlaying(false);
    saveSession();
  };

  const saveSession = async () => {
    // Prevent multiple saves
    if (savingRef.current || sessionData.length === 0) return;
    
    savingRef.current = true;
    try {
      const avgInhale = inhaleTime;
      const avgExhale = exhaleTime;
      const duration = Date.now() - startTimeRef.current;
      
      await api.post('/wellness-games/heart-calm', {
        cycles: cycleCount,
        calmnessIndex,
        avgInhale,
        avgExhale,
        duration,
        sessionData
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      savingRef.current = false;
    }
  };

  const currentPhaseData = phases[phase];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Heart Calm</h1>
          <div className="w-10" />
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Breathing Circle */}
          <div className="flex justify-center items-center mb-8" style={{ height: '400px' }}>
            <motion.div
              className={`rounded-full ${currentPhaseData.color} flex items-center justify-center text-white`}
              animate={{
                scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
                opacity: phase === 'pause' ? 0.6 : 1
              }}
              transition={{
                duration: phases[phase].duration,
                ease: phase === 'inhale' ? 'easeOut' : phase === 'exhale' ? 'easeIn' : 'linear'
              }}
              style={{
                width: '300px',
                height: '300px'
              }}
            >
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">{currentPhaseData.label}</div>
                <div className="text-2xl font-semibold">{timeRemaining}s</div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Start</span>
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
                setCycleCount(0);
                setSessionData([]);
                setCalmnessIndex(0);
              }}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cycleCount}</div>
              <div className="text-sm text-gray-600">Cycles</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{calmnessIndex}%</div>
              <div className="text-sm text-gray-600">Calmness</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {Math.floor((Date.now() - startTimeRef.current) / 1000) || 0}s
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Breathing Rhythm</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inhale (s)</label>
              <input
                type="number"
                min="2"
                max="8"
                value={inhaleTime}
                onChange={(e) => setInhaleTime(parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hold (s)</label>
              <input
                type="number"
                min="0"
                max="4"
                value={holdTime}
                onChange={(e) => setHoldTime(parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exhale (s)</label>
              <input
                type="number"
                min="4"
                max="10"
                value={exhaleTime}
                onChange={(e) => setExhaleTime(parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💡 Tip: Exhale should be longer than inhale for better relaxation
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeartCalmGame;

