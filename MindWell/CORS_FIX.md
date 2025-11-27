# 🔧 CORS Error Fix

## ❌ Current Error:
```
Access to XMLHttpRequest at 'https://mindwell-final.onrender.com/auth/register' 
from origin 'https://mindwell-final-lime.vercel.app' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'https://mindwell-final-lime.vercel.app/' 
that is not equal to the supplied origin.
```

## 🔍 Problem:
- Frontend URL: `https://mindwell-final-lime.vercel.app` (no trailing slash)
- Backend CLIENT_URL: `https://mindwell-final-lime.vercel.app/` (with trailing slash)
- **Mismatch!** CORS is very strict about exact matches.

## ✅ Solution:

### Step 1: Update CLIENT_URL in Render

1. **Go to Render Dashboard**
2. **Click on your service:** `mindwell-final`
3. **Go to "Environment" tab**
4. **Find `CLIENT_URL`**
5. **Update the value:**
   - ❌ Remove trailing slash: `https://mindwell-final-lime.vercel.app/`
   - ✅ Use exact URL: `https://mindwell-final-lime.vercel.app`
6. **Click "Save Changes"**
7. **Wait for redeployment** (1-2 minutes)

### Step 2: Verify CORS Configuration

The server CORS is configured to use `CLIENT_URL` from environment variables, so updating it should fix the issue.

### Step 3: Test Again

1. **Refresh your frontend:** `https://mindwell-final-lime.vercel.app`
2. **Try registering again**
3. **Check browser console** - CORS errors should be gone

---

## 🎯 Quick Fix:

**In Render Environment Variables:**
- **Key:** `CLIENT_URL`
- **Value:** `https://mindwell-final-lime.vercel.app` (NO trailing slash!)

---

## 🔍 Additional Notes:

- CORS requires **exact match** of origins
- Trailing slashes matter: `/` vs no `/`
- Protocol matters: `http://` vs `https://`
- Subdomain matters: `www.` vs no `www.`

---

**After updating CLIENT_URL, the registration should work!** 🎉

