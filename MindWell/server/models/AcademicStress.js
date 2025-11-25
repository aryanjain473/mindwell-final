import mongoose from 'mongoose';

const academicStressLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workload: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  deadlines: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  concentration: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleep: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  emotionTags: {
    type: [String],
    enum: ['Anxious', 'Overwhelmed', 'Confused', 'Bored', 'Frustrated'],
    default: []
  },
  stressScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recommendedRoutine: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  routineEffectiveness: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
academicStressLogSchema.index({ userId: 1, createdAt: -1 });
academicStressLogSchema.index({ userId: 1, stressScore: -1 });

// Static method to get user stress history
academicStressLogSchema.statics.getUserHistory = async function(userId, limit = 30) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get streak count
academicStressLogSchema.statics.getStreak = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const log = await this.findOne({
      userId,
      createdAt: {
        $gte: checkDate,
        $lt: nextDay
      }
    });
    
    if (log) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today has no log, check if yesterday had one
      if (streak === 0 && checkDate.getTime() === today.getTime()) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }
  
  return streak;
};

// Static method to get recent patterns
academicStressLogSchema.statics.getRecentPatterns = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await this.find({
    userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 }).lean();
  
  if (logs.length === 0) return null;
  
  const avgStress = logs.reduce((sum, log) => sum + log.stressScore, 0) / logs.length;
  const highStressDays = logs.filter(log => log.stressScore >= 70).length;
  const lowSleepDays = logs.filter(log => log.sleep <= 5).length;
  const lowConcentrationDays = logs.filter(log => log.concentration <= 5).length;
  
  // Check for correlations
  const sleepConcentrationCorrelation = logs.filter(
    log => log.sleep <= 5 && log.concentration <= 5
  ).length;
  
  const deadlineStressCorrelation = logs.filter(
    log => log.deadlines >= 7 && log.stressScore >= 70
  ).length;
  
  return {
    avgStress: Math.round(avgStress),
    highStressDays,
    lowSleepDays,
    lowConcentrationDays,
    sleepConcentrationCorrelation,
    deadlineStressCorrelation,
    totalDays: logs.length,
    trend: logs.length >= 2 
      ? (logs[logs.length - 1].stressScore > logs[0].stressScore ? 'increasing' : 'decreasing')
      : 'stable'
  };
};

const AcademicStressLog = mongoose.models.AcademicStressLog || mongoose.model('AcademicStressLog', academicStressLogSchema);

// Pattern summary schema
const academicStressPatternSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  patterns: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AcademicStressPattern = mongoose.models.AcademicStressPattern || mongoose.model('AcademicStressPattern', academicStressPatternSchema);

export { AcademicStressLog, AcademicStressPattern };

