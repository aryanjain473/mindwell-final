import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'success', 'error', 'announcement'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'registered', 'premium', 'specific'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  scheduledFor: Date,
  sentAt: Date,
  expiresAt: Date,
  deliveryMethod: {
    type: [String],
    enum: ['in_app', 'email', 'push', 'sms'],
    default: ['in_app']
  },
  actionUrl: String,
  actionText: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stats: {
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
    totalClicked: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ targetAudience: 1, status: 1 });
notificationSchema.index({ createdBy: 1 });
notificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
