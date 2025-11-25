import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  scheduledAt: {
    type: Date,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 120,
    default: 50
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'assessment'],
    default: 'consultation'
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person'],
    default: 'video'
  },
  meetingDetails: {
    roomId: String,
    meetingUrl: String,
    meetingPassword: String,
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'custom', 'jitsi'],
      default: 'custom'
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    finalPrice: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'insurance', 'free'],
      default: 'card'
    },
    transactionId: String
  },
  notes: {
    userNotes: String,
    therapistNotes: String,
    sessionSummary: String,
    recommendations: [String],
    nextAppointmentSuggested: Date
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'therapist', 'system', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  rescheduling: {
    originalTime: Date,
    rescheduledAt: Date,
    reason: String,
    rescheduledBy: {
      type: String,
      enum: ['user', 'therapist', 'admin']
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  rating: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userReview: String,
    therapistRating: {
      type: Number,
      min: 1,
      max: 5
    },
    therapistReview: String,
    ratedAt: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedBy: {
      type: String,
      enum: ['user', 'therapist']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
    notified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive information
      delete ret.meetingDetails.meetingPassword;
      return ret;
    }
  }
});

// Indexes for efficient queries
appointmentSchema.index({ user: 1, scheduledAt: 1 });
appointmentSchema.index({ therapist: 1, scheduledAt: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledAt: 1 });
appointmentSchema.index({ 'pricing.paymentStatus': 1 });

// Virtual for time until appointment
appointmentSchema.virtual('timeUntilAppointment').get(function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  return appointmentTime.getTime() - now.getTime();
});

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  return appointmentTime > now && this.status === 'scheduled';
});

// Virtual for is past
appointmentSchema.virtual('isPast').get(function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  return appointmentTime < now;
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before appointment
  return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Can reschedule if more than 2 hours before appointment
  return hoursUntilAppointment > 2 && ['scheduled', 'confirmed'].includes(this.status);
};

// Method to calculate refund amount
appointmentSchema.methods.calculateRefund = function() {
  if (this.pricing.paymentStatus !== 'paid') return 0;
  
  const now = new Date();
  const appointmentTime = new Date(this.scheduledAt);
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Full refund if cancelled more than 24 hours before
  if (hoursUntilAppointment > 24) return this.pricing.finalPrice;
  
  // 50% refund if cancelled 2-24 hours before
  if (hoursUntilAppointment > 2) return this.pricing.finalPrice * 0.5;
  
  // No refund if cancelled less than 2 hours before
  return 0;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
