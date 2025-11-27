# 🚨 Urgent Fixes for Login & OTP Issues

## Issue 1: OTP Emails Not Sending ❌

### Problem
Gmail SMTP connection is timing out from Render's servers.

### Immediate Solution: Get OTP from Backend Logs

Since emails aren't sending, the OTP is logged to the backend console:

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Request OTP** from your Vercel frontend
3. **Look for this line in logs:**
   ```
   📧 OTP for aj7498197470@gmail.com: 123456
   ```
4. **Use that OTP code** to verify your email

### Long-term Solution: Use SendGrid

Gmail SMTP is unreliable from cloud providers. Switch to SendGrid:

1. **Sign up:** [SendGrid](https://sendgrid.com) (free: 100 emails/day)
2. **Create API key**
3. **Update email service** to use SendGrid API

---

## Issue 2: Unable to Login ❌

### Step 1: Check Backend Logs

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Try to login** from Vercel frontend
3. **Look for:**
   ```
   ❌ Login error: ...
   Error stack: ...
   ```

### Step 2: Check if User Exists

**Option A: Try Registration**
1. Go to your Vercel frontend
2. Try to register with `aj7498197470@gmail.com`
3. **If it says "User already exists":** User is in database, password might be wrong
4. **If registration succeeds:** User didn't exist, now you can login

**Option B: Check MongoDB**
1. Go to MongoDB Atlas
2. Browse Collections → `mindwell` → `users`
3. Check if user with email `aj7498197470@gmail.com` exists

### Step 3: Common Login Issues

#### Issue A: User Doesn't Exist
**Fix:** Register the user first

#### Issue B: Password Wrong
**Fix:** 
- Password must match exactly what was used during registration
- Check if password was hashed correctly
- Try resetting password (if that feature exists)

#### Issue C: Database Connection Error
**Fix:** Check `MONGODB_URI` is correct in Render

---

## Quick Action Plan

### Right Now (To Get OTP):
1. ✅ Go to Render → `mindwell-final` → Logs
2. ✅ Request OTP from frontend
3. ✅ Find OTP code in logs: `📧 OTP for email: 123456`
4. ✅ Use that code to verify email

### Right Now (To Login):
1. ✅ Check backend logs for login error
2. ✅ Try registering again if user doesn't exist
3. ✅ Verify password is correct

### Later (To Fix Email):
1. ⏳ Sign up for SendGrid
2. ⏳ Update email service to use SendGrid API
3. ⏳ Test OTP emails work

---

## Test Commands

### Test Login:
```bash
curl -X POST https://mindwell-final.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aj7498197470@gmail.com","password":"Aryanjain31@"}'
```

### Test OTP Send:
```bash
curl -X POST https://mindwell-final.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"aj7498197470@gmail.com"}'
```

Then check backend logs for the OTP code.

---

## Most Likely Scenarios

### Scenario 1: User Not Registered
- **Symptom:** Login fails, registration works
- **Fix:** Register first, then login

### Scenario 2: Password Mismatch
- **Symptom:** Login fails with 401 or 500
- **Fix:** Check password, or register with new password

### Scenario 3: Email Service Down
- **Symptom:** OTP not received
- **Fix:** Get OTP from backend logs (temporary), use SendGrid (permanent)

---

**Check the backend logs NOW - they'll show the OTP code and login error!** 🔍

