# 🤖 AI Service Setup Guide

## Current Status

The chatbot feature requires a separate Python AI service. Currently, the backend is configured to gracefully handle when the AI service is unavailable:

- **`/api/chatbot/sessions`** - Returns empty array instead of 503 error
- **`/api/chatbot/session/start`** - Returns 503 with clear error message
- **Other endpoints** - Return appropriate error messages

---

## Option 1: Deploy AI Service (Recommended for Full Functionality)

### Step 1: Check if AI Service Code Exists

The AI service should be in: `../mindcareai_pr/` (relative to MindWell)

### Step 2: Deploy to Render

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your repository** (or create a new one for the AI service)
4. **Configure:**
   - **Name:** `mindwell-ai-service`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

### Step 3: Set Environment Variables in Render

Add these in Render → Your AI Service → Environment:
- `GROQ_API_KEY` - Your Groq API key
- `SMTP_HOST` - `smtp.gmail.com`
- `SMTP_PORT` - `587`
- `SMTP_USER` - Your email
- `SMTP_PASS` - Your email app password
- `EMAIL_FROM` - Your email

### Step 4: Update Backend Environment Variable

In Render → `mindwell-final` → Environment:
- **Add/Update:** `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`

### Step 5: Redeploy Backend

The backend will automatically use the new AI service URL.

---

## Option 2: Use Without AI Service (Graceful Degradation)

The app will work, but chatbot features will be limited:

✅ **Works:**
- User registration/login
- Dashboard
- Therapist search
- Appointments
- Journal entries
- Wellness games
- All other features

❌ **Limited:**
- Chatbot sessions will show as empty
- Starting new chat will show "AI service unavailable" message
- Chat history will be empty

**No action needed** - the app handles this gracefully!

---

## Option 3: Use Local AI Service (Development Only)

For local development:

1. **Set in `.env` file:**
   ```env
   AI_SERVICE_URL=http://localhost:8001
   ```

2. **Start AI service locally:**
   ```bash
   cd ../mindcareai_pr
   ./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Start backend:**
   ```bash
   npm run start:backend
   ```

---

## Verify AI Service is Working

### Check Health Endpoint

```bash
curl https://mindwell-ai-service.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "MindCare AI"
}
```

### Check from Backend

```bash
curl https://mindwell-final.onrender.com/api/chatbot/health
```

Should return:
```json
{
  "success": true,
  "aiService": "online",
  "message": "AI service is healthy"
}
```

---

## Troubleshooting

### Error: "AI service is temporarily unavailable"

**Causes:**
1. AI service not deployed
2. `AI_SERVICE_URL` not set in Render
3. AI service is down/sleeping (free tier)

**Solutions:**
- Deploy AI service (Option 1)
- Set `AI_SERVICE_URL` in Render environment variables
- Wait 30 seconds for free tier service to wake up
- Check AI service logs in Render

### Error: "AI service not configured"

**Cause:** `AI_SERVICE_URL` is not set or is set to localhost

**Solution:** Set `AI_SERVICE_URL` in Render environment variables to your deployed AI service URL

---

## Current Configuration

Check your Render environment variables:
- Go to: https://dashboard.render.com → `mindwell-final` → Environment
- Look for: `AI_SERVICE_URL`

**If not set:** The chatbot will work but return empty sessions (graceful degradation)

**If set:** The chatbot will connect to the AI service at that URL

---

**The fix has been deployed!** The frontend should now show an empty chat history instead of an error. 🎉

