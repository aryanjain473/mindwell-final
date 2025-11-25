import express from 'express';
import Message from '../models/Message.js';
import { validateContactForm } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form message
 * @access  Public
 */
router.post('/', validateContactForm, async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    // Extract metadata from request
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      referrer: req.get('Referrer'),
      source: 'website'
    };

    // Create new message
    const newMessage = new Message({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      type: type || 'general',
      metadata
    });

    await newMessage.save();

    // In a production app, you would typically:
    // 1. Send email notifications to admins
    // 2. Add to support ticket system
    // 3. Send auto-reply to user
    // 4. Log for analytics

    res.status(201).json({
      message: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
      messageId: newMessage._id,
      estimatedResponse: '24 hours'
    });

  } catch (error) {
    console.error('Contact form error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Please check your form data',
        errors
      });
    }

    res.status(500).json({
      message: 'Sorry, we couldn\'t send your message. Please try again or contact us directly.'
    });
  }
});

/**
 * @route   GET /api/contact/messages
 * @desc    Get all contact messages (Admin only)
 * @access  Private (Admin)
 */
router.get('/messages', async (req, res) => {
  try {
    // Note: In a real app, you'd add admin authentication middleware here
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const priority = req.query.priority;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'firstName lastName email')
      .populate('responses.respondedBy', 'firstName lastName');

    const total = await Message.countDocuments(filter);

    res.status(200).json({
      messages: messages.map(msg => msg.getSummary()),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch messages'
    });
  }
});

/**
 * @route   GET /api/contact/messages/:id
 * @desc    Get single contact message (Admin only)
 * @access  Private (Admin)
 */
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('responses.respondedBy', 'firstName lastName');

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    res.status(200).json({ message });

  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch message'
    });
  }
});

/**
 * @route   PUT /api/contact/messages/:id/status
 * @desc    Update message status (Admin only)
 * @access  Private (Admin)
 */
router.put('/messages/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    message.status = status;
    
    if (status === 'resolved' || status === 'closed') {
      message.resolvedAt = new Date();
    }

    await message.save();

    res.status(200).json({
      message: 'Status updated successfully',
      newStatus: status
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      message: 'Failed to update status'
    });
  }
});

export default router;