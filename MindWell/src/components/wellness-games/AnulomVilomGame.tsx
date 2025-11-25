import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, ArrowLeft, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const AnulomVilomGame = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNostril, setCurrentNostril] = useState<'left' | 'right' | 'hold'>('left');
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [balanceRatio, setBalanceRatio] = useState(50);
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [breathSymmetry, setBreathSymmetry] = useState(100);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  const phases = {
    left: { duration: 4000, label: 'Breathe In - Left Nostril', color: 'from-blue-400 to-cyan-400', icon: '👃' },
    hold: { duration: 2000, label: 'Hold Breath', color: 'from-purple-400 to-indigo-400', icon: '⏸' },
    right: { duration: 4000, label: 'Breathe Out - Right Nostril', color: 'from-green-400 to-teal-400', icon: '👃' },
    rightIn: { duration: 4000, label: 'Breathe In - Right Nostril', color: 'from-green-400 to-teal-400', icon: '👃' },
    hold2: { duration: 2000, label: 'Hold Breath', color: 'from-purple-400 to-indigo-400', icon: '⏸' },
    leftOut: { duration: 4000, label: 'Breathe Out - Left Nostril', color: 'from-blue-400 to-cyan-400', icon: '👃' }
  };

  useEffect(() => {
    if (isPlaying) {
      setSessionStart(Date.now());
      startBreathingCycle();
      startTimer();
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

  const startBreathingCycle = () => {
    const cycle = ['left', 'hold', 'right', 'rightIn', 'hold2', 'leftOut'] as const;
    let phaseIndex = 0;
    let leftBreathTime = 0;
    let rightBreathTime = 0;

    const executePhase = () => {
      if (!isPlaying) return;
      
      const currentPhase = cycle[phaseIndex];
      
      // Track nostril usage
      if (currentPhase === 'left' || currentPhase === 'leftOut') {
        setCurrentNostril('left');
        leftBreathTime += phases[currentPhase].duration;
      } else if (currentPhase === 'right' || currentPhase === 'rightIn') {
        setCurrentNostril('right');
        rightBreathTime += phases[currentPhase].duration;
      } else {
        setCurrentNostril('hold');
      }
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % cycle.length;
        
        if (phaseIndex === 0) {
          // Complete cycle
          setCycleCount(prev => prev + 1);
          setLeftTime(leftBreathTime);
          setRightTime(rightBreathTime);
          
          // Calculate balance ratio
          const total = leftBreathTime + rightBreathTime;
          const ratio = total > 0 ? (leftBreathTime / total) * 100 : 50;
          setBalanceRatio(ratio);
          
          // Calculate symmetry (closer to 50% is better)
          const symmetry = 100 - Math.abs(ratio - 50) * 2;
          setBreathSymmetry(Math.max(0, symmetry));
          
          leftBreathTime = 0;
          rightBreathTime = 0;
        }
        
        if (isPlaying) {
          executePhase();
        }
      }, phases[currentPhase].duration);
    };

    executePhase();
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCycleCount(0);
    setSessionTime(0);
    setBalanceRatio(50);
    setLeftTime(0);
    setRightTime(0);
    setBreathSymmetry(100);
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
      const duration = sessionTime;
      await api.post('/wellness-games/anulom-vilom', {
        cycles: cycleCount,
        duration,
        balanceRatio: Math.round(balanceRatio),
        breathSymmetry: Math.round(breathSymmetry),
        leftTime,
        rightTime,
        timestamp: new Date().toISOString()
      });
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('wellness-game-session-saved'));
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      savingRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhase = () => {
    if (currentNostril === 'left') return phases.left;
    if (currentNostril === 'right') return phases.right;
    return phases.hold;
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Anulom-Vilom</h1>
          <div className="w-10" />
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Nostril Visualization */}
          <div className="flex justify-center items-center mb-8" style={{ height: '400px' }}>
            <div className="relative">
              {/* Face/Nose Illustration */}
              <div className="relative">
                {/* Left Nostril */}
                <motion.div
                  className="absolute left-20 top-1/2 transform -translate-y-1/2"
                  animate={{
                    scale: currentNostril === 'left' ? [1, 1.2, 1] : 1,
                    opacity: currentNostril === 'left' ? [0.6, 1, 0.6] : 0.3
                  }}
                  transition={{
                    duration: 2,
                    repeat: currentNostril === 'left' ? Infinity : 0
                  }}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${phases.left.color} flex items-center justify-center shadow-lg border-4 border-white`}>
                    <span className="text-2xl">👃</span>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                    Left
                  </div>
                </motion.div>

                {/* Center (Nose Bridge) */}
                <div className="w-4 h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full mx-auto"></div>

                {/* Right Nostril */}
                <motion.div
                  className="absolute right-20 top-1/2 transform -translate-y-1/2"
                  animate={{
                    scale: currentNostril === 'right' ? [1, 1.2, 1] : 1,
                    opacity: currentNostril === 'right' ? [0.6, 1, 0.6] : 0.3
                  }}
                  transition={{
                    duration: 2,
                    repeat: currentNostril === 'right' ? Infinity : 0
                  }}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${phases.right.color} flex items-center justify-center shadow-lg border-4 border-white`}>
                    <span className="text-2xl">👃</span>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                    Right
                  </div>
                </motion.div>

                {/* Hold Indicator */}
                {currentNostril === 'hold' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Hold
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="text-center mb-6">
            <motion.div
              key={currentNostril}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-gray-900 mb-2"
            >
              {currentPhase.label}
            </motion.div>
            <div className="text-sm text-gray-600">
              Alternate nostril breathing for balance
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Start Practice</span>
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
                setSessionTime(0);
                setBalanceRatio(50);
                setLeftTime(0);
                setRightTime(0);
                setBreathSymmetry(100);
              }}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cycleCount}</div>
              <div className="text-sm text-gray-600">Cycles</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(balanceRatio)}%</div>
              <div className="text-sm text-gray-600">Balance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(breathSymmetry)}%</div>
              <div className="text-sm text-gray-600">Symmetry</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-teal-600" />
            <span>Yogic Breathing Practice</span>
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-2">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Close right nostril, breathe in through left (4 seconds)</li>
                <li>Hold breath (2 seconds)</li>
                <li>Close left nostril, breathe out through right (4 seconds)</li>
                <li>Breathe in through right (4 seconds)</li>
                <li>Hold breath (2 seconds)</li>
                <li>Breathe out through left (4 seconds)</li>
                <li>Repeat the cycle</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Balances left and right brain hemispheres</li>
                <li>Reduces stress and anxiety</li>
                <li>Improves focus and concentration</li>
                <li>Enhances respiratory function</li>
                <li>Promotes inner balance and harmony</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnulomVilomGame;

