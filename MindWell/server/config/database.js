import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindwell';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // In development, continue without database
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Running in development mode - continuing without database');
      return;
    }
    
    process.exit(1);
  }
};

export default connectDB;