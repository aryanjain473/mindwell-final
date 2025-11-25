import mongoose from 'mongoose';

const wellnessGameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: [
      'heart-calm',
      'gratitude-wheel',
      'lotus-bloom',
      'candle-focus',
      'thought-cloud',
      'dream-waves',
      'anulom-vilom',
      'music-listening'
    ],
    required: true
  },
  // Game-specific data (flexible schema)
  gameData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Common metrics
  duration: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  // Game-specific metrics
  cycles: Number,
  calmnessIndex: Number,
  gratitudeCount: Number,
  growthPercentage: Number,
  bloomPercentage: Number,
  focusDuration: Number,
  releasedThoughts: Number,
  relaxationLevel: Number,
  sleepReadiness: Number,
  balanceRatio: Number,
  breathSymmetry: Number,
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
wellnessGameSchema.index({ userId: 1, gameType: 1, createdAt: -1 });
wellnessGameSchema.index({ userId: 1, createdAt: -1 });

// Static methods
wellnessGameSchema.statics.getUserGameStats = async function(userId, gameType = null) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
  if (gameType) {
    matchStage.gameType = gameType;
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$gameType',
        sessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        lastPlayed: { $max: '$createdAt' }
      }
    }
  ]);

  return stats;
};

wellnessGameSchema.statics.getGameSessions = async function(userId, gameType, limit = 10) {
  return await this.find({ userId, gameType })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const WellnessGame = mongoose.model('WellnessGame', wellnessGameSchema);

export default WellnessGame;

