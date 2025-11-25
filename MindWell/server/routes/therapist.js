import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Therapist from '../models/Therapist.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/therapist/directory
// @desc    Get therapist directory with filters
// @access  Public
router.get('/directory', [
  query('specialization').optional().isString(),
  query('language').optional().isString(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('experience').optional().isNumeric(),
  query('rating').optional().isNumeric(),
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

    const {
      specialization,
      language,
      minPrice,
      maxPrice,
      experience,
      rating,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    };

    if (specialization) {
      filter.specialization = { $in: specialization.split(',') };
    }

    if (language) {
      filter.languages = { $in: language.split(',') };
    }

    if (minPrice || maxPrice) {
      filter['sessionSettings.price'] = {};
      if (minPrice) filter['sessionSettings.price'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['sessionSettings.price'].$lte = parseFloat(maxPrice);
    }

    if (experience) {
      filter.experience = { $gte: parseInt(experience) };
    }

    if (rating) {
      filter['ratings.average'] = { $gte: parseFloat(rating) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get therapists with populated user data
    const therapists = await Therapist.find(filter)
      .populate('userId', 'firstName lastName email profile.avatar')
      .sort({ 'ratings.average': -1, 'ratings.count': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Therapist.countDocuments(filter);

    res.json({
      success: true,
      data: {
        therapists: therapists.map(therapist => ({
          ...therapist.getPublicProfile(),
          user: therapist.userId
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalTherapists: total,
          hasNext: skip + therapists.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching therapist directory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching therapists'
    });
  }
});

// @route   GET /api/therapist/:id
// @desc    Get therapist profile by ID
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid therapist ID')
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

    const therapist = await Therapist.findById(req.params.id)
      .populate('userId', 'firstName lastName email profile.avatar');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...therapist.getPublicProfile(),
        user: therapist.userId,
        availability: therapist.availability,
        profile: therapist.profile
      }
    });
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching therapist profile'
    });
  }
});

// @route   GET /api/therapist/:id/availability
// @desc    Get therapist availability for a specific date range
// @access  Public
router.get('/:id/availability', [
  param('id').isMongoId().withMessage('Invalid therapist ID'),
  query('startDate').isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').isISO8601().withMessage('End date must be valid ISO date')
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

    const { startDate, endDate } = req.query;
    const therapist = await Therapist.findById(req.params.id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    // Generate available time slots
    const availableSlots = generateAvailableSlots(
      therapist.availability,
      new Date(startDate),
      new Date(endDate),
      therapist.sessionSettings.duration
    );

    res.json({
      success: true,
      data: {
        therapistId: therapist._id,
        duration: therapist.sessionSettings.duration,
        availableSlots
      }
    });
  } catch (error) {
    console.error('Error fetching therapist availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability'
    });
  }
});

// @route   POST /api/therapist/register
// @desc    Register as a therapist
// @access  Private (User must be authenticated)
router.post('/register', [
  authMiddleware,
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('specialization').isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('experience').isNumeric({ min: 0 }).withMessage('Experience must be a positive number'),
  body('education').isArray({ min: 1 }).withMessage('At least one education entry is required'),
  body('languages').isArray({ min: 1 }).withMessage('At least one language is required'),
  body('sessionSettings.price').isNumeric({ min: 0 }).withMessage('Session price is required'),
  body('availability.timezone').notEmpty().withMessage('Timezone is required'),
  body('availability.workingHours').isArray({ min: 1 }).withMessage('Working hours are required')
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

    // Check if user already has a therapist profile
    const existingTherapist = await Therapist.findOne({ userId: req.user.id });
    if (existingTherapist) {
      return res.status(400).json({
        success: false,
        message: 'Therapist profile already exists for this user'
      });
    }

    // Create therapist profile
    const therapistData = {
      userId: req.user.id,
      ...req.body
    };

    const therapist = new Therapist(therapistData);
    await therapist.save();

    // Update user role to therapist
    await User.findByIdAndUpdate(req.user.id, { role: 'therapist' });

    res.status(201).json({
      success: true,
      message: 'Therapist profile created successfully. Pending verification.',
      data: {
        therapistId: therapist._id,
        verificationStatus: therapist.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error creating therapist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating therapist profile'
    });
  }
});

// @route   PUT /api/therapist/profile
// @desc    Update therapist profile
// @access  Private (Therapist only)
router.put('/profile', [
  authMiddleware,
  body('specialization').optional().isArray(),
  body('experience').optional().isNumeric({ min: 0 }),
  body('languages').optional().isArray(),
  body('sessionSettings.price').optional().isNumeric({ min: 0 }),
  body('profile.bio').optional().isLength({ max: 1000 }),
  body('profile.approach').optional().isLength({ max: 500 })
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

    const therapist = await Therapist.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist profile not found'
      });
    }

    // Update therapist profile
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        therapist[key] = req.body[key];
      }
    });

    await therapist.save();

    res.json({
      success: true,
      message: 'Therapist profile updated successfully',
      data: therapist.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating therapist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating therapist profile'
    });
  }
});

// @route   GET /api/therapist/profile/me
// @desc    Get current therapist's profile
// @access  Private (Therapist only)
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ userId: req.user.id })
      .populate('userId', 'firstName lastName email profile.avatar');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...therapist.toObject(),
        user: therapist.userId
      }
    });
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching therapist profile'
    });
  }
});

// Helper function to generate available time slots
function generateAvailableSlots(availability, startDate, endDate, sessionDuration) {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = availability.workingHours.find(day => day.day === dayName);
    
    if (workingDay) {
      const startTime = new Date(currentDate);
      const [startHour, startMinute] = workingDay.startTime.split(':').map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(currentDate);
      const [endHour, endMinute] = workingDay.endTime.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      // Generate slots for this day
      let slotTime = new Date(startTime);
      while (slotTime < endTime) {
        const slotEndTime = new Date(slotTime.getTime() + sessionDuration * 60000);
        
        if (slotEndTime <= endTime) {
          // Check if slot is not during a break
          const isDuringBreak = availability.breaks.some(breakTime => {
            if (breakTime.day !== dayName) return false;
            
            const breakStart = new Date(currentDate);
            const [breakStartHour, breakStartMinute] = breakTime.startTime.split(':').map(Number);
            breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
            
            const breakEnd = new Date(currentDate);
            const [breakEndHour, breakEndMinute] = breakTime.endTime.split(':').map(Number);
            breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
            
            return slotTime < breakEnd && slotEndTime > breakStart;
          });
          
          if (!isDuringBreak) {
            slots.push({
              startTime: slotTime.toISOString(),
              endTime: slotEndTime.toISOString(),
              duration: sessionDuration
            });
          }
        }
        
        slotTime = new Date(slotTime.getTime() + sessionDuration * 60000);
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
}

export default router;
