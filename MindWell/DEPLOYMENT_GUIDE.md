# 🚀 MindWell Platform - Deployment Guide

Complete step-by-step guide to deploy your MERN stack application to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deploy Backend to Render](#deploy-backend-to-render)
4. [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
5. [Deploy AI Service (Optional)](#deploy-ai-service-optional)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ Render account (free tier available) - [Sign up here](https://render.com)
- ✅ Vercel account (free tier available) - [Sign up here](https://vercel.com)
- ✅ MongoDB Atlas account (free tier available) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- ✅ All API keys ready (Groq, Google Maps, etc.)

---

## ✅ Pre-Deployment Checklist

### 1. Prepare Your Code

```bash
# Navigate to project directory
cd /Users/aryan/Desktop/finalproject_final_new/finalproject/MindWell

# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier M0)
3. Create a database user:
   - Username: `mindwell-admin`
   - Password: (generate a strong password)
4. Whitelist IP addresses:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allows all IPs - for production)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://mindwell-admin:yourpassword@cluster0.xxxxx.mongodb.net/mindwell?retryWrites=true&w=majority`

### 3. Generate API Keys

- **JWT Secret**: Generate a strong random string (minimum 32 characters)
  ```bash
  # On Mac/Linux
  openssl rand -base64 32
  ```

- **Groq API Key**: Get from [Groq Console](https://console.groq.com/)
- **Google Maps API Key**: Get from [Google Cloud Console](https://console.cloud.google.com/)

---

## 🔧 Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `finalproject_final_new` (or your repo name)

### Step 2: Configure Service

**Basic Settings:**
- **Name**: `mindwell-backend`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Root Directory**: `finalproject/MindWell`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`

**OR use render.yaml (Recommended):**

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml` and create services

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindwell?retryWrites=true&w=majority
JWT_SECRET=your-generated-jwt-secret-here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
GROQ_API_KEY=your-groq-api-key
AI_SERVICE_URL=https://your-ai-service.onrender.com (or leave empty if not deploying separately)
GOOGLE_PLACES_API_KEY=your-google-places-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Copy your backend URL: `https://mindwell-backend.onrender.com`

### Step 5: Verify Backend

Test the health endpoint:
```bash
curl https://mindwell-backend.onrender.com/api/health
```

Expected response:
```json
{
  "message": "MindWell API is running!",
  "timestamp": "..."
}
```

---

## 🎨 Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `finalproject/MindWell`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://mindwell-backend.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Step 4: Update vercel.json

Edit `vercel.json` and replace:
- `your-backend-url.onrender.com` with your actual Render backend URL
- `@google-maps-api-key` with your Google Maps API key (or set as env var)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Copy your frontend URL: `https://your-project.vercel.app`

### Alternative: Deploy via CLI

```bash
cd /Users/aryan/Desktop/finalproject_final_new/finalproject/MindWell
vercel
```

Follow the prompts and set environment variables when asked.

---

## 🤖 Deploy AI Service (Optional)

If you want to deploy the Python AI service separately:

### Step 1: Create Python Web Service on Render

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `mindwell-ai-service`
   - **Root Directory**: `finalproject/mindcareai_pr`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 2: Set Environment Variables

```
GROQ_API_KEY=your-groq-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

### Step 3: Update Backend Environment

In your backend Render service, update:
```
AI_SERVICE_URL=https://mindwell-ai-service.onrender.com
```

---

## 🔄 Post-Deployment Configuration

### 1. Update CORS in Backend

Ensure your backend `CLIENT_URL` environment variable matches your Vercel frontend URL.

### 2. Update Frontend API URL

Ensure `VITE_API_URL` in Vercel matches your Render backend URL.

### 3. Test the Application

1. Visit your frontend URL
2. Try registering a new user
3. Test login functionality
4. Verify API calls are working (check browser console)

### 4. Create Admin User

SSH into your Render backend or use MongoDB Atlas shell:

```bash
# Option 1: Use Render Shell
# In Render dashboard → Shell tab, run:
cd /opt/render/project/src
node server/scripts/createAdmin.js
```

Or manually in MongoDB Atlas:
```javascript
// In MongoDB Atlas → Browse Collections → users
// Insert document:
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@mindwell.com",
  "password": "$2a$10$...", // Hashed password
  "role": "admin",
  "isActive": true,
  "emailVerified": true
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Problem**: CORS errors
- Verify `CLIENT_URL` matches your frontend URL exactly
- Check backend CORS configuration

**Problem**: Database connection failed
- Verify MongoDB Atlas IP whitelist includes Render IPs
- Check connection string format
- Ensure database user has correct permissions

### Frontend Issues

**Problem**: API calls failing
- Check `VITE_API_URL` is set correctly
- Verify backend is running and accessible
- Check browser console for CORS errors

**Problem**: Build fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**Problem**: Environment variables not working
- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after adding new environment variables

### General Issues

**Problem**: 404 errors on refresh
- Vercel should handle this with `vercel.json` rewrites
- Ensure SPA routing is configured correctly

**Problem**: Slow initial load
- Enable Vercel Edge Caching
- Optimize bundle size
- Use CDN for static assets

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created and configured
- [ ] All API keys generated and ready
- [ ] Backend deployed to Render
- [ ] Backend health check passing
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both platforms
- [ ] CORS configured correctly
- [ ] Admin user created
- [ ] Application tested end-to-end
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic on Vercel/Render)

---

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Backend Health Check**: `https://your-backend.onrender.com/api/health`
- **Frontend URL**: `https://your-project.vercel.app`

---

## 📞 Support

If you encounter issues:
1. Check Render/Vercel logs
2. Review environment variables
3. Test API endpoints directly
4. Check browser console for errors
5. Verify database connectivity

---

**🎉 Congratulations! Your MindWell platform is now live!**

