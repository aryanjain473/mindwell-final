import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedAnalytics = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindwell');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    // Clear existing analytics
    await Analytics.deleteMany({});
    console.log('Cleared existing analytics');

    // Generate sample analytics data for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const events = [
      'login',
      'logout',
      'page_view',
      'chatbot_interaction',
      'mood_tracking',
      'journal_entry',
      'therapist_search',
      'appointment_booking',
      'session_start',
      'session_end'
    ];

    const analyticsData = [];

    // Generate data for each user
    for (const user of users) {
      // Generate 5-15 events per user over the last 30 days
      const eventCount = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < eventCount; i++) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const randomTime = new Date(
          thirtyDaysAgo.getTime() + 
          Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
        );

        const eventData = {
          userId: user._id,
          eventType: randomEvent,
          eventData: {
            page: randomEvent === 'page_view' ? ['/dashboard', '/chat', '/therapists', '/journal'][Math.floor(Math.random() * 4)] : undefined,
            mood: randomEvent === 'mood_tracking' ? Math.floor(Math.random() * 10) + 1 : undefined,
            messageCount: randomEvent === 'chatbot_interaction' ? Math.floor(Math.random() * 5) + 1 : undefined,
            sessionDuration: randomEvent === 'session_start' ? Math.floor(Math.random() * 3600) + 300 : undefined
          },
          sessionId: `session_${user._id}_${i}`,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: randomTime,
          duration: randomEvent === 'session_start' ? Math.floor(Math.random() * 3600) + 300 : undefined,
          metadata: {
            source: 'web',
            device: 'desktop'
          }
        };

        analyticsData.push(eventData);
      }
    }

    // Insert all analytics data
    await Analytics.insertMany(analyticsData);
    console.log(`Created ${analyticsData.length} analytics records`);

    // Generate some additional recent activity for better dashboard display
    const recentEvents = [
      { eventType: 'login', count: 5 },
      { eventType: 'page_view', count: 12 },
      { eventType: 'chatbot_interaction', count: 8 },
      { eventType: 'mood_tracking', count: 3 },
      { eventType: 'therapist_search', count: 4 }
    ];

    const recentAnalytics = [];
    for (const event of recentEvents) {
      for (let i = 0; i < event.count; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const recentTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours

        recentAnalytics.push({
          userId: randomUser._id,
          eventType: event.eventType,
          eventData: {
            page: event.eventType === 'page_view' ? ['/dashboard', '/chat', '/therapists'][Math.floor(Math.random() * 3)] : undefined,
            mood: event.eventType === 'mood_tracking' ? Math.floor(Math.random() * 10) + 1 : undefined
          },
          sessionId: `recent_${randomUser._id}_${i}`,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: recentTime,
          metadata: {
            source: 'web',
            device: 'desktop'
          }
        });
      }
    }

    await Analytics.insertMany(recentAnalytics);
    console.log(`Created ${recentAnalytics.length} recent analytics records`);

    console.log('Analytics seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding analytics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedAnalytics();
