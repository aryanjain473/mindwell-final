import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'support', 'billing', 'partnership', 'press'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  responses: [{
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    response: {
      type: String,
      required: true,
      maxlength: [2000, 'Response cannot be more than 2000 characters']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    source: {
      type: String,
      enum: ['website', 'mobile-app', 'api'],
      default: 'website'
    }
  },
  tags: [String],
  isSpam: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ email: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ priority: 1, status: 1 });

// Auto-assign priority based on keywords
messageSchema.pre('save', function(next) {
  if (this.isNew) {
    const urgentKeywords = ['urgent', 'emergency', 'crisis', 'suicide', 'harm'];
    const highKeywords = ['bug', 'error', 'problem', 'issue', 'broken'];
    
    const content = `${this.subject} ${this.message}`.toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => content.includes(keyword))) {
      this.priority = 'high';
    }
  }
  next();
});

// Method to add response
messageSchema.methods.addResponse = function(userId, responseText, isPublic = false) {
  this.responses.push({
    respondedBy: userId,
    response: responseText,
    isPublic: isPublic
  });
  this.lastUpdatedBy = userId;
  this.status = 'in-progress';
  return this.save();
};

// Method to resolve message
messageSchema.methods.resolve = function(userId) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.lastUpdatedBy = userId;
  return this.save();
};

// Virtual for response count
messageSchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Method to get summary
messageSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    subject: this.subject,
    type: this.type,
    status: this.status,
    priority: this.priority,
    responseCount: this.responseCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Message = mongoose.model('Message', messageSchema);

export default Message;