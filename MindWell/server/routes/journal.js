import express from 'express';
import Journal from '../models/Journal.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all journal entries for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const journals = await Journal.getUserJournals(userId, page, limit);
    
    res.json({
      success: true,
      data: journals,
      pagination: {
        page,
        limit,
        total: journals.length
      }
    });
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries'
    });
  }
});

// Get journal entry by date
router.get('/date/:date', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;
    
    const journal = await Journal.getJournalByDate(userId, date);
    
    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Error fetching journal by date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entry'
    });
  }
});

// Get journal statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await Journal.getJournalStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal statistics'
    });
  }
});

// Search journal entries
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const journals = await Journal.searchJournals(userId, query, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: journals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: journals.length
      }
    });
  } catch (error) {
    console.error('Error searching journals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search journal entries'
    });
  }
});

// Create a new journal entry
router.post('/', [
  authMiddleware,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  body('mood').isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('weather').optional().isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'stormy']).withMessage('Invalid weather type'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('gratitude').optional().isArray().withMessage('Gratitude must be an array'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('reflection').optional().isLength({ max: 1000 }).withMessage('Reflection must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user.userId;
    const {
      title,
      content,
      mood,
      tags = [],
      weather = 'sunny',
      activities = [],
      gratitude = [],
      goals = [],
      reflection = '',
      isPrivate = true
    } = req.body;
    
    // Check if journal entry already exists for today
    const today = new Date();
    const existingEntry = await Journal.getJournalByDate(userId, today);
    
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry already exists for today. Use PUT to update it.'
      });
    }
    
    const journal = new Journal({
      userId,
      title,
      content,
      mood,
      tags,
      weather,
      activities,
      gratitude,
      goals,
      reflection,
      isPrivate
    });
    
    await journal.save();
    
    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journal
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry'
    });
  }
});

// Update a journal entry
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  body('mood').optional().isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('weather').optional().isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'stormy']).withMessage('Invalid weather type'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('gratitude').optional().isArray().withMessage('Gratitude must be an array'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('reflection').optional().isLength({ max: 1000 }).withMessage('Reflection must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user.userId;
    const { id } = req.params;
    const updateData = req.body;
    
    const journal = await Journal.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: journal
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry'
    });
  }
});

// Delete a journal entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const journal = await Journal.findOneAndDelete({ _id: id, userId });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry'
    });
  }
});

// Get or create today's journal entry
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    
    let journal = await Journal.getJournalByDate(userId, today);
    
    if (!journal) {
      // Create a template for today's entry
      journal = {
        title: `Journal Entry - ${today.toLocaleDateString()}`,
        content: '',
        mood: 5,
        tags: [],
        weather: 'sunny',
        activities: [],
        gratitude: [],
        goals: [],
        reflection: '',
        isPrivate: true,
        isNew: true
      };
    }
    
    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Error fetching today\'s journal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s journal entry'
    });
  }
});

export default router;
