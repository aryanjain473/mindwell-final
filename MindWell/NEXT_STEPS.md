# 🎉 Next Steps - Deployment Checklist

## ✅ Completed:
- ✅ Code pushed to GitHub
- ✅ Backend deployed to Render
- ✅ MongoDB connection working
- ✅ Server running on port 10000

## 🔧 Step 1: Add Missing Environment Variables

Go to Render → Environment tab and add these:

### Required Variables:

1. **GOOGLE_MAPS_API_KEY** ⚠️ (Currently missing)
   - Key: `GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key
   - Get from: [Google Cloud Console](https://console.cloud.google.com/)

2. **JWT_SECRET** (For authentication)
   - Key: `JWT_SECRET`
   - Value: Generate with: `openssl rand -base64 32`
   - Or use any random 32+ character string

3. **JWT_EXPIRE** (Token expiration)
   - Key: `JWT_EXPIRE`
   - Value: `7d` (7 days)

4. **CLIENT_URL** (Frontend URL)
   - Key: `CLIENT_URL`
   - Value: `http://localhost:5173` (for now, update after Vercel deployment)
   - Later: `https://your-project.vercel.app`

5. **EMAIL_USER** (For sending emails)
   - Key: `EMAIL_USER`
   - Value: Your Gmail address (e.g., `yourname@gmail.com`)

6. **EMAIL_APP_PASSWORD** (Gmail app password)
   - Key: `EMAIL_APP_PASSWORD`
   - Value: Gmail App Password (16 characters)
   - Get from: Google Account → Security → App passwords

7. **GROQ_API_KEY** (For AI chatbot)
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key
   - Get from: [Groq Console](https://console.groq.com/)

8. **AI_SERVICE_URL** (Optional - if using separate AI service)
   - Key: `AI_SERVICE_URL`
   - Value: Leave empty or add your AI service URL

### Already Set (Don't Change):
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `10000` (auto-assigned by Render)
- ✅ `MONGODB_URI` = Your connection string
- ✅ `GOOGLE_PLACES_API_KEY` = Set

---

## 🧪 Step 2: Test Your Backend API

### Test Health Endpoint:
```bash
curl https://mindwell-final.onrender.com/api/health
```

Expected response: `{"status":"ok"}` or similar

### Test in Browser:
Visit: https://mindwell-final.onrender.com/api/health

---

## 🚀 Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `aryanjain473/mindwell-final`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `MindWell`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   - `VITE_API_URL` = `https://mindwell-final.onrender.com`
   - `VITE_GOOGLE_MAPS_API_KEY` = Your Google Maps API key

6. Click **"Deploy"**
7. Wait 2-5 minutes
8. Copy your Vercel URL: `https://your-project.vercel.app`

### Option B: Using Vercel CLI

```bash
cd /Users/aryan/Desktop/finalproject_final_new/finalproject/MindWell
npm install -g vercel
vercel
```

---

## 🔄 Step 4: Update Backend CORS

After deploying frontend:

1. Go to Render → Environment tab
2. Update `CLIENT_URL`:
   - Change from: `http://localhost:5173`
   - Change to: `https://your-project.vercel.app` (your Vercel URL)
3. Click **"Save Changes"**
4. Wait for redeployment

---

## 👤 Step 5: Create Admin User

1. Go to Render dashboard
2. Click on your service → **"Shell"** tab
3. Run:
   ```bash
   node server/scripts/createAdmin.js
   ```
4. This creates:
   - Email: `admin@mindwell.com`
   - Password: `admin123456`

**⚠️ Change this password after first login!**

---

## ✅ Step 6: Test Full Application

1. **Visit your frontend:** `https://your-project.vercel.app`
2. **Test features:**
   - User registration/login
   - Admin login: `admin@mindwell.com` / `admin123456`
   - API calls to backend
   - Database operations

---

## 📋 Quick Checklist:

- [ ] Add `GOOGLE_MAPS_API_KEY` to Render
- [ ] Add `JWT_SECRET` to Render
- [ ] Add `JWT_EXPIRE` to Render
- [ ] Add `CLIENT_URL` to Render (localhost for now)
- [ ] Add `EMAIL_USER` to Render
- [ ] Add `EMAIL_APP_PASSWORD` to Render
- [ ] Add `GROQ_API_KEY` to Render
- [ ] Test backend API: `https://mindwell-final.onrender.com/api/health`
- [ ] Deploy frontend to Vercel
- [ ] Update `CLIENT_URL` in Render with Vercel URL
- [ ] Create admin user
- [ ] Test full application

---

## 🎯 Priority Order:

1. **First:** Add missing environment variables (especially `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`)
2. **Second:** Test backend API endpoints
3. **Third:** Deploy frontend to Vercel
4. **Fourth:** Update CORS and test full app

---

## 🆘 Troubleshooting:

- **Backend not responding?** Check Render logs
- **CORS errors?** Verify `CLIENT_URL` matches your frontend URL
- **API errors?** Check all environment variables are set
- **Database errors?** Verify MongoDB Atlas IP whitelist

---

**Your backend is live at:** https://mindwell-final.onrender.com 🎉

