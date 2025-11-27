# 🔧 Render Environment Variables Setup

## ⚠️ Current Issue

Your deployment is failing because these environment variables are missing:
- ❌ `MONGODB_URI` - **CRITICAL** (Database connection)
- ❌ `GOOGLE_MAPS_API_KEY` - Missing

## 📋 Step-by-Step: Add Environment Variables in Render

### Step 1: Go to Your Service
1. Open [Render Dashboard](https://dashboard.render.com)
2. Click on your service: **`mindwell-backend`**

### Step 2: Open Environment Tab
1. Click on **"Environment"** tab (left sidebar)
2. You'll see a list of environment variables

### Step 3: Add Each Variable

Click **"Add Environment Variable"** for each one below:

#### 🔴 CRITICAL - Required for App to Work:

1. **MONGODB_URI**
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string
   - **Format:** `mongodb+srv://username:password@cluster.mongodb.net/mindwell?retryWrites=true&w=majority`
   - **How to get:** 
     - Go to [MongoDB Atlas](https://cloud.mongodb.com)
     - Click "Connect" on your cluster
     - Choose "Connect your application"
     - Copy the connection string
     - Replace `<password>` with your actual password

2. **JWT_SECRET**
   - **Key:** `JWT_SECRET`
   - **Value:** Generate a random string (32+ characters)
   - **Generate:** Run this locally: `openssl rand -base64 32`
   - **Example:** `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1p`

3. **CLIENT_URL**
   - **Key:** `CLIENT_URL`
   - **Value:** Your Vercel frontend URL (or `http://localhost:5173` for now)
   - **Example:** `https://your-project.vercel.app`
   - **Note:** Update this after deploying frontend

4. **EMAIL_USER**
   - **Key:** `EMAIL_USER`
   - **Value:** Your Gmail address
   - **Example:** `yourname@gmail.com`

5. **EMAIL_APP_PASSWORD**
   - **Key:** `EMAIL_APP_PASSWORD`
   - **Value:** Gmail App Password (not your regular password)
   - **How to get:**
     - Go to [Google Account Settings](https://myaccount.google.com/)
     - Security → 2-Step Verification → App passwords
     - Generate app password for "Mail"
     - Copy the 16-character password

6. **GROQ_API_KEY**
   - **Key:** `GROQ_API_KEY`
   - **Value:** Your Groq API key
   - **Get from:** [Groq Console](https://console.groq.com/)

7. **GOOGLE_PLACES_API_KEY**
   - **Key:** `GOOGLE_PLACES_API_KEY`
   - **Value:** Your Google Places API key
   - **Get from:** [Google Cloud Console](https://console.cloud.google.com/)

8. **GOOGLE_MAPS_API_KEY**
   - **Key:** `GOOGLE_MAPS_API_KEY`
   - **Value:** Your Google Maps API key
   - **Get from:** [Google Cloud Console](https://console.cloud.google.com/)

#### 🟡 Optional - Can Add Later:

9. **AI_SERVICE_URL**
   - **Key:** `AI_SERVICE_URL`
   - **Value:** Your AI service URL (if deploying separately)
   - **Example:** `https://mindwell-ai-service.onrender.com`
   - **Note:** Can leave empty if not using separate AI service

#### 🟢 Already Set (Don't Change):

- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `8000` (or `10000` - Render auto-assigns)
- ✅ `JWT_EXPIRE` = `7d`

### Step 4: Save and Redeploy

1. After adding all variables, click **"Save Changes"**
2. Render will automatically redeploy
3. Wait 2-5 minutes for deployment
4. Check logs to verify connection

## ✅ Verification

After adding variables, check logs:
- ✅ Should see: `MONGODB_URI: Set`
- ✅ Should see: `GOOGLE_MAPS_API_KEY: Set`
- ✅ Should see: `📊 MongoDB Connected: ...`
- ❌ Should NOT see: `Database connection error`

## 🚨 Quick Fix Checklist

- [ ] Added `MONGODB_URI` (MongoDB Atlas connection string)
- [ ] Added `JWT_SECRET` (generated random string)
- [ ] Added `CLIENT_URL` (frontend URL or localhost for now)
- [ ] Added `EMAIL_USER` (your Gmail)
- [ ] Added `EMAIL_APP_PASSWORD` (Gmail app password)
- [ ] Added `GROQ_API_KEY` (from Groq console)
- [ ] Added `GOOGLE_PLACES_API_KEY` (from Google Cloud)
- [ ] Added `GOOGLE_MAPS_API_KEY` (from Google Cloud)
- [ ] Saved changes in Render
- [ ] Waited for redeployment
- [ ] Checked logs for success

## 📝 Example Values (Don't Use These - Use Your Own!)

```
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mindwell?retryWrites=true&w=majority
JWT_SECRET=your-32-character-random-secret-here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_USER=yourname@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GOOGLE_PLACES_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
AI_SERVICE_URL=
```

## 🆘 Still Having Issues?

1. **Check logs** in Render dashboard
2. **Verify** all variables are set (no typos)
3. **Test MongoDB connection** string locally
4. **Check** API keys are valid and enabled
5. **Ensure** Gmail app password is correct

---

**After adding these variables, your deployment should work!** 🎉

