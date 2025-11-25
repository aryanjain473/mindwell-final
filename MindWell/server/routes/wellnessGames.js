import express from 'express';
import WellnessGame from '../models/WellnessGame.js';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all game stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await WellnessGame.getUserGameStats(userId);
    
    // Format stats into object
    const statsObj = {};
    stats.forEach(stat => {
      statsObj[stat._id] = {
        sessions: stat.sessions,
        lastPlayed: stat.lastPlayed,
        bestScore: Math.round(stat.bestScore || 0),
        avgScore: Math.round(stat.avgScore || 0),
        totalDuration: stat.totalDuration
      };
    });

    res.json({
      success: true,
      data: statsObj
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game statistics'
    });
  }
});

// Heart Calm Game
router.post('/heart-calm', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cycles, calmnessIndex, avgInhale, avgExhale, duration, sessionData } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'heart-calm',
      gameData: {
        cycles,
        calmnessIndex,
        avgInhale,
        avgExhale,
        sessionData
      },
      cycles,
      calmnessIndex,
      duration,
      score: Math.round(calmnessIndex || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Deep Breathing'],
      duration: Math.floor(duration / 60), // Convert to minutes
      tags: ['breathing', 'relaxation', 'heart-calm']
    });

    res.json({
      success: true,
      message: 'Heart Calm session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Heart Calm session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Gratitude Wheel Game
router.post('/gratitude-wheel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gratitudes, count, timestamp } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'gratitude-wheel',
      gameData: {
        gratitudes,
        count
      },
      gratitudeCount: count,
      duration: 0,
      score: count * 10 // 10 points per gratitude
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Gratitude Practice'],
      notes: `Expressed gratitude for ${count} things`,
      tags: ['gratitude', 'positivity', 'reflection']
    });

    res.json({
      success: true,
      message: 'Gratitude session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Gratitude Wheel session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Lotus Bloom Game
router.post('/lotus-bloom', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bloomPercentage, focusDuration, breathCount, focusScore, duration } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'lotus-bloom',
      gameData: {
        bloomPercentage,
        focusDuration,
        breathCount,
        focusScore
      },
      bloomPercentage,
      focusDuration,
      cycles: breathCount,
      duration,
      score: Math.round(focusScore || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Meditation', 'Deep Breathing'],
      duration: Math.floor(duration / 60),
      tags: ['meditation', 'focus', 'lotus-bloom']
    });

    res.json({
      success: true,
      message: 'Lotus Bloom session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Lotus Bloom session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Candle Focus Game
router.post('/candle-focus', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { focusDuration, bestTime, distractions, flameStability, focusScore, duration } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'candle-focus',
      gameData: {
        focusDuration,
        bestTime,
        distractions,
        flameStability,
        focusScore
      },
      focusDuration,
      duration,
      score: Math.round(focusScore || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Meditation'],
      duration: Math.floor(duration / 60),
      tags: ['meditation', 'focus', 'attention', 'candle-focus']
    });

    res.json({
      success: true,
      message: 'Candle Focus session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Candle Focus session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Thought Cloud Game
router.post('/thought-cloud', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { totalThoughts, negativeThoughts, releasedCount, sessionScore, timestamp } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'thought-cloud',
      gameData: {
        totalThoughts,
        negativeThoughts,
        releasedCount,
        sessionScore
      },
      releasedThoughts: releasedCount,
      duration: 0,
      score: Math.round(sessionScore || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Gratitude Practice'],
      notes: `Released ${releasedCount} negative thoughts`,
      tags: ['emotional-regulation', 'cbt', 'thought-cloud']
    });

    res.json({
      success: true,
      message: 'Thought Cloud session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Thought Cloud session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Dream Waves Game
router.post('/dream-waves', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { duration, waveCount, relaxationLevel, sleepReadiness, timestamp } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'dream-waves',
      gameData: {
        waveCount,
        relaxationLevel,
        sleepReadiness
      },
      cycles: waveCount,
      relaxationLevel,
      sleepReadiness,
      duration,
      score: Math.round(sleepReadiness || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Deep Breathing', 'Sleep'],
      duration: Math.floor(duration / 60),
      tags: ['sleep', 'relaxation', 'breathing', 'dream-waves']
    });

    res.json({
      success: true,
      message: 'Dream Waves session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Dream Waves session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Anulom-Vilom Game
router.post('/anulom-vilom', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cycles, duration, balanceRatio, breathSymmetry, leftTime, rightTime, timestamp } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'anulom-vilom',
      gameData: {
        cycles,
        balanceRatio,
        breathSymmetry,
        leftTime,
        rightTime
      },
      cycles,
      balanceRatio,
      breathSymmetry,
      duration,
      score: Math.round(breathSymmetry || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Yoga', 'Deep Breathing'],
      duration: Math.floor(duration / 60),
      tags: ['yoga', 'breathing', 'anulom-vilom', 'balance']
    });

    res.json({
      success: true,
      message: 'Anulom-Vilom session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Anulom-Vilom session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Music Listening Game
router.post('/music-listening', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { duration, sound, timerMinutes, timerSeconds, score } = req.body;

    const gameSession = new WellnessGame({
      userId,
      gameType: 'music-listening',
      gameData: {
        sound,
        timerMinutes,
        timerSeconds,
        completed: true
      },
      duration: duration || 0,
      score: Math.round(score || 0)
    });

    await gameSession.save();

    // Create activity entry
    await Activity.create({
      userId,
      type: 'session',
      activities: ['Music & Sound Therapy'],
      duration: Math.floor((duration || 0) / 60),
      notes: `Listened to ${sound || 'calming sounds'}`,
      tags: ['music', 'sound-therapy', 'relaxation', 'music-listening']
    });

    res.json({
      success: true,
      message: 'Music Listening session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving Music Listening session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

// Generic session endpoint (for backward compatibility)
router.post('/session', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gameId, duration, score, metadata } = req.body;

    // Map gameId to gameType
    const gameTypeMap = {
      'music-listening': 'music-listening',
      'heart-calm': 'heart-calm',
      'gratitude-wheel': 'gratitude-wheel',
      'lotus-bloom': 'lotus-bloom',
      'candle-focus': 'candle-focus',
      'thought-cloud': 'thought-cloud',
      'dream-waves': 'dream-waves',
      'anulom-vilom': 'anulom-vilom'
    };

    const gameType = gameTypeMap[gameId] || gameId;

    const gameSession = new WellnessGame({
      userId,
      gameType,
      gameData: metadata || {},
      duration: duration || 0,
      score: Math.round(score || 0)
    });

    await gameSession.save();

    res.json({
      success: true,
      message: 'Game session saved successfully',
      data: gameSession
    });
  } catch (error) {
    console.error('Error saving game session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session'
    });
  }
});

export default router;

