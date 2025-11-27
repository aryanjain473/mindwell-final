# 🔧 Fix AI Service in Render Dashboard

## Problem
The build command in `render.yaml` isn't being applied. The service needs to be configured directly in the Render dashboard.

## Solution: Update Settings in Render Dashboard

### Step 1: Set Root Directory

1. **Go to:** https://dashboard.render.com
2. **Click on:** `mindwell-ai-service`
3. **Click:** "Settings" tab (left sidebar)
4. **Scroll down** to find "Root Directory"
5. **Set Root Directory to:** `mindcareai_pr`
6. **Click:** "Save Changes"

### Step 2: Update Build Command

1. **Still in Settings**, find "Build Command"
2. **Change from:** `pip install -r requirements.txt`
3. **Change to:** `pip install -r requirements.txt`
   (Keep it simple - the root directory setting will handle the path)

### Step 3: Verify Start Command

1. **Find "Start Command"** in Settings
2. **Should be:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **If different, change it to the above**

### Step 4: Save and Redeploy

1. **Click:** "Save Changes" at the bottom
2. **Go to:** "Events" or "Manual Deploy"
3. **Click:** "Manual Deploy" → "Deploy latest commit"
4. **Watch the logs** - should now find `requirements.txt`!

---

## Alternative: Update Build Command with Full Path

If setting Root Directory doesn't work, try updating the Build Command directly:

1. **In Settings**, find "Build Command"
2. **Change to:**
   ```bash
   cd mindcareai_pr && pip install -r requirements.txt
   ```

3. **Update Start Command to:**
   ```bash
   cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Save and redeploy**

---

## Verify It Works

After redeploying, check the logs. You should see:
- ✅ `Installing Python version...`
- ✅ `Running build command...`
- ✅ `Successfully installed...` (list of packages)
- ✅ `Starting service...`
- ✅ `Application startup complete`

Then test:
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

---

## Quick Checklist

- [ ] Set Root Directory to `mindcareai_pr` in Render Settings
- [ ] Verify Build Command is `pip install -r requirements.txt`
- [ ] Verify Start Command is `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Save Changes
- [ ] Manual Deploy
- [ ] Check logs for success
- [ ] Test health endpoint

---

**The Root Directory setting is the key fix!** 🎯

