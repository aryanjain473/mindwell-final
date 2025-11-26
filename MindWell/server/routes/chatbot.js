import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';
import EmotionHistory from '../models/EmotionHistory.js';

const router = express.Router();

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

// Force IPv4 resolution
const axiosConfig = {
  family: 4, // Force IPv4
  timeout: 60000 // Increased to 60 seconds for free tier wake-up time
};

// ===========================================
// CHATBOT API ROUTES
// ===========================================

/**
 * Simple test endpoint
 * GET /api/chatbot/test/simple
 */
router.get('/test/simple', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

/**
 * Simple POST test endpoint
 * POST /api/chatbot/test/post
 */
router.post('/test/post', (req, res) => {
  console.log('POST test received:', req.body);
  res.json({ message: 'POST test working', body: req.body });
});

/**
 * Test endpoint without authentication
 * POST /api/chatbot/test/start
 */
router.post('/test/start', async (req, res) => {
  try {
    const { email, consentEmail } = req.body;
    
    // Call Python AI service to start session
    const response = await axios.post(`${AI_SERVICE_URL}/session/start`, {
      user_id: 'test-user-123',
      email: email || 'test@example.com',
      consent_email: consentEmail || false
    }, axiosConfig);

    res.json({
      success: true,
      sessionId: response.data.session_id,
      message: response.data.message,
      aiService: 'online'
    });
  } catch (error) {
    console.error('Error starting test session:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to start test session',
      error: error.message
    });
  }
});

/**
 * Test endpoint for sending messages
 * POST /api/chatbot/test/respond
 */
router.post('/test/respond', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    console.log('Received test respond request:', { sessionId, message });
    
    // Call Python AI service to process message
    console.log('Calling AI service...');
    
    const response = await axios.post(`${AI_SERVICE_URL}/session/respond`, {
      user_id: 'test-user-123',
      session_id: sessionId,
      answer: message,
      finished: false
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('AI service response:', response.data);
    
    res.json({
      success: true,
      response: response.data.assistant_reply,
      aiService: 'online'
    });
  } catch (error) {
    console.error('Error sending test message:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test message',
      error: error.message
    });
  }
});

/**
 * Start a new chat session
 * POST /api/chatbot/session/start
 */
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const { email, consentEmail } = req.body;
    const userId = req.user.userId;

    // Check if AI service URL is configured
    if (!AI_SERVICE_URL || AI_SERVICE_URL === 'http://127.0.0.1:8001') {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please contact support.',
        error: 'AI_SERVICE_NOT_CONFIGURED'
      });
    }

    // Debug logging
    console.log('📧 Chatbot session start request:');
    console.log('   Email from body:', email);
    console.log('   ConsentEmail from body:', consentEmail);
    console.log('   ConsentEmail type:', typeof consentEmail);
    console.log('   User email:', req.user.email);

    // Handle consent - explicitly check for true, default to false if not provided
    const consent = consentEmail === true || consentEmail === 'true' || consentEmail === 1;
    const emailToUse = email || req.user.email;

    console.log('   Final consent value:', consent);
    console.log('   Final email to use:', emailToUse);

    // Call Python AI service to start session
    console.log(`🔗 Calling AI service: ${AI_SERVICE_URL}/session/start`);
    const response = await axios.post(`${AI_SERVICE_URL}/session/start`, {
      user_id: userId,
      email: emailToUse,
      consent_email: consent
    }, {
      ...axiosConfig,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { session_id, question } = response.data;

    res.status(200).json({
      success: true,
      sessionId: session_id,
      initialMessage: question,
      message: 'Chat session started successfully'
    });

  } catch (error) {
    console.error('❌ Error starting chat session:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error response:', error.response?.status, error.response?.data);
    console.error('   AI_SERVICE_URL:', AI_SERVICE_URL);
    
    // Handle AI service unavailable
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500) {
      console.error('⚠️ AI service unavailable - returning 503');
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.',
        error: 'AI_SERVICE_UNAVAILABLE',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Send a message to the chatbot
 * POST /api/chatbot/session/respond
 */
router.post('/session/respond', authMiddleware, async (req, res) => {
  try {
    const { sessionId, message, finished = false, facialEmotion } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Prepare request body with optional facial emotion data
    const requestBody = {
      user_id: userId,
      session_id: sessionId,
      answer: message,
      finished: finished
    };

    // Add facial emotion if provided
    if (facialEmotion && facialEmotion.emotion) {
      requestBody.facial_emotion = {
        emotion: facialEmotion.emotion,
        confidence: facialEmotion.confidence,
        mood: facialEmotion.mood
      };
    }

    // Call Python AI service to process message
    console.log(`🔗 Calling AI service: ${AI_SERVICE_URL}/session/respond`);
    const response = await axios.post(`${AI_SERVICE_URL}/session/respond`, requestBody, {
      ...axiosConfig,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { 
      finished: sessionFinished, 
      assistant_reply, 
      risk, 
      decision_type,
      summary,
      email_attempted,
      email_sent,
      emotion,
      facial_emotion,
      recommendations,
    } = response.data;

    // Save emotion history to database (async, don't block response)
    if (emotion || facial_emotion) {
      try {
        // Determine combined emotion
        let combinedEmotion = {
          primaryEmotion: "neutral",
          confidence: 0.5,
          mood: 5,
          riskLevel: risk || "low"
        };

        // Prioritize facial emotion if available
        if (facial_emotion && facial_emotion.emotion) {
          combinedEmotion.primaryEmotion = facial_emotion.emotion.toLowerCase();
          combinedEmotion.confidence = facial_emotion.confidence || 0.5;
          combinedEmotion.mood = facial_emotion.mood || 5;
        } else if (emotion && emotion.emotion) {
          combinedEmotion.primaryEmotion = emotion.emotion.toLowerCase();
          combinedEmotion.confidence = emotion.confidence || 0.5;
          combinedEmotion.riskLevel = emotion.risk || risk || "low";
          
          // Map text emotion to mood
          const emotionToMood = {
            "sadness": 3, "sad": 3,
            "joy": 8, "happy": 8,
            "anger": 2, "angry": 2,
            "fear": 3, "anxiety": 3,
            "neutral": 5
          };
          combinedEmotion.mood = emotionToMood[combinedEmotion.primaryEmotion] || 5;
        }

        // Save to database (non-blocking)
        const emotionHistory = new EmotionHistory({
          userId,
          sessionId,
          textEmotion: emotion ? {
            emotion: emotion.emotion,
            polarity: emotion.polarity,
            risk: emotion.risk,
            confidence: emotion.confidence,
            source: "text_ml"
          } : null,
          facialEmotion: facial_emotion ? {
            emotion: facial_emotion.emotion,
            confidence: facial_emotion.confidence,
            mood: facial_emotion.mood
          } : null,
          combinedEmotion,
          recommendations: recommendations || [],
          context: {
            userMessage: message,
            chatbotResponse: assistant_reply,
            timestamp: new Date()
          }
        });

        emotionHistory.save().catch(err => {
          console.error("Error saving emotion history (non-blocking):", err);
        });
      } catch (err) {
        // Silently fail - emotion history saving should not block chat response
        console.error("Error preparing emotion history save:", err);
      }
    }

    res.status(200).json({
      success: true,
      sessionFinished: sessionFinished,
      assistantReply: assistant_reply,
      risk: risk,
      decisionType: decision_type,
      summary: summary,
      emailAttempted: email_attempted,
      emailSent: email_sent,
      emotion: emotion,
      facialEmotion: facial_emotion,
      recommendations: recommendations || [],
      message: 'Message processed successfully'
    });

  } catch (error) {
    console.error('❌ Error processing chat message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error response:', error.response?.status, error.response?.data);
    console.error('   AI_SERVICE_URL:', AI_SERVICE_URL);
    
    // Handle AI service unavailable
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500) {
      console.error('⚠️ AI service unavailable - returning 503');
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.',
        error: 'AI_SERVICE_UNAVAILABLE',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Handle session not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
        error: 'SESSION_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get chat session history
 * GET /api/chatbot/session/history/:sessionId
 */
router.get('/session/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Call Python AI service to get session history
    const response = await axios.get(`${AI_SERVICE_URL}/user/${userId}/history`, axiosConfig);

    // Find the specific session
    const sessions = response.data.sessions || [];
    const session = sessions.find(s => s.session_id === sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      session: session,
      message: 'Session history retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving session history:', error);
    
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable',
        error: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get all user chat sessions
 * GET /api/chatbot/sessions
 */
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if AI service URL is configured
    if (!AI_SERVICE_URL || AI_SERVICE_URL === 'http://127.0.0.1:8001') {
      console.warn('⚠️ AI_SERVICE_URL not configured, returning empty sessions');
      return res.status(200).json({
        success: true,
        sessions: [],
        message: 'AI service not configured. No sessions available.',
        aiServiceAvailable: false
      });
    }

    // Call Python AI service to get all user sessions
    const response = await axios.get(`${AI_SERVICE_URL}/user/${userId}/history`, axiosConfig);

    res.status(200).json({
      success: true,
      sessions: response.data.sessions || [],
      message: 'User sessions retrieved successfully',
      aiServiceAvailable: true
    });

  } catch (error) {
    console.error('Error retrieving user sessions:', error);
    
    // If AI service is unavailable, return empty sessions instead of error
    // This allows the frontend to still render properly
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500) {
      console.warn('⚠️ AI service unavailable, returning empty sessions');
      return res.status(200).json({
        success: true,
        sessions: [],
        message: 'AI service is temporarily unavailable. No sessions available.',
        aiServiceAvailable: false,
        error: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Health check for AI service
 * GET /api/chatbot/health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      ...axiosConfig,
      timeout: 5000
    });

    res.status(200).json({
      success: true,
      aiService: 'online',
      response: response.data,
      message: 'AI service is healthy'
    });

  } catch (error) {
    console.error('AI service health check failed:', error);
    
    res.status(503).json({
      success: false,
      aiService: 'offline',
      message: 'AI service is unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI service unavailable'
    });
  }
});

export default router;
