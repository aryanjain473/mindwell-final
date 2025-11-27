# 🔧 Environment Variables Fix

## ✅ You Have (Good!):
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRE`
- ✅ `EMAIL_USER`
- ✅ `EMAIL_APP_PASSWORD`
- ✅ `GROQ_API_KEY`
- ✅ `GOOGLE_PLACES_API_KEY`
- ✅ `AI_SERVICE_URL`
- ✅ `NODE_ENV`

## ⚠️ Issues to Fix:

### 1. Add `GOOGLE_MAPS_API_KEY`
- **Problem:** You have `GOOGLE_API_KEY` but code expects `GOOGLE_MAPS_API_KEY`
- **Solution:** 
  - Option A: Rename `GOOGLE_API_KEY` → `GOOGLE_MAPS_API_KEY`
  - Option B: Add new `GOOGLE_MAPS_API_KEY` (if different from Google API key)
- **Value:** Your Google Maps API key (same or different from Google API key)

### 2. Add `CLIENT_URL`
- **Key:** `CLIENT_URL`
- **Value:** `http://localhost:5173` (for now)
- **Later:** Update to `https://your-project.vercel.app` after Vercel deployment
- **Why:** Required for CORS (allows frontend to call backend)

## 📋 Action Items:

1. **In Render Environment tab:**
   - Add `GOOGLE_MAPS_API_KEY` = Your Google Maps API key
   - Add `CLIENT_URL` = `http://localhost:5173`
   - (Optional) Remove `GOOGLE_API_KEY` if it's the same as `GOOGLE_MAPS_API_KEY`

2. **Click "Save Changes"**

3. **Wait for redeployment** (1-2 minutes)

4. **Check logs** - should see:
   - ✅ `GOOGLE_MAPS_API_KEY: Set`
   - ✅ No errors

## ✅ After Fix:

Your environment variables should be:
- `MONGODB_URI` ✅
- `JWT_SECRET` ✅
- `JWT_EXPIRE` ✅
- `CLIENT_URL` ⬅️ ADD THIS
- `EMAIL_USER` ✅
- `EMAIL_APP_PASSWORD` ✅
- `GROQ_API_KEY` ✅
- `GOOGLE_PLACES_API_KEY` ✅
- `GOOGLE_MAPS_API_KEY` ⬅️ ADD THIS (or rename GOOGLE_API_KEY)
- `AI_SERVICE_URL` ✅
- `NODE_ENV` ✅

---

**After adding these two, your backend should be fully configured!** 🎉

