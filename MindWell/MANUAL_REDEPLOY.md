# 🔄 Manual Render Redeploy Guide

## If Auto-Deploy Isn't Working:

### Option 1: Manual Redeploy in Render Dashboard

1. **Go to Render Dashboard:**
   - https://dashboard.render.com

2. **Click on your service:** `mindwell-final`

3. **Click "Manual Deploy"** (top right)

4. **Select:**
   - **Branch:** `main`
   - **Commit:** Latest commit (should show the CORS fix)

5. **Click "Deploy"**

6. **Wait 2-3 minutes** for deployment

7. **Check Logs** to see the deployment progress

---

### Option 2: Force Push (if needed)

If Render isn't detecting the changes, you can force a redeploy:

1. **Make a small change** to trigger deployment:
   ```bash
   cd /Users/aryan/Desktop/finalproject_final_new/finalproject/MindWell
   echo "# Deployment trigger" >> README.md
   git add README.md
   git commit -m "Trigger redeploy"
   git push origin main
   ```

2. **Wait for Render to auto-deploy**

---

### Option 3: Check Render Settings

1. **Go to Render Dashboard** → Your Service → **Settings**

2. **Check "Auto-Deploy":**
   - Should be **enabled**
   - Should be connected to `main` branch

3. **Check "GitHub Repository":**
   - Should be: `aryanjain473/mindwell-final`
   - Should show latest commit

---

## Verify Code is Pushed:

Run this locally to check:
```bash
cd /Users/aryan/Desktop/finalproject_final_new/finalproject
git log --oneline -5
```

Should see:
- `Allow all Vercel preview URLs in CORS`
- `Fix API URL to include /api prefix`
- `Fix CORS origin callback to return actual origin`

---

## Check Render Logs:

1. **Go to Render Dashboard** → Your Service
2. **Click "Logs" tab**
3. **Look for:**
   - Latest deployment timestamp
   - "Deploying..." messages
   - Server startup messages

---

**Try Manual Deploy first - it's the fastest way!** 🚀


