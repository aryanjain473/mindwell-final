# OTP Verification 500 Error - Debug Guide

## 🚨 Issues Identified

### 1. Email Configuration Problem
**Problem**: The `.env` file contains placeholder email credentials instead of actual values.

**Current .env values:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

**Solution**: Update `.env` file with real Gmail credentials.

### 2. Steps to Fix

#### Step 1: Set up Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to App Passwords
5. Generate a new app password for "Mail"
6. Copy the 16-character password

#### Step 2: Update .env file
Replace the placeholder values in `.env`:
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

#### Step 3: Test Email Configuration
Run this test script to verify email setup:

```bash
node test-email.js
```

## 🔧 Additional Debugging Steps

### Check Server Logs
1. Start the server: `npm run server`
2. Try OTP verification
3. Check console for detailed error messages

### Test Database Connection
```bash
mongosh
use mindwell
db.users.find().limit(1)
db.otps.find().limit(1)
```

### Test OTP Endpoints
```bash
# Test OTP send
curl -X POST http://localhost:8000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"email_verification"}'

# Test OTP verify
curl -X POST http://localhost:8000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","type":"email_verification"}'
```

## 🛠️ Quick Fix Script

Create a test script to verify email configuration:

```javascript
// test-email.js
import { sendOTPEmail } from './server/services/emailService.js';

const testEmail = async () => {
  try {
    const result = await sendOTPEmail('test@example.com', '123456', 'email_verification');
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
};

testEmail();
```

## 📋 Common Error Scenarios

1. **"Invalid login"** - Wrong email or app password
2. **"Connection timeout"** - Network/firewall issues
3. **"Authentication failed"** - 2FA not enabled or wrong app password
4. **"Database connection failed"** - MongoDB not running or wrong URI

## ✅ Verification Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] .env file updated with real credentials
- [ ] MongoDB running and accessible
- [ ] Server starts without errors
- [ ] Email test script works
- [ ] OTP send endpoint works
- [ ] OTP verify endpoint works
