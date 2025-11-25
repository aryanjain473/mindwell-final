import mongoose from 'mongoose';

const emotionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  // Text-based emotion (from chatbot)
  textEmotion: {
    emotion: String,
    polarity: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    risk: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    confidence: Number,
    source: {
      type: String,
      enum: ['text_ml', 'text_sentiment'],
      default: 'text_ml'
    }
  },
  // Facial emotion (from DeepFace)
  facialEmotion: {
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
    },
    confidence: Number,
    mood: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  // Combined emotion analysis
  combinedEmotion: {
    primaryEmotion: String,
    confidence: Number,
    mood: {
      type: Number,
      min: 1,
      max: 10
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  // Recommendations generated
  recommendations: [{
    type: {
      type: String,
      enum: ['activity', 'resource', 'exercise', 'content', 'video', 'blog']
    },
    title: String,
    description: String,
    url: String,  // For YouTube videos and blog links
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }],
  // Context
  context: {
    userMessage: String,
    chatbotResponse: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emotionHistorySchema.index({ userId: 1, createdAt: -1 });
emotionHistorySchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
emotionHistorySchema.index({ 'combinedEmotion.primaryEmotion': 1 });
emotionHistorySchema.index({ 'combinedEmotion.riskLevel': 1 });

// Static method to get user emotion patterns
emotionHistorySchema.statics.getUserEmotionPatterns = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const patterns = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$combinedEmotion.primaryEmotion',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$combinedEmotion.confidence' },
        avgMood: { $avg: '$combinedEmotion.mood' },
        lastSeen: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return patterns;
};

// Static method to get recent emotions
emotionHistorySchema.statics.getRecentEmotions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('textEmotion facialEmotion combinedEmotion recommendations createdAt')
    .lean();
};

// Static method to get emotion trends
emotionHistorySchema.statics.getEmotionTrends = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        avgMood: { $avg: '$combinedEmotion.mood' },
        emotions: { $push: '$combinedEmotion.primaryEmotion' },
        riskLevels: { $push: '$combinedEmotion.riskLevel' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export default mongoose.model('EmotionHistory', emotionHistorySchema);

