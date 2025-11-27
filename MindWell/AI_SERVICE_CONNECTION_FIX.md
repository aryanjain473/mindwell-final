# 🔧 Fix AI Service Connection Issue

## Current Situation
- ✅ `AI_SERVICE_URL` is set correctly in backend: `https://mindwell-ai-service.onrender.com`
- ✅ AI service environment variables are set
- ❌ Backend still can't connect to AI service (503 errors)

## Possible Causes

### 1. AI Service Sleeping (Free Tier)
Render free tier services spin down after 15 minutes of inactivity. First request takes 30-50 seconds.

**Solution:**
- Wait 30-50 seconds after first request
- Or upgrade to paid tier for always-on service

### 2. Network Timeout
The connection might be timing out before the AI service wakes up.

**Current timeout:** 60 seconds (should be enough, but free tier can be slow)

### 3. AI Service Not Fully Started
The AI service might be starting but MongoDB connection is failing.

**Check AI service logs:**
- Go to Render Dashboard → `mindwell-ai-service` → Logs
- Look for MongoDB connection errors
- Should see "Application startup complete"

### 4. MONGO_URI Password Encoding Issue
I noticed the `MONGO_URI` in AI service has `@` in password instead of `%40`.

**Current:** `mongodb+srv://aryangj_db_user:Aryanjain31@cluster0...`
**Should be:** `mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0...`

**Fix:**
1. Go to Render Dashboard → `mindwell-ai-service` → Environment
2. Find `MONGO_URI`
3. Change `Aryanjain31@` to `Aryanjain31%40`
4. Save and redeploy

---

## Step-by-Step Debug

### Step 1: Check AI Service Status
1. Go to Render Dashboard → `mindwell-ai-service`
2. Check status:
   - Should be "Live" (green)
   - If "Sleeping" (yellow), wait 30-50 seconds

### Step 2: Check AI Service Logs
1. Go to Render Dashboard → `mindwell-ai-service` → Logs
2. Look for:
   - MongoDB connection errors
   - Startup errors
   - Should see "Application startup complete"

### Step 3: Test AI Service Directly
```bash
curl https://mindwell-ai-service.onrender.com/health
```

**Expected:**
```json
{"status":"ok","service":"mindcareai_pr","version":"3.0.0"}
```

**If this fails:**
- AI service is not running
- Check logs for errors
- Fix MongoDB connection if needed

### Step 4: Check Backend Logs
1. Go to Render Dashboard → `mindwell-final` → Logs
2. Look for startup logs:
   ```
   AI_SERVICE_URL: https://mindwell-ai-service.onrender.com
   ```
3. Try using chatbot from frontend
4. Look for error logs:
   ```
   ❌ Error starting chat session: ...
   Error code: ECONNREFUSED
   Error code: ETIMEDOUT
   ```

---

## Quick Fixes to Try

### Fix 1: Fix MONGO_URI Password Encoding
1. Go to Render → `mindwell-ai-service` → Environment
2. Update `MONGO_URI`:
   - Change: `Aryanjain31@` 
   - To: `Aryanjain31%40`
3. Save and redeploy

### Fix 2: Wake Up AI Service
1. Make a request to wake it up:
   ```bash
   curl https://mindwell-ai-service.onrender.com/health
   ```
2. Wait 30-50 seconds
3. Try using chatbot again

### Fix 3: Check Backend Can Reach AI Service
After backend redeploys with new logging, check logs for:
- `🔗 Calling AI service: ...`
- `❌ Error starting chat session: ...`
- Error code and details

---

## Most Likely Issue

**AI Service Sleeping + MongoDB Connection Issue**

The AI service might be:
1. Sleeping (free tier)
2. Failing to connect to MongoDB (password encoding issue)

**Fix both:**
1. Fix `MONGO_URI` password encoding
2. Wait for AI service to fully start
3. Test again

---

**Check the AI service logs first - they'll show if MongoDB connection is failing!** 🔍

