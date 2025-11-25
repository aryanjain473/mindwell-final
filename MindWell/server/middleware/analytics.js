import Analytics from '../models/Analytics.js';

/**
 * Middleware to track user analytics
 */
export const trackAnalytics = (eventType, eventData = {}) => {
  return async (req, res, next) => {
    // Don't track analytics for admin routes or if no user
    if (req.path.startsWith('/api/admin') || !req.user) {
      return next();
    }

    try {
      // Create analytics record
      const analyticsRecord = new Analytics({
        userId: req.user.userId,
        eventType,
        eventData,
        sessionId: req.sessionID,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: {
          path: req.path,
          method: req.method,
          ...eventData
        }
      });

      // Save asynchronously (don't wait for it)
      analyticsRecord.save().catch(err => {
        console.error('Analytics tracking error:', err);
      });

    } catch (error) {
      console.error('Analytics middleware error:', error);
    }

    next();
  };
};

/**
 * Track specific events
 */
export const trackEvent = (eventType, eventData = {}) => {
  return trackAnalytics(eventType, eventData);
};

/**
 * Track page views
 */
export const trackPageView = (pageName) => {
  return trackAnalytics('page_view', { pageName });
};

/**
 * Track user actions
 */
export const trackUserAction = (action, details = {}) => {
  return trackAnalytics('user_action', { action, ...details });
};

/**
 * Track chatbot interactions
 */
export const trackChatbotInteraction = (interactionType, messageCount = 1) => {
  return trackAnalytics('chatbot_interaction', { 
    interactionType, 
    messageCount 
  });
};

/**
 * Track mood tracking
 */
export const trackMoodTracking = (moodValue, previousMood = null) => {
  return trackAnalytics('mood_tracking', { 
    moodValue, 
    previousMood,
    moodChange: previousMood ? moodValue - previousMood : 0
  });
};

/**
 * Track session events
 */
export const trackSession = (sessionType, duration = 0) => {
  return trackAnalytics('session_start', { 
    sessionType, 
    duration 
  });
};

export default {
  trackAnalytics,
  trackEvent,
  trackPageView,
  trackUserAction,
  trackChatbotInteraction,
  trackMoodTracking,
  trackSession
};
