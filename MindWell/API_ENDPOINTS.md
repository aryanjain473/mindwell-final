# 🔌 API Endpoints Guide

## ✅ Your Backend is Live!
**URL:** https://mindwell-final.onrender.com

## 🧪 Test Endpoints

### 1. Health Check (Test This First!)
```
GET https://mindwell-final.onrender.com/api/health
```

**Expected Response:**
```json
{
  "message": "MindWell API is running!",
  "timestamp": "2025-11-25T..."
}
```

### 2. Debug Environment Variables
```
GET https://mindwell-final.onrender.com/api/debug/env
```

**Expected Response:**
```json
{
  "GOOGLE_PLACES_API_KEY": "Set",
  "GOOGLE_MAPS_API_KEY": "Not set",
  "NODE_ENV": "production",
  "PORT": "10000"
}
```

---

## 📋 Available API Routes

All routes are prefixed with `/api/`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Contact
- `POST /api/contact` - Send contact form

### OTP
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP

### Dashboard
- `GET /api/dashboard` - Get dashboard data (requires auth)

### Chatbot
- `POST /api/chatbot` - Chat with AI chatbot

### Therapist
- `GET /api/therapist` - Get therapists
- `GET /api/therapist/:id` - Get therapist by ID
- `POST /api/therapist` - Create therapist (admin)

### Appointment
- `GET /api/appointment` - Get appointments (requires auth)
- `POST /api/appointment` - Create appointment (requires auth)

### Session
- `GET /api/session` - Get sessions (requires auth)
- `POST /api/session` - Create session (requires auth)

### Nearby Therapists
- `GET /api/therapists/nearby` - Find nearby therapists

### Journal
- `GET /api/journal` - Get journal entries (requires auth)
- `POST /api/journal` - Create journal entry (requires auth)

### Admin
- `GET /api/admin/*` - Admin routes (requires admin auth)

### Wellness Games
- `GET /api/wellness-games` - Get wellness games
- `POST /api/wellness-games` - Create game (admin)

### Emotion
- `GET /api/emotion` - Get emotion data (requires auth)
- `POST /api/emotion` - Track emotion (requires auth)

### Stress
- `GET /api/stress` - Get stress data (requires auth)
- `POST /api/stress` - Track stress (requires auth)

---

## 🧪 How to Test

### In Browser:
1. **Health Check:**
   ```
   https://mindwell-final.onrender.com/api/health
   ```

2. **Debug Endpoint:**
   ```
   https://mindwell-final.onrender.com/api/debug/env
   ```

### Using curl:
```bash
# Health check
curl https://mindwell-final.onrender.com/api/health

# Debug env
curl https://mindwell-final.onrender.com/api/debug/env
```

### Using Postman/Thunder Client:
- Method: `GET`
- URL: `https://mindwell-final.onrender.com/api/health`

---

## ❌ Common Errors

### "Route not found"
- **Cause:** Wrong URL or missing `/api/` prefix
- **Fix:** Make sure URL starts with `/api/`
- **Example:** 
  - ❌ `https://mindwell-final.onrender.com/health`
  - ✅ `https://mindwell-final.onrender.com/api/health`

### CORS Error
- **Cause:** Frontend URL not in `CLIENT_URL`
- **Fix:** Add your frontend URL to `CLIENT_URL` in Render

### 401 Unauthorized
- **Cause:** Missing or invalid authentication token
- **Fix:** Include JWT token in Authorization header

---

## ✅ Current Status

- ✅ Backend is live
- ✅ MongoDB connected
- ⚠️ `GOOGLE_MAPS_API_KEY` still not set
- ✅ All routes are configured

---

## 🎯 Next Steps

1. **Test health endpoint:**
   ```
   https://mindwell-final.onrender.com/api/health
   ```

2. **Add `GOOGLE_MAPS_API_KEY`** in Render Environment tab

3. **Deploy frontend** to Vercel

4. **Update `CLIENT_URL`** with Vercel URL

---

**Try the health endpoint first to confirm everything is working!** 🚀

