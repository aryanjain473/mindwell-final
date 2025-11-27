import express from 'express';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to email for verification
 * @access  Public
 */
router.post('/send', validateEmail, async (req, res) => {
  try {
    const { email, type = 'email_verification' } = req.body;

    // Generate 6-digit OTP
    const otpCode = OTP.generateOTP();

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email, type });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      otp: otpCode,
      type
    });

    await otpRecord.save();

    // Send OTP email (always succeeds - OTP is logged even if email fails)
    const emailResult = await sendOTPEmail(email, otpCode, type);

    // OTP is always logged to console, so even if email fails, user can get OTP from logs
    res.status(200).json({
      message: emailResult.success 
        ? 'OTP sent successfully to your email' 
        : 'OTP generated successfully. Check your email or backend logs if email not received.',
      email: email,
      expiresIn: '10 minutes',
      note: !emailResult.success ? 'Email service may be unavailable. OTP is logged in backend console.' : undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, otp, type = 'email_verification' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      type,
      isUsed: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is valid
    if (!otpRecord.isValid()) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP code
    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({
        message: 'Invalid OTP code'
      });
    }

    // Mark OTP as used
    await otpRecord.markAsUsed();

    // Handle different verification types
    if (type === 'email_verification') {
      // Update user's email verification status
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.emailVerified = true;
        await user.save();
        
        // Send welcome email
        await sendWelcomeEmail(email, user.firstName);
      }
    }

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post('/resend', validateEmail, async (req, res) => {
  try {
    const { email, type = 'email_verification' } = req.body;

    // Check if there's a recent OTP (within 1 minute)
    const recentOTP = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        message: 'Please wait 1 minute before requesting a new OTP'
      });
    }

    // Generate new OTP
    const otpCode = OTP.generateOTP();

    // Delete existing OTPs for this email and type
    await OTP.deleteMany({ email: email.toLowerCase(), type });

    // Create new OTP record
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp: otpCode,
      type
    });

    await otpRecord.save();

    // Send OTP email (always succeeds - OTP is logged even if email fails)
    const emailResult = await sendOTPEmail(email, otpCode, type);

    // OTP is always logged to console, so even if email fails, user can get OTP from logs
    res.status(200).json({
      message: emailResult.success 
        ? 'OTP resent successfully to your email' 
        : 'OTP regenerated successfully. Check your email or backend logs if email not received.',
      email: email,
      expiresIn: '10 minutes',
      note: !emailResult.success ? 'Email service may be unavailable. OTP is logged in backend console.' : undefined
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      message: 'Failed to resend OTP'
    });
  }
});

export default router;
