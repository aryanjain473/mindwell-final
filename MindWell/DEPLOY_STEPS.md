# 🚀 Quick Deployment Steps

Follow these exact steps to deploy your MindWell platform.

## 📋 Step-by-Step Deployment

### **STEP 1: Prepare GitHub Repository**

1. **Push code to GitHub:**
   ```bash
   cd /Users/aryan/Desktop/finalproject_final_new
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

---

### **STEP 2: Set Up MongoDB Atlas**

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Create account** (free tier)
3. **Create cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select region closest to you
   - Click "Create"
4. **Create database user:**
   - Click "Database Access" → "Add New Database User"
   - Username: `mindwell-admin`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Click "Add User"
5. **Whitelist IPs:**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
6. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://mindwell-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mindwell?retryWrites=true&w=majority`

---

### **STEP 3: Deploy Backend to Render**

1. **Go to:** https://dashboard.render.com/
2. **Sign up/Login** (use GitHub)
3. **Click "New +"** → **"Web Service"**
4. **Connect repository:**
   - Click "Connect account" if needed
   - Select your repository: `finalproject_final_new`
   - Click "Connect"
5. **Configure service:**
   - **Name:** `mindwell-backend`
   - **Region:** `Oregon (US West)`
   - **Branch:** `main`
   - **Root Directory:** `finalproject/MindWell`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:prod`
6. **Click "Advanced"** → Add environment variables:
   ```
   NODE_ENV = production
   PORT = 8000
   MONGODB_URI = [paste your MongoDB connection string from Step 2]
   JWT_SECRET = [generate: openssl rand -base64 32]
   JWT_EXPIRE = 7d
   CLIENT_URL = https://your-frontend.vercel.app (update after Step 4)
   EMAIL_USER = your-email@gmail.com
   EMAIL_APP_PASSWORD = your-gmail-app-password
   GROQ_API_KEY = [your Groq API key]
   GOOGLE_PLACES_API_KEY = [your Google Places key]
   GOOGLE_MAPS_API_KEY = [your Google Maps key]
   ```
7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your backend URL:** `https://mindwell-backend.onrender.com`
10. **Test it:** Open `https://mindwell-backend.onrender.com/api/health` in browser

---

### **STEP 4: Deploy Frontend to Vercel**

1. **Go to:** https://vercel.com/signup
2. **Sign up/Login** (use GitHub)
3. **Click "Add New..."** → **"Project"**
4. **Import repository:**
   - Select your repository: `finalproject_final_new`
   - Click "Import"
5. **Configure project:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `finalproject/MindWell`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. **Click "Environment Variables"** and add:
   ```
   VITE_API_URL = https://mindwell-backend.onrender.com
   VITE_GOOGLE_MAPS_API_KEY = [your Google Maps API key]
   ```
7. **Click "Deploy"**
8. **Wait for deployment** (2-5 minutes)
9. **Copy your frontend URL:** `https://your-project.vercel.app`

---

### **STEP 5: Update Backend CORS**

1. **Go back to Render dashboard**
2. **Click on your backend service**
3. **Go to "Environment" tab**
4. **Update `CLIENT_URL`:**
   - Change to: `https://your-project.vercel.app` (your Vercel URL)
5. **Click "Save Changes"**
6. **Wait for redeployment** (automatic)

---

### **STEP 6: Update Frontend vercel.json**

1. **In your local project, edit `vercel.json`:**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://mindwell-backend.onrender.com/api/$1"
       }
     ]
   }
   ```
2. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "Update vercel.json with backend URL"
   git push origin main
   ```
3. **Vercel will auto-redeploy**

---

### **STEP 7: Create Admin User**

1. **Go to Render dashboard**
2. **Click on your backend service**
3. **Click "Shell" tab**
4. **Run:**
   ```bash
   cd /opt/render/project/src
   node server/scripts/createAdmin.js
   ```
5. **You should see:** "Admin user created successfully"

---

### **STEP 8: Test Your Deployment**

1. **Visit your frontend URL:** `https://your-project.vercel.app`
2. **Test registration:**
   - Click "Sign Up"
   - Create a test account
   - Verify email (if OTP is enabled)
3. **Test login:**
   - Login with your test account
4. **Test admin access:**
   - Login with: `admin@mindwell.com` / `admin123456`
   - Go to: `https://your-project.vercel.app/admin`

---

## ✅ Deployment Complete!

Your MindWell platform is now live! 🎉

### **Your URLs:**
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://mindwell-backend.onrender.com`
- **API Health:** `https://mindwell-backend.onrender.com/api/health`

### **Admin Credentials:**
- **Email:** `admin@mindwell.com`
- **Password:** `admin123456`

**⚠️ Important:** Change the admin password after first login!

---

## 🐛 Common Issues

### Backend won't start
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set

### CORS errors
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Check for trailing slashes

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel
- Check backend is running (test health endpoint)
- Check browser console for errors

### 404 on page refresh
- Vercel should handle this automatically
- If not, check `vercel.json` rewrites

---

## 📞 Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Test backend directly: `curl https://your-backend.onrender.com/api/health`
4. Check browser console for frontend errors

---

**🎊 Congratulations! Your app is deployed!**

