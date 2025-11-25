import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'page_view',
      'chatbot_interaction',
      'mood_tracking',
      'journal_entry',
      'therapist_search',
      'appointment_booking',
      'session_start',
      'session_end'
    ]
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: Number, // in seconds
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

// Static method to get user activity summary
analyticsSchema.statics.getUserActivity = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        lastActivity: { $max: '$timestamp' }
      }
    }
  ]);
};

// Static method to get platform analytics
analyticsSchema.statics.getPlatformAnalytics = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          eventType: '$eventType'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        events: {
          $push: {
            eventType: '$_id.eventType',
            count: '$count'
          }
        },
        totalEvents: { $sum: '$count' },
        uniqueUsers: { $first: '$uniqueUsers' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
