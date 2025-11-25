import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { AcademicStressLog, AcademicStressPattern } from '../models/AcademicStress.js';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateRoutine, generateInsights } from '../services/stressRoutineGenerator.js';
import { detectPatterns } from '../services/stressPatternDetector.js';

const router = express.Router();

// Test endpoint to verify route is accessible
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Stress route is working!' });
});

// Diagnostic endpoint to check if models are loaded
router.get('/diagnostic', (req, res) => {
  try {
    const modelsLoaded = {
      AcademicStressLog: !!AcademicStressLog,
      AcademicStressPattern: !!AcademicStressPattern,
      Activity: !!Activity
    };
    res.json({ success: true, modelsLoaded });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Calculate stress score from form data
const calculateStressScore = (workload, deadlines, concentration, sleep, emotionTags) => {
  // Base score from factors (inverted for concentration and sleep - lower is worse)
  const workloadScore = workload * 10;
  const deadlineScore = deadlines * 10;
  const concentrationScore = (11 - concentration) * 5; // Inverted
  const sleepScore = (11 - sleep) * 5; // Inverted
  
  // Emotion multiplier
  const emotionMultiplier = emotionTags.length > 0 ? 1 + (emotionTags.length * 0.1) : 1;
  
  // Weighted average
  const baseScore = (workloadScore + deadlineScore + concentrationScore + sleepScore) / 4;
  const finalScore = Math.min(100, Math.round(baseScore * emotionMultiplier));
  
  return finalScore;
};

/**
 * @route   POST /api/stress/submit
 * @desc    Submit academic stress check
 * @access  Private
 */
router.post('/submit', [
  authMiddleware,
  body('workload').toInt().isInt({ min: 1, max: 10 }).withMessage('Workload must be between 1 and 10'),
  body('deadlines').toInt().isInt({ min: 1, max: 10 }).withMessage('Deadlines must be between 1 and 10'),
  body('concentration').toInt().isInt({ min: 1, max: 10 }).withMessage('Concentration must be between 1 and 10'),
  body('sleep').toInt().isInt({ min: 1, max: 10 }).withMessage('Sleep must be between 1 and 10'),
  body('emotionTags').isArray().withMessage('Emotion tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { workload, deadlines, concentration, sleep, emotionTags } = req.body;
    
    console.log('Stress check submission - userId:', userId);
    console.log('Stress check submission - data:', { workload, deadlines, concentration, sleep, emotionTags });

    // Validate emotion tags manually
    const validEmotions = ['Anxious', 'Overwhelmed', 'Confused', 'Bored', 'Frustrated'];
    if (!Array.isArray(emotionTags)) {
      return res.status(400).json({
        success: false,
        message: 'Emotion tags must be an array'
      });
    }
    
    const invalidEmotions = emotionTags.filter(emotion => !validEmotions.includes(emotion));
    if (invalidEmotions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid emotion tags: ${invalidEmotions.join(', ')}`
      });
    }

    // Calculate stress score
    const stressScore = calculateStressScore(workload, deadlines, concentration, sleep, emotionTags);

    // Get existing patterns for routine generation
    const patternDoc = await AcademicStressPattern.findOne({ userId }).lean();
    const patterns = patternDoc?.patterns || null;

    // Get recent stress logs to check for consecutive high stress days
    const recentLogs = await AcademicStressLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    const highStressDays = recentLogs.filter(log => log.stressScore >= 70).length;
    const stressData = {
      workload,
      deadlines,
      concentration,
      sleep,
      emotionTags,
      stressScore,
      consecutiveHighStressDays: highStressDays
    };

    // Generate personalized routine
    let recommendedRoutine;
    let insights;
    try {
      recommendedRoutine = generateRoutine(stressData, patterns);
      insights = generateInsights(stressData, patterns);
    } catch (routineError) {
      console.error('Error generating routine or insights:', routineError);
      // Use default routine if generation fails
      recommendedRoutine = {
        type: 'balanced',
        duration: 5,
        steps: [{
          id: 'breathing',
          title: '5-Minute Breathing Exercise',
          description: 'Take a moment to breathe and center yourself',
          game: 'heart-calm',
          duration: 5,
          order: 1,
          icon: '💨'
        }],
        rationale: 'Take a moment to breathe and center yourself.'
      };
      insights = [{
        type: 'info',
        title: 'Stress Check Complete',
        message: 'Your stress check has been recorded. Try some breathing exercises to help manage stress.',
        icon: '✅'
      }];
    }

    // Save stress log
    let stressLog;
    try {
      stressLog = new AcademicStressLog({
        userId,
        workload,
        deadlines,
        concentration,
        sleep,
        emotionTags,
        stressScore,
        recommendedRoutine
      });

      await stressLog.save();
      console.log('Stress log saved successfully:', stressLog._id);
    } catch (saveError) {
      console.error('Error saving stress log:', saveError);
      throw new Error(`Failed to save stress log: ${saveError.message}`);
    }

    // Create activity entry
    try {
      await Activity.create({
        userId,
        type: 'session',
        activities: ['Academic Stress Check'],
        notes: `Stress score: ${stressScore}/100`,
        tags: ['academic', 'stress', 'wellness'],
        metadata: {
          stressScore,
          workload,
          deadlines,
          concentration,
          sleep,
          emotionTags
        }
      });
      console.log('Activity entry created successfully');
    } catch (activityError) {
      console.error('Error creating activity entry:', activityError);
      // Don't fail the request if activity creation fails
    }

    // Trigger pattern detection (async, don't wait)
    detectPatterns(userId).catch(err => {
      console.error('Error detecting patterns:', err);
    });

    res.json({
      success: true,
      message: 'Stress check submitted successfully',
      data: {
        stressScore,
        recommendedRoutine,
        insights,
        logId: stressLog._id
      }
    });

  } catch (error) {
    console.error('Error submitting stress check:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit stress check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   GET /api/stress/history
 * @desc    Get user's stress check history
 * @access  Private
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 30;

    const history = await AcademicStressLog.getUserHistory(userId, limit);

    res.json({
      success: true,
      data: {
        history,
        count: history.length
      }
    });

  } catch (error) {
    console.error('Error fetching stress history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stress history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/stress/patterns
 * @desc    Get detected stress patterns for user
 * @access  Private
 */
router.get('/patterns', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get or generate patterns
    let patternDoc = await AcademicStressPattern.findOne({ userId }).lean();
    
    if (!patternDoc || !patternDoc.patterns) {
      // Generate patterns if they don't exist
      const patterns = await detectPatterns(userId);
      if (patterns) {
        patternDoc = await AcademicStressPattern.findOne({ userId }).lean();
      }
    }

    res.json({
      success: true,
      data: {
        patterns: patternDoc?.patterns || null,
        lastUpdated: patternDoc?.lastUpdated || null
      }
    });

  } catch (error) {
    console.error('Error fetching stress patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stress patterns',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/stress/stats
 * @desc    Get stress statistics (streak, latest score, etc.)
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get streak
    const streak = await AcademicStressLog.getStreak(userId);

    // Get latest log
    const latestLog = await AcademicStressLog.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get recent patterns
    const recentPatterns = await AcademicStressLog.getRecentPatterns(userId, 7);

    res.json({
      success: true,
      data: {
        streak,
        latestScore: latestLog?.stressScore || null,
        latestCheck: latestLog?.createdAt || null,
        recentPatterns
      }
    });

  } catch (error) {
    console.error('Error fetching stress stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stress stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/stress/routine-effectiveness/:logId
 * @desc    Update routine effectiveness rating
 * @access  Private
 */
router.put('/routine-effectiveness/:logId', [
  authMiddleware,
  body('effectiveness').isInt({ min: 0, max: 10 }).withMessage('Effectiveness must be between 0 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { logId } = req.params;
    const { effectiveness } = req.body;

    const log = await AcademicStressLog.findOneAndUpdate(
      { _id: logId, userId },
      { routineEffectiveness: effectiveness },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Stress log not found'
      });
    }

    res.json({
      success: true,
      message: 'Routine effectiveness updated',
      data: log
    });

  } catch (error) {
    console.error('Error updating routine effectiveness:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update routine effectiveness',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

