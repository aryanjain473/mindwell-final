import mongoose from 'mongoose';
import Content from '../models/Content.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindwell');
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing content
    await Content.deleteMany({});
    console.log('Cleared existing content');

    // Sample content data
    const contentData = [
      {
        title: "Understanding Anxiety: A Complete Guide",
        type: "article",
        content: `Anxiety is a natural human response to stress, but when it becomes overwhelming and persistent, it can significantly impact daily life. This comprehensive guide explores the different types of anxiety disorders, their symptoms, and effective coping strategies.

## What is Anxiety?

Anxiety is characterized by feelings of worry, nervousness, or fear that are strong enough to interfere with daily activities. While everyone experiences anxiety from time to time, anxiety disorders involve more than temporary worry or fear.

## Types of Anxiety Disorders

1. **Generalized Anxiety Disorder (GAD)**
2. **Panic Disorder**
3. **Social Anxiety Disorder**
4. **Specific Phobias**
5. **Separation Anxiety Disorder**

## Coping Strategies

- Deep breathing exercises
- Mindfulness meditation
- Regular physical exercise
- Maintaining a healthy sleep schedule
- Seeking professional help when needed

Remember, it's important to reach out to mental health professionals if anxiety is significantly impacting your life.`,
        excerpt: "A comprehensive guide to understanding anxiety disorders, their symptoms, and effective coping strategies for better mental health.",
        category: "anxiety",
        tags: ["anxiety", "mental health", "coping strategies", "wellness"],
        author: adminUser._id,
        status: "published",
        featured: true,
        priority: 8,
        publishedAt: new Date(),
        accessLevel: "public"
      },
      {
        title: "5-Minute Mindfulness Meditation",
        type: "exercise",
        content: `This guided meditation exercise is designed to help you center yourself and find peace in just 5 minutes.

## Instructions

1. Find a quiet, comfortable space
2. Sit or lie down in a relaxed position
3. Close your eyes and take three deep breaths
4. Focus on your breathing - feel the air entering and leaving your body
5. If your mind wanders, gently bring your attention back to your breath
6. Continue for 5 minutes
7. Slowly open your eyes and take a moment to notice how you feel

## Benefits

- Reduces stress and anxiety
- Improves focus and concentration
- Promotes emotional well-being
- Enhances self-awareness`,
        excerpt: "A simple 5-minute mindfulness meditation exercise to help reduce stress and improve mental well-being.",
        category: "mindfulness",
        tags: ["meditation", "mindfulness", "stress relief", "breathing"],
        author: adminUser._id,
        status: "published",
        featured: true,
        priority: 9,
        publishedAt: new Date(),
        accessLevel: "public"
      },
      {
        title: "Building Healthy Sleep Habits",
        type: "article",
        content: `Quality sleep is essential for mental health and overall well-being. This article provides practical tips for establishing healthy sleep patterns.

## The Importance of Sleep

Sleep plays a crucial role in:
- Memory consolidation
- Emotional regulation
- Physical recovery
- Immune system function
- Cognitive performance

## Tips for Better Sleep

1. **Maintain a consistent sleep schedule**
2. **Create a relaxing bedtime routine**
3. **Keep your bedroom cool, dark, and quiet**
4. **Limit screen time before bed**
5. **Avoid caffeine and large meals before bedtime**
6. **Exercise regularly, but not too close to bedtime**

## When to Seek Help

If you consistently have trouble sleeping or feel tired during the day, consider consulting a healthcare provider or sleep specialist.`,
        excerpt: "Learn how to establish healthy sleep habits for better mental health and overall well-being.",
        category: "self-care",
        tags: ["sleep", "wellness", "mental health", "habits"],
        author: adminUser._id,
        status: "published",
        featured: false,
        priority: 6,
        publishedAt: new Date(),
        accessLevel: "public"
      },
      {
        title: "Crisis Resources and Emergency Contacts",
        type: "resource",
        content: `If you or someone you know is experiencing a mental health crisis, immediate help is available.

## Emergency Contacts

**National Suicide Prevention Lifeline: 988**
- Available 24/7
- Free and confidential
- Crisis counselors available

**Crisis Text Line: Text HOME to 741741**
- 24/7 crisis support via text
- Trained crisis counselors
- Free and confidential

## Warning Signs

Seek immediate help if you or someone you know is:
- Talking about wanting to die or hurt themselves
- Looking for ways to harm themselves
- Talking about feeling hopeless or having no reason to live
- Talking about being a burden to others
- Increasing use of alcohol or drugs
- Acting anxious, agitated, or reckless
- Sleeping too little or too much
- Withdrawing or feeling isolated

## Remember

- You are not alone
- Help is available
- Your life has value
- This feeling is temporary`,
        excerpt: "Emergency resources and crisis contacts for immediate mental health support and intervention.",
        category: "crisis",
        tags: ["crisis", "emergency", "suicide prevention", "mental health"],
        author: adminUser._id,
        status: "published",
        featured: true,
        priority: 10,
        publishedAt: new Date(),
        accessLevel: "public"
      }
    ];

    // Insert content
    await Content.insertMany(contentData);
    console.log(`Created ${contentData.length} content items`);

    console.log('Content seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedContent();
