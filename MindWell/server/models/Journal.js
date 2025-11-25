import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'stormy'],
    default: 'sunny'
  },
  activities: [{
    type: String,
    enum: ['work', 'exercise', 'social', 'hobby', 'rest', 'travel', 'learning', 'family', 'friends', 'self-care', 'cooking', 'reading', 'music', 'art', 'sports', 'nature', 'shopping', 'cleaning', 'gaming', 'watching', 'other']
  }],
  gratitude: [{
    type: String,
    maxlength: 200
  }],
  goals: [{
    type: String,
    maxlength: 200
  }],
  reflection: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, mood: 1, createdAt: -1 });
journalSchema.index({ userId: 1, tags: 1, createdAt: -1 });

// Static method to get user's journal entries
journalSchema.statics.getUserJournals = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v')
    .lean();
};

// Static method to get journal by date
journalSchema.statics.getJournalByDate = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    userId,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).lean();
};

// Static method to get journal statistics
journalSchema.statics.getJournalStats = async function(userId) {
  const totalEntries = await this.countDocuments({ userId });
  
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentEntries = await this.countDocuments({
    userId,
    createdAt: { $gte: last30Days }
  });
  
  const avgMood = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, averageMood: { $avg: '$mood' } } }
  ]);
  
  const moodDistribution = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ['$mood', 3] }, then: 'low' },
              { case: { $lte: ['$mood', 6] }, then: 'medium' },
              { case: { $lte: ['$mood', 10] }, then: 'high' }
            ],
            default: 'medium'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    totalEntries,
    recentEntries,
    averageMood: avgMood[0]?.averageMood || 0,
    moodDistribution
  };
};

// Static method to search journals
journalSchema.statics.searchJournals = async function(userId, query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    userId,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('-__v')
  .lean();
};

export default mongoose.model('Journal', journalSchema);
