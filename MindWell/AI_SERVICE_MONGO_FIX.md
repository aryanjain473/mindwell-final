# 🔧 Fix MongoDB Connection for AI Service

## ❌ Current Error
```
pymongo.errors.ServerSelectionTimeoutError: localhost:27017: [Errno 111] Connection refused
```

**Problem:** AI service is trying to connect to `localhost:27017` instead of MongoDB Atlas.

## ✅ Solution: Add MONGO_URI Environment Variable

The AI service uses `MONGO_URI` (different from backend's `MONGODB_URI`).

### Step 1: Go to AI Service Settings

1. **Go to:** Render Dashboard → `mindwell-ai-service`
2. **Click:** "Environment" tab
3. **Click:** "Add Environment Variable"

### Step 2: Add MONGO_URI

- **Key:** `MONGO_URI`
- **Value:** Use the same MongoDB Atlas connection string as your backend:
  ```
  mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
  ```

**Note:** 
- The `%40` is the URL-encoded `@` symbol
- The database name is `/mindwell`
- This is the same connection string your backend uses

### Step 3: Add GROQ_API_KEY (if not already set)

- **Key:** `GROQ_API_KEY`
- **Value:** Your Groq API key (same as backend)

### Step 4: Save and Redeploy

1. **Click:** "Save Changes"
2. **Wait for auto-redeploy** (or manually trigger)
3. **Check logs** - should see successful MongoDB connection

---

## ✅ Expected Log Output After Fix

After redeploying, you should see:
```
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

**No more MongoDB connection errors!** ✅

---

## 📋 Complete AI Service Environment Variables

Make sure these are all set in `mindwell-ai-service`:

- ✅ `MONGO_URI` - MongoDB Atlas connection string ⬅️ **ADD THIS**
- ✅ `GROQ_API_KEY` - Your Groq API key
- ✅ `SMTP_HOST` - `smtp.gmail.com`
- ✅ `SMTP_PORT` - `587`
- ✅ `SMTP_USER` - Your email
- ✅ `SMTP_PASS` - Your email app password
- ✅ `EMAIL_FROM` - Your email

---

**After adding `MONGO_URI`, the AI service will connect to MongoDB Atlas successfully!** 🎯

