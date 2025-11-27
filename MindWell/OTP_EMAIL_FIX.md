# 🔧 Fix OTP Email Not Receiving

## Current Issue
- OTP emails are not being received
- Been trying for days

## Possible Causes

### 1. Email Service Not Configured
The backend might not have email credentials set.

### 2. Gmail App Password Issues
- App password might be wrong
- 2FA might not be enabled
- App password might be expired

### 3. Email Going to Spam
- Check spam/junk folder
- Gmail might be blocking emails

### 4. Backend Email Service Errors
- SMTP connection failing
- Authentication errors

---

## Step 1: Check Backend Environment Variables

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Verify these are set:**
   - ✅ `EMAIL_USER` - Your Gmail address (e.g., `yourname@gmail.com`)
   - ✅ `EMAIL_APP_PASSWORD` - Your Gmail App Password (16 characters, no spaces)

3. **If missing or wrong:**
   - See Step 2 below to create App Password
   - Update in Render
   - Save and redeploy

---

## Step 2: Create Gmail App Password

If you don't have a Gmail App Password:

1. **Go to:** [Google Account](https://myaccount.google.com/)
2. **Click:** "Security" (left sidebar)
3. **Enable 2-Step Verification** (if not already enabled)
4. **Go to:** "App passwords" (under "Signing in to Google")
5. **Select app:** "Mail"
6. **Select device:** "Other (Custom name)"
7. **Enter name:** "MindWell Backend"
8. **Click:** "Generate"
9. **Copy the 16-character password** (no spaces)
10. **Update in Render:**
    - Key: `EMAIL_APP_PASSWORD`
    - Value: The 16-character password (no spaces)

---

## Step 3: Check Backend Logs

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Try to send OTP** from frontend
3. **Look for these log messages:**

**Good Signs:**
```
Email sent successfully: <message-id>
```

**Error Signs:**
```
Error sending email: ...
Invalid login: 535-5.7.8 Username and Password not accepted
Connection timeout
```

---

## Step 4: Test OTP Endpoint Directly

Test if the endpoint is working:

```bash
curl -X POST https://mindwell-final.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

**Expected Success Response:**
```json
{
  "message": "OTP sent successfully",
  "email": "your-email@gmail.com",
  "expiresIn": "10 minutes"
}
```

**If you get error:**
- Check the error message
- Check backend logs for details

---

## Step 5: Check Email Settings

### Check Spam Folder
- OTP emails might be going to spam
- Check spam/junk folder
- Mark as "Not Spam" if found

### Check Gmail Filters
- Gmail might be filtering emails
- Check "Filters and Blocked Addresses" in Gmail settings

### Check Gmail Security
- Gmail might be blocking "less secure apps"
- App Passwords bypass this, but verify 2FA is enabled

---

## Step 6: Verify Email Service Configuration

The email service checks for these environment variables:

```javascript
process.env.EMAIL_USER        // Your Gmail address
process.env.EMAIL_APP_PASSWORD // Gmail App Password
```

**If not set:**
- OTP will be logged to console instead of sent
- Check backend logs for: `📧 OTP for email: 123456`

---

## Common Issues

### Issue 1: "Invalid login: 535-5.7.8"
**Cause:** Wrong App Password or email address  
**Fix:** 
- Regenerate App Password
- Verify `EMAIL_USER` is correct Gmail address
- Make sure no spaces in App Password

### Issue 2: "Connection timeout"
**Cause:** SMTP server unreachable  
**Fix:** 
- Check internet connection
- Verify SMTP settings (should be `smtp.gmail.com:587`)

### Issue 3: OTP in Logs but Not Email
**Cause:** Email service not configured  
**Fix:** 
- Set `EMAIL_USER` and `EMAIL_APP_PASSWORD` in Render
- Redeploy backend

### Issue 4: Emails Going to Spam
**Cause:** Gmail filtering  
**Fix:** 
- Check spam folder
- Mark as "Not Spam"
- Add sender to contacts

---

## Quick Checklist

- [ ] `EMAIL_USER` set in Render (your Gmail address)
- [ ] `EMAIL_APP_PASSWORD` set in Render (16-char App Password, no spaces)
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password created in Google Account
- [ ] Backend redeployed after setting variables
- [ ] Checked spam folder
- [ ] Checked backend logs for errors

---

## Test After Fix

1. **Update environment variables** in Render
2. **Wait for redeploy** (2-3 minutes)
3. **Try sending OTP** from frontend
4. **Check email** (including spam)
5. **Check backend logs** for confirmation

---

**Most likely issue: `EMAIL_APP_PASSWORD` is missing or wrong. Check Render environment variables!** 🎯

