# 🔧 Vercel 404 Error Fix

## ❌ Current Issue:
- Frontend deployed but showing 404 NOT FOUND
- `vercel.json` has placeholder backend URL

## ✅ Fix Steps:

### Step 1: Update vercel.json (Already Fixed)
- ✅ Updated backend URL to: `https://mindwell-final.onrender.com`
- ✅ Removed placeholder environment variables

### Step 2: Check Vercel Project Settings

1. **Go to Vercel Dashboard**
2. **Click on your project:** `mindwell-final-frontend`
3. **Go to "Settings" tab**
4. **Check "General" section:**

   **Root Directory:**
   - Should be: `MindWell`
   - If empty or wrong, change it to: `MindWell`

   **Build & Development Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3: Add Environment Variables in Vercel

1. **Go to "Settings" → "Environment Variables"**
2. **Add these variables:**

   - **Key:** `VITE_API_URL`
     **Value:** `https://mindwell-final.onrender.com`
     **Environments:** Production, Preview, Development

   - **Key:** `VITE_GOOGLE_MAPS_API_KEY`
     **Value:** Your Google Maps API key
     **Environments:** Production, Preview, Development

### Step 4: Commit and Push Changes

```bash
cd /Users/aryan/Desktop/finalproject_final_new/finalproject/MindWell
git add vercel.json
git commit -m "Update vercel.json with correct backend URL"
git push origin main
```

Vercel will automatically redeploy.

### Step 5: Redeploy (If Needed)

1. **Go to Vercel Dashboard**
2. **Click on your deployment**
3. **Click "Redeploy"** (three dots menu → Redeploy)
4. **Wait for deployment to complete**

---

## 🧪 Test After Fix:

1. **Visit your Vercel URL:**
   ```
   https://mindwell-final-frontend.vercel.app
   ```

2. **Should see:**
   - ✅ Your React app loads
   - ✅ No 404 error
   - ✅ API calls work (check browser console)

---

## 🔍 Common Issues:

### Still Getting 404?
- **Check Root Directory:** Must be `MindWell` in Vercel settings
- **Check Build Logs:** Make sure `dist` folder is created
- **Check Output Directory:** Should be `dist` in Vercel settings

### Build Failing?
- **Check Build Logs** in Vercel dashboard
- **Verify** `package.json` has correct build script
- **Check** all dependencies are installed

### API Calls Not Working?
- **Verify** `VITE_API_URL` is set in Vercel environment variables
- **Check** browser console for CORS errors
- **Update** `CLIENT_URL` in Render with your Vercel URL

---

## ✅ Checklist:

- [ ] Updated `vercel.json` with correct backend URL
- [ ] Set Root Directory to `MindWell` in Vercel
- [ ] Added `VITE_API_URL` environment variable
- [ ] Added `VITE_GOOGLE_MAPS_API_KEY` environment variable
- [ ] Committed and pushed changes
- [ ] Redeployed (or auto-redeployed)
- [ ] Tested frontend URL
- [ ] Updated `CLIENT_URL` in Render with Vercel URL

---

**After these fixes, your frontend should work!** 🎉

