import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'interrupted', 'cancelled'],
    default: 'active'
  },
  sessionData: {
    moodBefore: {
      type: Number,
      min: 1,
      max: 10
    },
    moodAfter: {
      type: Number,
      min: 1,
      max: 10
    },
    anxietyLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  activities: [{
    name: String,
    description: String,
    duration: Number, // in minutes
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  techniques: [{
    name: String,
    description: String,
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  goals: [{
    goal: String,
    progress: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String
  }],
  notes: {
    therapistNotes: String,
    userNotes: String,
    sessionSummary: String,
    keyInsights: [String],
    actionItems: [String],
    homework: [String]
  },
  recordings: [{
    type: {
      type: String,
      enum: ['video', 'audio', 'screen'],
      required: true
    },
    url: String,
    duration: Number,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isEncrypted: {
      type: Boolean,
      default: true
    }
  }],
  chat: [{
    sender: {
      type: String,
      enum: ['user', 'therapist'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'link'],
      default: 'text'
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  files: [{
    name: String,
    originalName: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: String,
      enum: ['user', 'therapist'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isEncrypted: {
      type: Boolean,
      default: true
    }
  }],
  emergency: {
    triggered: {
      type: Boolean,
      default: false
    },
    triggeredAt: Date,
    reason: String,
    actionTaken: String,
    emergencyContactNotified: {
      type: Boolean,
      default: false
    }
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledFor: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    notes: String
  },
  satisfaction: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userFeedback: String,
    therapistRating: {
      type: Number,
      min: 1,
      max: 5
    },
    therapistFeedback: String,
    wouldRecommend: Boolean,
    ratedAt: Date
  },
  technicalIssues: [{
    issue: String,
    description: String,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolution: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive information
      delete ret.recordings;
      delete ret.files;
      return ret;
    }
  }
});

// Indexes for efficient queries
sessionSchema.index({ appointment: 1 });
sessionSchema.index({ user: 1, startedAt: -1 });
sessionSchema.index({ therapist: 1, startedAt: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startedAt: -1 });

// Virtual for session duration in minutes
sessionSchema.virtual('sessionDuration').get(function() {
  if (this.endedAt && this.startedAt) {
    return Math.round((this.endedAt.getTime() - this.startedAt.getTime()) / (1000 * 60));
  }
  return 0;
});

// Virtual for is active
sessionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.endedAt;
});

// Method to end session
sessionSchema.methods.endSession = function() {
  this.endedAt = new Date();
  this.duration = this.sessionDuration;
  this.status = 'completed';
  return this.save();
};

// Method to add chat message
sessionSchema.methods.addChatMessage = function(sender, message, messageType = 'text', attachments = []) {
  this.chat.push({
    sender,
    message,
    messageType,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add file
sessionSchema.methods.addFile = function(name, originalName, url, type, size, uploadedBy) {
  this.files.push({
    name,
    originalName,
    url,
    type,
    size,
    uploadedBy,
    uploadedAt: new Date()
  });
  return this.save();
};

// Method to trigger emergency protocol
sessionSchema.methods.triggerEmergency = function(reason, actionTaken) {
  this.emergency = {
    triggered: true,
    triggeredAt: new Date(),
    reason,
    actionTaken,
    emergencyContactNotified: false
  };
  return this.save();
};

// Method to calculate session effectiveness
sessionSchema.methods.calculateEffectiveness = function() {
  if (!this.sessionData.moodBefore || !this.sessionData.moodAfter) {
    return null;
  }
  
  const moodImprovement = this.sessionData.moodAfter - this.sessionData.moodBefore;
  const maxImprovement = 9; // Maximum possible improvement (10 - 1)
  
  return Math.round((moodImprovement / maxImprovement) * 100);
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
