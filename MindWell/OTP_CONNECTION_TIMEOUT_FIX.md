# 🔧 Fix OTP Email Connection Timeout

## Current Error
```
"Failed to send OTP email", "error": "Connection timeout"
```

**Problem:** Backend can't connect to Gmail SMTP server.

## Fix Applied

Updated email service configuration to use explicit SMTP settings instead of `service: 'gmail'`:

- ✅ Changed to explicit `host: 'smtp.gmail.com'` and `port: 587`
- ✅ Added connection timeouts
- ✅ Improved TLS configuration

## Next Steps

### Step 1: Verify Environment Variables

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Verify these are set:**
   - ✅ `EMAIL_USER` - Your Gmail address (e.g., `yourname@gmail.com`)
   - ✅ `EMAIL_APP_PASSWORD` - Your Gmail App Password (16 characters, no spaces)

### Step 2: Create Gmail App Password (If Not Done)

1. **Go to:** [Google Account](https://myaccount.google.com/)
2. **Click:** "Security" → "2-Step Verification" (enable if not enabled)
3. **Go to:** "App passwords"
4. **Select:** "Mail" → "Other (Custom name)" → "MindWell Backend"
5. **Copy the 16-character password**
6. **Update in Render:**
   - Key: `EMAIL_APP_PASSWORD`
   - Value: 16-character password (no spaces)

### Step 3: Wait for Redeploy

- Code fix is pushed
- Render will auto-redeploy (2-3 minutes)
- Or manually trigger redeploy

### Step 4: Test After Redeploy

```bash
curl -X POST https://mindwell-final.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

**Expected:**
```json
{
  "message": "OTP sent successfully",
  "email": "your-email@gmail.com",
  "expiresIn": "10 minutes"
}
```

---

## If Still Not Working

### Check Backend Logs

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Try sending OTP**
3. **Look for:**
   - `Email sent successfully: <message-id>` ✅
   - `Error sending email: ...` ❌

### Common Issues

**Issue 1: "Invalid login: 535-5.7.8"**
- Wrong App Password
- Regenerate App Password in Google Account

**Issue 2: "Connection timeout"**
- Network issue (should be fixed with new config)
- Check if Gmail SMTP is accessible from Render

**Issue 3: "Authentication failed"**
- Wrong `EMAIL_USER` or `EMAIL_APP_PASSWORD`
- Verify both are correct in Render

---

## Alternative: Use Different Email Service

If Gmail continues to have issues, consider:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap)

---

**The fix is deployed. Verify environment variables and test again!** 🎯

