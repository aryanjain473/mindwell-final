import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import Therapist from '../models/Therapist.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/appointment/book
// @desc    Book a new appointment
// @access  Private
router.post('/book', [
  authMiddleware,
  body('therapistId').isMongoId().withMessage('Valid therapist ID is required'),
  body('scheduledAt').isISO8601().withMessage('Valid appointment time is required'),
  body('duration').optional().isInt({ min: 15, max: 120 }),
  body('type').optional().isIn(['consultation', 'follow-up', 'emergency', 'assessment']),
  body('sessionType').optional().isIn(['video', 'audio', 'chat', 'in-person']),
  body('notes').optional().isString()
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

    const { therapistId, scheduledAt, duration = 50, type = 'consultation', sessionType = 'video', notes } = req.body;

    // Verify therapist exists and is available
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    if (!therapist.isVerified || !therapist.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Therapist is not available for appointments'
      });
    }

    // Check if therapist is available at the requested time
    const appointmentTime = new Date(scheduledAt);
    if (!therapist.isAvailableAt(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: 'Therapist is not available at the requested time'
      });
    }

    // Check for existing appointment conflicts
    const existingAppointment = await Appointment.findOne({
      $or: [
        {
          user: req.user.id,
          scheduledAt: appointmentTime,
          status: { $in: ['scheduled', 'confirmed'] }
        },
        {
          therapist: therapistId,
          scheduledAt: appointmentTime,
          status: { $in: ['scheduled', 'confirmed'] }
        }
      ]
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Calculate pricing
    const basePrice = therapist.sessionSettings.price;
    const finalPrice = basePrice; // Add discount logic here if needed

    // Create appointment
    const appointment = new Appointment({
      user: req.user.id,
      therapist: therapistId,
      scheduledAt: appointmentTime,
      duration,
      type,
      sessionType,
      pricing: {
        basePrice,
        currency: therapist.sessionSettings.currency,
        finalPrice,
        paymentStatus: 'pending'
      },
      notes: {
        userNotes: notes
      }
    });

    await appointment.save();

    // Populate appointment data
    await appointment.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'therapist', populate: { path: 'userId', select: 'firstName lastName' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment'
    });
  }
});

// @route   GET /api/appointment/my-appointments
// @desc    Get user's appointments
// @access  Private
router.get('/my-appointments', [
  authMiddleware,
  query('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']),
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

    // Get appointments
    const appointments = await Appointment.find(filter)
      .populate('therapist', 'specialization experience ratings')
      .populate('therapist.userId', 'firstName lastName profile.avatar')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAppointments: total,
          hasNext: skip + appointments.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

// @route   GET /api/appointment/therapist-appointments
// @desc    Get therapist's appointments
// @access  Private (Therapist only)
router.get('/therapist-appointments', [
  authMiddleware,
  query('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']),
  query('date').optional().isISO8601(),
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

    const { status, date, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { therapist: therapist._id };
    if (status) {
      filter.status = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.scheduledAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get appointments
    const appointments = await Appointment.find(filter)
      .populate('user', 'firstName lastName email profile.avatar')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAppointments: total,
          hasNext: skip + appointments.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

// @route   GET /api/appointment/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid appointment ID')
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

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'firstName lastName email profile.avatar')
      .populate('therapist', 'specialization experience ratings')
      .populate('therapist.userId', 'firstName lastName profile.avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (appointment.user._id.toString() !== req.user.id) {
      // Check if user is the therapist
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || appointment.therapist._id.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
});

// @route   PUT /api/appointment/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.put('/:id/cancel', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('reason').optional().isString()
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

    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to cancel
    if (appointment.user.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || appointment.therapist.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled at this time'
      });
    }

    // Calculate refund
    const refundAmount = appointment.calculateRefund();

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: appointment.user.toString() === req.user.id ? 'user' : 'therapist',
      cancelledAt: new Date(),
      reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'processed'
    };

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment,
        refundAmount
      }
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
});

// @route   PUT /api/appointment/:id/reschedule
// @desc    Reschedule an appointment
// @access  Private
router.put('/:id/reschedule', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('newScheduledAt').isISO8601().withMessage('Valid new appointment time is required'),
  body('reason').optional().isString()
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

    const { newScheduledAt, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to reschedule
    if (appointment.user.toString() !== req.user.id) {
      const therapist = await Therapist.findOne({ userId: req.user.id });
      if (!therapist || appointment.therapist.toString() !== therapist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if appointment can be rescheduled
    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be rescheduled at this time'
      });
    }

    // Verify new time is available
    const therapist = await Therapist.findById(appointment.therapist);
    const newAppointmentTime = new Date(newScheduledAt);
    
    if (!therapist.isAvailableAt(newAppointmentTime)) {
      return res.status(400).json({
        success: false,
        message: 'New time slot is not available'
      });
    }

    // Check for conflicts at new time
    const conflictAppointment = await Appointment.findOne({
      $or: [
        {
          user: appointment.user,
          scheduledAt: newAppointmentTime,
          status: { $in: ['scheduled', 'confirmed'] },
          _id: { $ne: appointment._id }
        },
        {
          therapist: appointment.therapist,
          scheduledAt: newAppointmentTime,
          status: { $in: ['scheduled', 'confirmed'] },
          _id: { $ne: appointment._id }
        }
      ]
    });

    if (conflictAppointment) {
      return res.status(400).json({
        success: false,
        message: 'New time slot is already booked'
      });
    }

    // Update appointment
    appointment.rescheduling = {
      originalTime: appointment.scheduledAt,
      rescheduledAt: new Date(),
      reason,
      rescheduledBy: appointment.user.toString() === req.user.id ? 'user' : 'therapist'
    };
    appointment.scheduledAt = newAppointmentTime;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rescheduling appointment'
    });
  }
});

// @route   PUT /api/appointment/:id/confirm
// @desc    Confirm an appointment
// @access  Private (Therapist only)
router.put('/:id/confirm', [
  authMiddleware,
  param('id').isMongoId().withMessage('Invalid appointment ID')
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

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if therapist owns this appointment
    if (appointment.therapist.toString() !== therapist._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is not in scheduled status'
      });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming appointment'
    });
  }
});

export default router;
