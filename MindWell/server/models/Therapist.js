import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  specialization: [{
    type: String,
    enum: [
      'Anxiety Disorders',
      'Depression',
      'PTSD',
      'Bipolar Disorder',
      'Eating Disorders',
      'Substance Abuse',
      'Couples Therapy',
      'Family Therapy',
      'Child Psychology',
      'Geriatric Psychology',
      'Trauma Therapy',
      'Cognitive Behavioral Therapy',
      'Dialectical Behavior Therapy',
      'Psychodynamic Therapy',
      'Other'
    ],
    required: true
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  education: [{
    degree: {
      type: String,
      required: true,
      enum: ['Bachelor', 'Master', 'PhD', 'MD', 'PsyD']
    },
    field: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    dateIssued: Date,
    expiryDate: Date
  }],
  languages: [{
    type: String,
    required: true
  }],
  availability: {
    timezone: {
      type: String,
      required: true,
      default: 'UTC'
    },
    workingHours: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }],
    breaks: [{
      startTime: String,
      endTime: String,
      day: String
    }]
  },
  sessionSettings: {
    duration: {
      type: Number,
      default: 50, // minutes
      min: 15,
      max: 120
    },
    price: {
      type: Number,
      required: [true, 'Session price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    acceptsInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProviders: [String],
    cancellationPolicy: {
      type: String,
      enum: ['24h', '48h', '72h', '1week'],
      default: '24h'
    }
  },
  profile: {
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    photo: String,
    videoIntroduction: String,
    approach: {
      type: String,
      maxlength: [500, 'Approach description cannot exceed 500 characters']
    },
    whatToExpect: {
      type: String,
      maxlength: [500, 'What to expect description cannot exceed 500 characters']
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['license', 'degree', 'certification', 'id', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: Date,
  totalSessions: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive information
      delete ret.verificationDocuments;
      return ret;
    }
  }
});

// Indexes for efficient queries
therapistSchema.index({ specialization: 1 });
therapistSchema.index({ 'availability.timezone': 1 });
therapistSchema.index({ isVerified: 1, isActive: 1 });
therapistSchema.index({ 'ratings.average': -1 });
therapistSchema.index({ 'sessionSettings.price': 1 });

// Virtual for full name (populated from User)
therapistSchema.virtual('fullName').get(function() {
  return this.userId ? `${this.userId.firstName} ${this.userId.lastName}` : '';
});

// Method to get public profile for directory
therapistSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    userId: this.userId,
    specialization: this.specialization,
    experience: this.experience,
    languages: this.languages,
    profile: this.profile,
    ratings: this.ratings,
    sessionSettings: {
      duration: this.sessionSettings.duration,
      price: this.sessionSettings.price,
      currency: this.sessionSettings.currency,
      acceptsInsurance: this.sessionSettings.acceptsInsurance
    },
    isVerified: this.isVerified,
    isActive: this.isActive
  };
};

// Method to check availability for a specific time
therapistSchema.methods.isAvailableAt = function(dateTime) {
  const appointmentDate = new Date(dateTime);
  const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const timeString = appointmentDate.toTimeString().slice(0, 5);
  
  const workingDay = this.availability.workingHours.find(day => day.day === dayName);
  if (!workingDay) return false;
  
  const isInWorkingHours = timeString >= workingDay.startTime && timeString <= workingDay.endTime;
  if (!isInWorkingHours) return false;
  
  // Check if it's during a break
  const isDuringBreak = this.availability.breaks.some(breakTime => 
    breakTime.day === dayName && 
    timeString >= breakTime.startTime && 
    timeString <= breakTime.endTime
  );
  
  return !isDuringBreak;
};

const Therapist = mongoose.model('Therapist', therapistSchema);

export default Therapist;
