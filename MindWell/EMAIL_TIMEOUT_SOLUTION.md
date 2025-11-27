# 🔧 Fix Email Connection Timeout

## Current Error
```
Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

**Problem:** Render can't connect to Gmail SMTP server.

## Solution Applied

Updated email service to:
1. **Try port 465 first** (SSL, more reliable from cloud providers)
2. **Fallback to port 587** if 465 fails
3. **Increased timeouts** to 20 seconds
4. **Added connection verification** before sending

## Alternative Solutions

If Gmail SMTP continues to timeout, consider using a dedicated email service:

### Option 1: SendGrid (Recommended)
- **Free tier:** 100 emails/day
- **More reliable** from cloud providers
- **Better deliverability**

**Setup:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Update email service to use SendGrid

### Option 2: Mailgun
- **Free tier:** 5,000 emails/month
- **Good for production**

### Option 3: AWS SES
- **Very cheap** (pay per email)
- **Highly reliable**

---

## Current Fix Status

✅ **Code updated** to try both ports (465 and 587)  
⏳ **Wait for redeploy** (2-3 minutes)  
⏳ **Test again** after redeploy

---

## If Still Not Working

### Check Render Network Restrictions
Render free tier might block outbound SMTP connections. Consider:
- **Upgrading to paid tier**
- **Using SendGrid/Mailgun** (they use API, not SMTP)

### Test After Redeploy
```bash
curl -X POST https://mindwell-final.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check backend logs for:
- `✅ SMTP server connection verified` (success)
- `🔄 Trying alternative port 587...` (fallback)
- `❌ Error sending email` (still failing)

---

**The fix is deployed. If it still times out, consider using SendGrid instead of Gmail SMTP.** 🎯

