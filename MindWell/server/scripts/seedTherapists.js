import mongoose from 'mongoose';
import User from '../models/User.js';
import Therapist from '../models/Therapist.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleTherapists = [
  {
    user: {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@mindwell.com',
      password: 'password123',
      role: 'therapist',
      isActive: true,
      emailVerified: true,
      profile: {
        bio: 'Licensed Clinical Psychologist with 10+ years of experience in anxiety and depression treatment.',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
      }
    },
    therapist: {
      licenseNumber: 'PSY-001234',
      specialization: ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy'],
      experience: 10,
      languages: ['English', 'Spanish'],
      ratings: {
        average: 4.8,
        count: 127
      },
      sessionSettings: {
        duration: 50,
        price: 150,
        currency: 'USD',
        acceptsInsurance: true
      },
      availability: {
        timezone: 'America/New_York',
        workingHours: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '15:00' }
        ]
      },
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    }
  },
  {
    user: {
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@mindwell.com',
      password: 'password123',
      role: 'therapist',
      isActive: true,
      emailVerified: true,
      profile: {
        bio: 'Licensed Marriage and Family Therapist specializing in couples therapy and relationship counseling.',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
      }
    },
    therapist: {
      licenseNumber: 'MFT-005678',
      specialization: ['Couples Therapy', 'Family Therapy', 'Trauma Therapy'],
      experience: 8,
      languages: ['English', 'Mandarin'],
      ratings: {
        average: 4.9,
        count: 89
      },
      sessionSettings: {
        duration: 60,
        price: 175,
        currency: 'USD',
        acceptsInsurance: true
      },
      availability: {
        timezone: 'America/Los_Angeles',
        workingHours: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ]
      },
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    }
  },
  {
    user: {
      firstName: 'Dr. Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@mindwell.com',
      password: 'password123',
      role: 'therapist',
      isActive: true,
      emailVerified: true,
      profile: {
        bio: 'Child and Adolescent Psychologist with expertise in ADHD, anxiety, and behavioral issues.',
        avatar: 'https://images.unsplash.com/photo-1594824388850-889c2b9784b8?w=150&h=150&fit=crop&crop=face'
      }
    },
    therapist: {
      licenseNumber: 'PSY-009876',
      specialization: ['Child Psychology', 'Anxiety Disorders', 'Other'],
      experience: 12,
      languages: ['English', 'Spanish'],
      ratings: {
        average: 4.7,
        count: 156
      },
      sessionSettings: {
        duration: 45,
        price: 140,
        currency: 'USD',
        acceptsInsurance: true
      },
      availability: {
        timezone: 'America/Chicago',
        workingHours: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ]
      },
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    }
  },
  {
    user: {
      firstName: 'Dr. James',
      lastName: 'Wilson',
      email: 'james.wilson@mindwell.com',
      password: 'password123',
      role: 'therapist',
      isActive: true,
      emailVerified: true,
      profile: {
        bio: 'Licensed Clinical Social Worker specializing in trauma therapy and PTSD treatment.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    therapist: {
      licenseNumber: 'LCSW-003456',
      specialization: ['Trauma Therapy', 'PTSD', 'Substance Abuse'],
      experience: 15,
      languages: ['English'],
      ratings: {
        average: 4.9,
        count: 203
      },
      sessionSettings: {
        duration: 50,
        price: 160,
        currency: 'USD',
        acceptsInsurance: true
      },
      availability: {
        timezone: 'America/New_York',
        workingHours: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '15:00' }
        ]
      },
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    }
  },
  {
    user: {
      firstName: 'Dr. Lisa',
      lastName: 'Thompson',
      email: 'lisa.thompson@mindwell.com',
      password: 'password123',
      role: 'therapist',
      isActive: true,
      emailVerified: true,
      profile: {
        bio: 'Licensed Professional Counselor specializing in eating disorders and body image issues.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    },
    therapist: {
      licenseNumber: 'LPC-007890',
      specialization: ['Eating Disorders', 'Depression', 'Other'],
      experience: 7,
      languages: ['English', 'French'],
      ratings: {
        average: 4.6,
        count: 94
      },
      sessionSettings: {
        duration: 50,
        price: 145,
        currency: 'USD',
        acceptsInsurance: true
      },
      availability: {
        timezone: 'America/Denver',
        workingHours: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ]
      },
      isVerified: true,
      isActive: true,
      verificationStatus: 'approved'
    }
  }
];

const seedTherapists = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindwell');
    console.log('Connected to MongoDB');

    // Clear existing therapists and users
    await Therapist.deleteMany({});
    await User.deleteMany({ role: 'therapist' });
    console.log('Cleared existing therapist data');

    // Create therapists
    for (const therapistData of sampleTherapists) {
      // Create user first
      const user = new User(therapistData.user);
      await user.save();
      console.log(`Created user: ${user.firstName} ${user.lastName}`);

      // Create therapist with userId reference
      const therapist = new Therapist({
        ...therapistData.therapist,
        userId: user._id
      });
      await therapist.save();
      console.log(`Created therapist: ${therapist.licenseNumber}`);
    }

    console.log('✅ Successfully seeded database with sample therapists!');
    console.log(`Created ${sampleTherapists.length} therapists`);

  } catch (error) {
    console.error('Error seeding therapists:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedTherapists();
