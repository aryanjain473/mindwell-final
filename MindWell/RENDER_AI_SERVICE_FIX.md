# 🔧 Render AI Service Deployment Fix

## Problem
The AI service deployment was failing with:
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

## Root Cause
The AI service code is in the `mindcareai_pr/` subdirectory, but Render was looking for `requirements.txt` in the repository root.

## Solution Applied
Updated `render.yaml` to change to the `mindcareai_pr` directory before running build and start commands:

```yaml
buildCommand: cd mindcareai_pr && pip install -r requirements.txt
startCommand: cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Alternative: Set Root Directory in Render Dashboard

If the above doesn't work, you can manually set the root directory in Render:

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click on:** `mindwell-ai-service`
3. **Go to:** Settings
4. **Find:** "Root Directory"
5. **Set to:** `mindcareai_pr`
6. **Save** and redeploy

## Verify Fix

After pushing the updated `render.yaml`:

1. **Wait for Render to auto-deploy** (or manually trigger)
2. **Check deployment logs** - should see:
   - `cd mindcareai_pr && pip install -r requirements.txt`
   - Successful installation of packages
   - Server starting on port

3. **Test health endpoint:**
   ```bash
   curl https://mindwell-ai-service.onrender.com/health
   ```

4. **Update backend environment variable:**
   - Go to Render → `mindwell-final` → Environment
   - Set `AI_SERVICE_URL` = `https://mindwell-ai-service.onrender.com`

## Next Steps

1. ✅ Push the updated `render.yaml`
2. ⏳ Wait for AI service to deploy successfully
3. 🔧 Set `AI_SERVICE_URL` in backend environment variables
4. ✅ Test chatbot functionality

---

**Note:** The chatbot will work without the AI service (showing empty sessions), but deploying the AI service enables full chatbot functionality.

