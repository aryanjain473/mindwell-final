import dotenv from 'dotenv';
import { sendOTPEmail } from './server/services/emailService.js';

// Load environment variables
dotenv.config();

const testEmailConfiguration = async () => {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('');

  // Check if using placeholder values
  if (process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_APP_PASSWORD === 'your-gmail-app-password') {
    console.log('❌ ERROR: You are using placeholder values in .env file!');
    console.log('Please update your .env file with real Gmail credentials.');
    console.log('');
    console.log('Steps to fix:');
    console.log('1. Go to https://myaccount.google.com/');
    console.log('2. Enable 2-Step Verification');
    console.log('3. Generate an App Password');
    console.log('4. Update .env file with real credentials');
    return;
  }

  // Test email sending
  try {
    console.log('📧 Testing email sending...');
    const result = await sendOTPEmail('test@example.com', '123456', 'email_verification');
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email sending failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('- Wrong email or app password');
    console.log('- 2FA not enabled on Gmail');
    console.log('- Network/firewall blocking SMTP');
    console.log('- Gmail security settings blocking app access');
  }
};

testEmailConfiguration();
