# 🔍 Check Backend Logs for 503 Error

## Current Issue
- Frontend getting 503 errors when starting chatbot session
- Error: `/api/chatbot/session/start` returning 503

## Step 1: Check Backend Logs

1. **Go to:** Render Dashboard → `mindwell-final`
2. **Click:** "Logs" tab
3. **Try to start a chatbot session** from your Vercel frontend
4. **Look for these log messages:**

### What to Look For:

**Good Signs:**
```
🔗 Calling AI service: https://mindwell-ai-service.onrender.com/session/start
```

**Error Signs:**
```
❌ Error starting chat session: ...
Error code: ECONNREFUSED
Error code: ETIMEDOUT
Error code: ENOTFOUND
AI_SERVICE_URL: http://127.0.0.1:8001  ← BAD! Should be the Render URL
```

## Step 2: Verify AI_SERVICE_URL is Set

The logs will show what `AI_SERVICE_URL` is set to. It should be:
```
AI_SERVICE_URL: https://mindwell-ai-service.onrender.com
```

**If it shows `http://127.0.0.1:8001`:**
- The environment variable is not set correctly
- Go to Render → `mindwell-final` → Environment
- Add/Update: `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`
- Save and redeploy

## Step 3: Check AI Service Status

1. **Go to:** Render Dashboard → `mindwell-ai-service`
2. **Check status:**
   - Should be "Live" (green)
   - If "Sleeping" (yellow), wait 30-50 seconds for first request

3. **Check logs:**
   - Look for MongoDB connection errors
   - Look for startup errors
   - Should see "Application startup complete"

## Step 4: Test Direct Connection

Test if backend can reach AI service:

```bash
curl https://mindwell-final.onrender.com/api/chatbot/health
```

**Expected:**
```json
{
  "success": true,
  "aiService": "online",
  "message": "AI service is healthy"
}
```

**If you get 503:**
- Backend can't reach AI service
- Check `AI_SERVICE_URL` is set correctly
- Check AI service is running

## Common Issues

### Issue 1: AI_SERVICE_URL Not Set
**Symptom:** Logs show `AI_SERVICE_URL: http://127.0.0.1:8001`  
**Fix:** Set `AI_SERVICE_URL` in Render environment variables

### Issue 2: AI Service Sleeping
**Symptom:** First request times out, subsequent requests work  
**Fix:** Wait 30-50 seconds after first request, or upgrade to paid tier

### Issue 3: MongoDB Connection Error in AI Service
**Symptom:** AI service logs show MongoDB errors  
**Fix:** Verify `MONGO_URI` is set correctly in AI service

### Issue 4: Network Timeout
**Symptom:** Logs show `ETIMEDOUT`  
**Fix:** Already increased timeout to 60 seconds, but free tier can be slow

---

## Quick Test

Run this to see what the backend sees:

```bash
curl -v https://mindwell-final.onrender.com/api/chatbot/health
```

This will show:
- If backend can reach AI service
- Response time
- Any connection errors

---

**Check the backend logs first - they'll show exactly what's wrong!** 🔍

