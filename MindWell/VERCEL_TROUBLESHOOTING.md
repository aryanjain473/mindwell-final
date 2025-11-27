# 🔧 Vercel Frontend Troubleshooting Guide

## ❌ Current Issues
- Features not working on Vercel
- 503 errors from backend
- Chatbot showing "AI service temporarily unavailable"

## ✅ Step-by-Step Fix

### Step 1: Verify Vercel Environment Variables

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Verify these are set:**

   **Required:**
   - ✅ `VITE_API_URL` = `https://mindwell-final.onrender.com/api`
   - ✅ `VITE_GOOGLE_MAPS_API_KEY` = Your Google Maps API key

3. **If missing, add them:**
   - Click "Add New"
   - Set for: Production, Preview, Development
   - Save

4. **Redeploy after adding variables:**
   - Go to Deployments tab
   - Click "..." → "Redeploy"

---

### Step 2: Verify Backend Environment Variables

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Verify these are set:**

   **Critical:**
   - ✅ `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`
   - ✅ `CLIENT_URL` = Your Vercel URL (e.g., `https://mindwell-final-frontend.vercel.app`)
   - ✅ `MONGODB_URI` = MongoDB Atlas connection string
   - ✅ `JWT_SECRET` = Your JWT secret
   - ✅ `GROQ_API_KEY` = Your Groq API key

3. **If `AI_SERVICE_URL` is missing or wrong:**
   - Add/Update: `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`
   - Save Changes
   - Wait for auto-redeploy (or manually trigger)

---

### Step 3: Verify AI Service Environment Variables

1. **Go to:** Render Dashboard → `mindwell-ai-service` → Environment
2. **Verify these are set:**

   **Critical:**
   - ✅ `MONGO_URI` = MongoDB Atlas connection string (same as backend's MONGODB_URI)
   - ✅ `GROQ_API_KEY` = Your Groq API key
   - ✅ `SMTP_HOST` = `smtp.gmail.com`
   - ✅ `SMTP_PORT` = `587`
   - ✅ `SMTP_USER` = Your email
   - ✅ `SMTP_PASS` = Your email app password
   - ✅ `EMAIL_FROM` = Your email

---

### Step 4: Test Backend → AI Service Connection

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

**If you get 503 or "offline":**
- Backend's `AI_SERVICE_URL` is not set correctly
- Go back to Step 2 and fix it

---

### Step 5: Test Frontend → Backend Connection

1. **Open your Vercel frontend:** `https://mindwell-final-frontend.vercel.app`
2. **Open browser DevTools (F12)**
3. **Go to Console tab**
4. **Try to use a feature** (e.g., login, chatbot)
5. **Check for errors:**

   **CORS Errors:**
   - If you see CORS errors, update `CLIENT_URL` in backend (Step 2)
   - Make sure it matches your Vercel URL exactly

   **404 Errors:**
   - Check `VITE_API_URL` is set correctly in Vercel (Step 1)
   - Should be: `https://mindwell-final.onrender.com/api`

   **503 Errors:**
   - Backend can't reach AI service
   - Check `AI_SERVICE_URL` in backend (Step 2)

---

### Step 6: Verify Vercel Root Directory

1. **Go to:** Vercel Dashboard → Your Project → Settings → General
2. **Check "Root Directory":**
   - Should be: `MindWell`
   - If empty or wrong, change it to: `MindWell`
   - Save

---

### Step 7: Check Build Configuration

1. **Go to:** Vercel Dashboard → Your Project → Settings → General
2. **Verify Build & Development Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

---

## 🧪 Quick Tests

### Test 1: Backend Health
```bash
curl https://mindwell-final.onrender.com/api/health
```

### Test 2: AI Service Health
```bash
curl https://mindwell-ai-service.onrender.com/health
```

### Test 3: Backend → AI Service
```bash
curl https://mindwell-final.onrender.com/api/chatbot/health
```

### Test 4: Frontend API Call
Open browser console on Vercel frontend and run:
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

---

## 📋 Complete Checklist

### Vercel (Frontend)
- [ ] `VITE_API_URL` = `https://mindwell-final.onrender.com/api`
- [ ] `VITE_GOOGLE_MAPS_API_KEY` = Your API key
- [ ] Root Directory = `MindWell`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Redeployed after adding environment variables

### Render Backend (`mindwell-final`)
- [ ] `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`
- [ ] `CLIENT_URL` = Your Vercel URL
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Your JWT secret
- [ ] `GROQ_API_KEY` = Your Groq API key
- [ ] All other required variables set

### Render AI Service (`mindwell-ai-service`)
- [ ] `MONGO_URI` = MongoDB Atlas connection string
- [ ] `GROQ_API_KEY` = Your Groq API key
- [ ] All SMTP variables set
- [ ] Service is running (check logs)

---

## 🎯 Most Common Issues

### Issue 1: 503 from Backend
**Cause:** Backend can't reach AI service  
**Fix:** Set `AI_SERVICE_URL` in backend environment variables

### Issue 2: CORS Errors
**Cause:** Backend's `CLIENT_URL` doesn't match Vercel URL  
**Fix:** Update `CLIENT_URL` in backend to your exact Vercel URL

### Issue 3: 404 on API Calls
**Cause:** `VITE_API_URL` not set in Vercel  
**Fix:** Add `VITE_API_URL` = `https://mindwell-final.onrender.com/api` in Vercel

### Issue 4: Features Not Loading
**Cause:** Environment variables not set or wrong  
**Fix:** Go through checklist above and verify all variables

---

**After completing all steps, your Vercel frontend should work!** 🚀

