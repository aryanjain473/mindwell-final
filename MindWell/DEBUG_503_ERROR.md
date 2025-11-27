# 🔍 Debug 503 Error - Everything is Set But Still Failing

## Current Situation
- ✅ All environment variables are set
- ✅ Backend health check works
- ✅ AI service health check works
- ❌ Frontend getting 503 errors when using chatbot

## Possible Causes

### 1. AI Service Sleeping (Free Tier)
Render free tier services spin down after 15 minutes of inactivity.

**Check:**
- Go to Render Dashboard → `mindwell-ai-service`
- Check if service status shows "Sleeping" or "Stopped"
- First request after sleep takes 30-50 seconds to wake up

**Solution:**
- Wait 30-50 seconds after first request
- Or upgrade to paid tier for always-on service

### 2. Timeout Issues
The AI service might be taking too long to respond.

**Check backend logs:**
- Go to Render Dashboard → `mindwell-final` → Logs
- Look for timeout errors or connection refused errors

**Solution:**
- Increase timeout in `chatbot.js` (currently 30000ms = 30 seconds)

### 3. Network Issues Between Render Services
Sometimes Render services have network issues connecting to each other.

**Test:**
```bash
# Test if backend can reach AI service
curl https://mindwell-final.onrender.com/api/chatbot/health
```

**If this returns 503:**
- Backend can't reach AI service
- Check if AI service is actually running
- Check Render service logs for errors

### 4. AI Service Not Fully Started
The AI service might be starting but not ready yet.

**Check AI service logs:**
- Go to Render Dashboard → `mindwell-ai-service` → Logs
- Look for startup errors or MongoDB connection errors
- Make sure you see "Application startup complete"

### 5. MongoDB Connection Issue in AI Service
The AI service might be failing to connect to MongoDB.

**Check AI service logs for:**
- `pymongo.errors.ServerSelectionTimeoutError`
- `Connection refused`
- MongoDB connection errors

**Fix:**
- Verify `MONGO_URI` is set correctly in AI service
- Should be: `mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority`

---

## Debug Steps

### Step 1: Check Backend Logs
1. Go to Render Dashboard → `mindwell-final` → Logs
2. Try to use chatbot from frontend
3. Look for errors in logs
4. Check for:
   - `ECONNREFUSED`
   - `ETIMEDOUT`
   - `ENOTFOUND`
   - `AI_SERVICE_UNAVAILABLE`

### Step 2: Check AI Service Logs
1. Go to Render Dashboard → `mindwell-ai-service` → Logs
2. Check for:
   - MongoDB connection errors
   - Startup errors
   - Request errors

### Step 3: Test Direct Connection
```bash
# Test AI service directly
curl https://mindwell-ai-service.onrender.com/health

# Test backend → AI service
curl https://mindwell-final.onrender.com/api/chatbot/health
```

### Step 4: Check Service Status
1. Go to Render Dashboard → `mindwell-ai-service`
2. Check service status:
   - Should be "Live" (green)
   - If "Sleeping" (yellow), wait 30-50 seconds for first request

---

## Quick Fixes to Try

### Fix 1: Increase Timeout
If requests are timing out, increase timeout in backend:

Edit `server/routes/chatbot.js`:
```javascript
const axiosConfig = {
  family: 4, // Force IPv4
  timeout: 60000 // Increase to 60 seconds
};
```

### Fix 2: Add Retry Logic
Add retry logic for AI service calls in case of temporary failures.

### Fix 3: Check CORS
Make sure AI service allows requests from backend (should be fine, but verify).

---

## Most Likely Issue

**Free tier service sleeping** - The AI service spins down after inactivity. First request takes 30-50 seconds to wake it up.

**Solution:**
1. Make a request to wake up the service
2. Wait 30-50 seconds
3. Try again

Or upgrade to paid tier for always-on service.

---

**Check the logs first - they'll tell you exactly what's wrong!** 🔍

