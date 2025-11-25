import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play, Pause, RotateCcw, ArrowLeft, Waves, Bed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const DreamWavesGame = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [sessionTime, setSessionTime] = useState(0);
  const [waveCount, setWaveCount] = useState(0);
  const [relaxationLevel, setRelaxationLevel] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  const phases = {
    inhale: { duration: 5000, label: 'Breathe In Slowly', color: 'from-indigo-400 to-purple-400' },
    exhale: { duration: 7000, label: 'Breathe Out Slowly', color: 'from-purple-400 to-indigo-400' }
  };

  useEffect(() => {
    if (isPlaying) {
      setSessionStart(Date.now());
      startBreathingCycle();
      startRelaxationTimer();
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
    const cycle = ['inhale', 'exhale'] as const;
    let phaseIndex = 0;

    const executePhase = () => {
      if (!isPlaying) return;
      
      const currentPhase = cycle[phaseIndex];
      setPhase(currentPhase);
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % cycle.length;
        if (phaseIndex === 0) {
          setWaveCount(prev => prev + 1);
          // Increase relaxation level with each cycle
          setRelaxationLevel(prev => Math.min(100, prev + 2));
        }
        if (isPlaying) {
          executePhase();
        }
      }, phases[currentPhase].duration);
    };

    executePhase();
  };

  const startRelaxationTimer = () => {
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
      // Gradually increase relaxation over time
      setRelaxationLevel(prev => Math.min(100, prev + 0.1));
    }, 1000);
  };

  const handleStart = () => {
    setIsPlaying(true);
    setSessionTime(0);
    setWaveCount(0);
    setRelaxationLevel(0);
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
      const sleepReadiness = Math.min(100, Math.round(relaxationLevel + (waveCount * 5)));
      await api.post('/wellness-games/dream-waves', {
        duration,
        waveCount,
        relaxationLevel: Math.round(relaxationLevel),
        sleepReadiness,
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

  const currentPhase = phases[phase];
  const waveAmplitude = phase === 'inhale' ? 1.2 : 0.8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/wellness-games')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Moon className="h-6 w-6" />
            <span>Dream Waves</span>
          </h1>
          <div className="w-10" />
        </div>

        {/* Main Game Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6 border border-white/20">
          {/* Wave Visualization */}
          <div className="flex justify-center items-center mb-8" style={{ height: '400px' }}>
            <div className="relative w-full h-full overflow-hidden">
              {/* Waves */}
              {[0, 1, 2].map((waveIndex) => (
                <motion.div
                  key={waveIndex}
                  className="absolute bottom-0 left-0 right-0"
                  animate={{
                    scaleY: waveAmplitude,
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: phases[phase].duration / 1000,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    height: `${30 + waveIndex * 20}%`,
                    background: `linear-gradient(to top, ${waveIndex === 0 ? 'rgba(99, 102, 241, 0.6)' : waveIndex === 1 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.3)'})`,
                    clipPath: `polygon(0 ${100 - (waveIndex * 10)}%, 100% ${100 - (waveIndex * 15)}%, 100% 100%, 0% 100%)`
                  }}
                />
              ))}
              
              {/* Moon */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl"
                >
                  <Moon className="h-12 w-12 text-indigo-900 mx-auto mt-6" />
                </motion.div>
              </div>

              {/* Phase Indicator */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-semibold mb-2"
                >
                  {currentPhase.label}
                </motion.div>
                <div className="text-sm opacity-80">
                  Follow the waves to relax
                </div>
              </div>
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
                <span>Start Relaxation</span>
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
                setSessionTime(0);
                setWaveCount(0);
                setRelaxationLevel(0);
              }}
              className="flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur">
              <div className="text-2xl font-bold">{formatTime(sessionTime)}</div>
              <div className="text-sm opacity-80">Duration</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur">
              <div className="text-2xl font-bold">{waveCount}</div>
              <div className="text-sm opacity-80">Waves</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur">
              <div className="text-2xl font-bold">{Math.round(relaxationLevel)}%</div>
              <div className="text-sm opacity-80">Relaxed</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur">
              <div className="text-2xl font-bold flex items-center justify-center">
                {relaxationLevel > 70 ? <Bed className="h-6 w-6" /> : <Waves className="h-6 w-6" />}
              </div>
              <div className="text-sm opacity-80">Status</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Moon className="h-5 w-5" />
            <span>Bedtime Relaxation</span>
          </h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li>• Practice 10-15 minutes before bedtime</li>
            <li>• Breathe in slowly (5 seconds) - feel the wave rise</li>
            <li>• Breathe out slowly (7 seconds) - feel the wave fall</li>
            <li>• Let your body relax with each breath</li>
            <li>• Focus on the gentle waves to prepare for sleep</li>
            <li>• Higher relaxation levels indicate better sleep readiness</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DreamWavesGame;

