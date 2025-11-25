import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mood', 'session', 'goal', 'note'],
    required: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: function() {
      return this.type === 'mood';
    }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  activities: [{
    type: String,
    enum: ['Meditation', 'Exercise', 'Journaling', 'Reading', 'Walking', 'Music', 'Sleep', 'Work', 'Social', 'Hobby', 'Mood Check-in', 'Deep Breathing', 'Music Therapy', 'Yoga', 'Gratitude Practice', 'gratitude', 'Social Connection', 'Learning']
  }],
  duration: {
    type: Number, // in minutes
    min: 0
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, type: 1, createdAt: -1 });

// Static method to get user statistics
activitySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageMood: { $avg: '$mood' },
        lastActivity: { $max: '$createdAt' },
        moodCount: { $sum: { $cond: [{ $eq: ['$type', 'mood'] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalSessions: 0,
      averageMood: 0,
      lastActivity: null,
      moodCount: 0
    };
  }

  return stats[0];
};

// Static method to get recent activities
activitySchema.statics.getRecentActivities = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('type mood notes activities createdAt metadata')
    .lean();
};

// Static method to get mood history
activitySchema.statics.getMoodHistory = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId,
    type: 'mood',
    createdAt: { $gte: startDate }
  })
    .sort({ createdAt: -1 })
    .select('mood notes createdAt metadata')
    .lean();
};

export default mongoose.model('Activity', activitySchema);
