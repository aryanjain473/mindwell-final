import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import Content from '../models/Content.js';
import Notification from '../models/Notification.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// ==================== DASHBOARD ANALYTICS ====================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: last7Days }
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: last30Days }
    });

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get subscription distribution
    const subscriptions = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily signups for chart
    const dailySignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get activity statistics
    const totalSessions = await Analytics.countDocuments({
      eventType: 'session_start',
      timestamp: { $gte: last30Days }
    });

    const totalChatbotInteractions = await Analytics.countDocuments({
      eventType: 'chatbot_interaction',
      timestamp: { $gte: last30Days }
    });

    const totalMoodEntries = await Analytics.countDocuments({
      eventType: 'mood_tracking',
      timestamp: { $gte: last30Days }
    });

    // Get recent activity
    const recentActivity = await Analytics.find({
      timestamp: { $gte: last7Days }
    })
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          totalSessions,
          totalChatbotInteractions,
          totalMoodEntries
        },
        userRoles,
        subscriptions,
        dailySignups,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('role').optional().isIn(['user', 'therapist', 'admin']).withMessage('Invalid role'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['createdAt', 'lastLogin', 'firstName', 'email']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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

    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity summary
    const activitySummary = await Analytics.getUserActivity(id, 30);

    res.json({
      success: true,
      data: {
        user,
        activitySummary
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Admin
router.put('/users/:id', [
  body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'therapist', 'admin']),
  body('isActive').optional().isBoolean(),
  body('subscriptionStatus').optional().isIn(['free', 'premium', 'family'])
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

    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if email is being updated and if it's already taken
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete)
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== ANALYTICS ====================

// @route   GET /api/admin/analytics/overview
// @desc    Get analytics overview
// @access  Admin
router.get('/analytics/overview', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get platform analytics
    const platformAnalytics = await Analytics.getPlatformAnalytics(parseInt(days));

    // Get event type distribution
    const eventDistribution = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily active users
    const dailyActiveUsers = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          activeUsers: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        platformAnalytics,
        eventDistribution,
        dailyActiveUsers
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== CONTENT MANAGEMENT ====================

// @route   GET /api/admin/content
// @desc    Get all content with pagination
// @access  Admin
router.get('/content', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      category = '',
      search = ''
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const content = await Content.find(filter)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalContent = await Content.countDocuments(filter);
    const totalPages = Math.ceil(totalContent / limit);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalContent,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/admin/content
// @desc    Create new content
// @access  Admin
router.post('/content', [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['article', 'video', 'exercise', 'resource', 'announcement']),
  body('category').isIn(['anxiety', 'depression', 'stress', 'mindfulness', 'therapy', 'self-care', 'crisis', 'general']),
  body('status').optional().isIn(['draft', 'published', 'archived'])
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

    const contentData = {
      ...req.body,
      author: req.user.userId
    };

    if (contentData.status === 'published') {
      contentData.publishedAt = new Date();
    }

    const content = new Content(contentData);
    await content.save();

    await content.populate('author', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });

  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== NOTIFICATIONS ====================

// @route   GET /api/admin/notifications
// @desc    Get all notifications
// @access  Admin
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalNotifications,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/admin/notifications
// @desc    Create and send notification
// @access  Admin
router.post('/notifications', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'warning', 'success', 'error', 'announcement']),
  body('targetAudience').isIn(['all', 'registered', 'premium', 'specific']),
  body('deliveryMethod').isArray().withMessage('Delivery method must be an array')
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

    const notificationData = {
      ...req.body,
      createdBy: req.user.userId,
      status: 'sent',
      sentAt: new Date()
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // TODO: Implement actual notification sending logic
    // This would integrate with email service, push notifications, etc.

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== REPORTS ====================

// @route   GET /api/admin/reports/users
// @desc    Export user data as CSV
// @access  Admin
router.get('/reports/users', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const users = await User.find({})
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,First Name,Last Name,Email,Role,Status,Subscription,Created At,Last Login\n';
      const csvData = users.map(user => 
        `${user._id},${user.firstName},${user.lastName},${user.email},${user.role},${user.isActive ? 'Active' : 'Inactive'},${user.subscriptionStatus},${user.createdAt},${user.lastLogin || 'Never'}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: users
      });
    }

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
