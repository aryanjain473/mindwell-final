import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Session from '../models/Session.js';
import Appointment from '../models/Appointment.js';
import Therapist from '../models/Therapist.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/session/start
// @desc    Start a new therapy session
// @access  Private
router.post('/start', [
  authMiddleware,
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('sessionData.moodBefore').optional().isInt({ min: 1, max: 10 }),
  body('sessionData.anxietyLevel').optional().isInt({ min: 1, max: 10 }),
  body('sessionData.stressLevel').optional().isInt({ min: 1, max: 10 }),
  body('sessionData.energyLevel').optional().isInt({ min: 1, max: 10 })
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

    const { appointmentId, sessionData } = req.body;

    // Verify appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId)
      .populate('therapist', 'userId')
      .populate('user', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to start this session
    if (appointment.user._id.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || appointment.therapist._id.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if appointment is ready to start
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const timeDiff = Math.abs(now.getTime() - appointmentTime.getTime()) / (1000 * 60); // minutes

    if (timeDiff > 15) { // Allow 15 minutes early/late
      return res.status(400).json({
        success: false,
        message: 'Session can only be started within 15 minutes of scheduled time'
      });
    }

    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment is not in a startable status'
      });
    }

    // Check if session already exists
    const existingSession = await Session.findOne({ appointment: appointmentId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Session already exists for this appointment'
      });
    }

    // Create new session
    const session = new Session({
      appointment: appointmentId,
      user: appointment.user._id,
      therapist: appointment.therapist._id,
      startedAt: now,
      sessionData,
      status: 'active'
    });

    await session.save();

    // Update appointment status
    appointment.status = 'in-progress';
    await appointment.save();

    // Generate meeting room details (in a real app, this would integrate with video service)
    const meetingDetails = {
      roomId: `session_${session._id}`,
      meetingUrl: `https://meet.mindwell.com/${session._id}`,
      meetingPassword: generateMeetingPassword(),
      platform: 'custom'
    };

    // Update appointment with meeting details
    appointment.meetingDetails = meetingDetails;
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: {
        session,
        meetingDetails
      }
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting session'
    });
  }
});

// @route   PUT /api/session/:id/end
// @desc    End a therapy session
// @access  Private
router.put('/:id/end', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('sessionData.moodAfter').optional().isInt({ min: 1, max: 10 }),
  body('notes.therapistNotes').optional().isString(),
  body('notes.userNotes').optional().isString(),
  body('notes.sessionSummary').optional().isString(),
  body('goals').optional().isArray()
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

    const { sessionData, notes, goals } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has permission to end this session
    if (session.user.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || session.therapist.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active'
      });
    }

    // Update session data
    if (sessionData) {
      Object.keys(sessionData).forEach(key => {
        if (sessionData[key] !== undefined) {
          session.sessionData[key] = sessionData[key];
        }
      });
    }

    if (notes) {
      Object.keys(notes).forEach(key => {
        if (notes[key] !== undefined) {
          session.notes[key] = notes[key];
        }
      });
    }

    if (goals) {
      session.goals = goals;
    }

    // End the session
    await session.endSession();

    // Update appointment status
    const appointment = await Appointment.findById(session.appointment);
    if (appointment) {
      appointment.status = 'completed';
      await appointment.save();
    }

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: session
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending session'
    });
  }
});

// @route   GET /api/session/:id
// @desc    Get session details
// @access  Private
router.get('/:id', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid session ID')
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

    const session = await Session.findById(req.params.id)
      .populate('appointment', 'scheduledAt duration type sessionType')
      .populate('user', 'firstName lastName profile.avatar')
      .populate('therapist', 'specialization experience')
      .populate('therapist.userId', 'firstName lastName profile.avatar');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has access to this session
    if (session.user._id.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || session.therapist._id.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session'
    });
  }
});

// @route   GET /api/session/my-sessions
// @desc    Get user's sessions
// @access  Private
router.get('/my-sessions', [
  authMiddleware,
  query('status').optional().isIn(['active', 'completed', 'interrupted', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { user: req.user.id };
    if (status) {
      filter.status = status;
    }

    // Get sessions
    const sessions = await Session.find(filter)
      .populate('appointment', 'scheduledAt duration type sessionType')
      .populate('therapist', 'specialization experience ratings')
      .populate('therapist.userId', 'firstName lastName profile.avatar')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSessions: total,
          hasNext: skip + sessions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// @route   GET /api/session/therapist-sessions
// @desc    Get therapist's sessions
// @access  Private (Therapist only)
router.get('/therapist-sessions', [
  authMiddleware,
  query('status').optional().isIn(['active', 'completed', 'interrupted', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    // Check if user is a therapist
    const therapist = await Therapist.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Therapist profile required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { therapist: therapist._id };
    if (status) {
      filter.status = status;
    }

    // Get sessions
    const sessions = await Session.find(filter)
      .populate('appointment', 'scheduledAt duration type sessionType')
      .populate('user', 'firstName lastName profile.avatar')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSessions: total,
          hasNext: skip + sessions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// @route   POST /api/session/:id/chat
// @desc    Add chat message to session
// @access  Private
router.post('/:id/chat', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('message').notEmpty().withMessage('Message is required'),
  body('messageType').optional().isIn(['text', 'file', 'image', 'link']),
  body('attachments').optional().isArray()
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

    const { message, messageType = 'text', attachments = [] } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has access to this session
    if (session.user.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || session.therapist.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Determine sender
    const sender = session.user.toString() === req.user.id ? 'user' : 'therapist';

    // Add chat message
    await session.addChatMessage(sender, message, messageType, attachments);

    res.json({
      success: true,
      message: 'Message added successfully',
      data: session.chat[session.chat.length - 1]
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding chat message'
    });
  }
});

// @route   POST /api/session/:id/emergency
// @desc    Trigger emergency protocol
// @access  Private
router.post('/:id/emergency', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('reason').notEmpty().withMessage('Emergency reason is required'),
  body('actionTaken').notEmpty().withMessage('Action taken is required')
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

    const { reason, actionTaken } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has access to this session
    if (session.user.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || session.therapist.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Trigger emergency protocol
    await session.triggerEmergency(reason, actionTaken);

    // TODO: Implement emergency contact notification
    // TODO: Implement crisis intervention protocols

    res.json({
      success: true,
      message: 'Emergency protocol triggered successfully',
      data: session.emergency
    });
  } catch (error) {
    console.error('Error triggering emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering emergency'
    });
  }
});

// Helper function to generate meeting password
function generateMeetingPassword() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default router;
