import express from 'express';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await Activity.getUserStats(userId);
    
    // Calculate streak days
    const streakDays = await calculateStreakDays(userId);
    
    res.json({
      success: true,
      data: {
        ...stats,
        streakDays,
        averageMood: Math.round(stats.averageMood * 10) / 10 || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get recent activities
router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.getRecentActivities(userId, limit);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// Log mood
router.post('/mood', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mood, notes, activities } = req.body;

    if (!mood || mood < 1 || mood > 10) {
      return res.status(400).json({
        success: false,
        message: 'Mood must be between 1 and 10'
      });
    }

    const activity = new Activity({
      userId,
      type: 'mood',
      mood,
      notes: notes || '',
      activities: activities || []
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Mood logged successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log mood'
    });
  }
});

// Get mood history
router.get('/mood-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 30;
    
    const moodHistory = await Activity.getMoodHistory(userId, days);
    
    res.json({
      success: true,
      data: moodHistory
    });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood history'
    });
  }
});

// Helper function to calculate streak days
async function calculateStreakDays(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streakDays = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const startOfDay = new Date(currentDate);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const hasActivity = await Activity.findOne({
        userId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      if (hasActivity) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streakDays;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

export default router;
