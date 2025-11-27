# 🚨 URGENT: Fix MONGO_URI Password Encoding

## The Error
```
pymongo.errors.ConfigurationError: A DNS label is empty.
```

**Cause:** The `@` symbol in your password is breaking the MongoDB connection string.

## The Fix

### Step 1: Go to AI Service Environment Variables
1. **Go to:** Render Dashboard → `mindwell-ai-service`
2. **Click:** "Environment" tab

### Step 2: Find MONGO_URI
Look for the `MONGO_URI` environment variable.

### Step 3: Fix the Password Encoding

**Current (WRONG):**
```
mongodb+srv://aryangj_db_user:Aryanjain31@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority&appName=Cluster0
```

**Fixed (CORRECT):**
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority&appName=Cluster0
```

**What Changed:**
- `Aryanjain31@` → `Aryanjain31%40`
- The `@` symbol is URL-encoded as `%40`

### Step 4: Update the Value
1. **Click the edit icon** (pencil) next to `MONGO_URI`
2. **Replace** `Aryanjain31@` with `Aryanjain31%40`
3. **Click "Save"**

### Step 5: Wait for Redeploy
- Render will automatically redeploy
- Wait 2-3 minutes
- Check logs - should see "Application startup complete" ✅

---

## Why This Happens

MongoDB connection strings use `@` to separate credentials from the hostname:
```
mongodb+srv://USERNAME:PASSWORD@HOSTNAME
```

If your password contains `@`, it breaks the parsing:
```
mongodb+srv://user:pass@word@host  ← WRONG! Parses as user:pass, host:word@host
```

URL-encoding fixes it:
```
mongodb+srv://user:pass%40word@host  ← CORRECT! Parses as user:pass@word, host:host
```

---

## After Fix

Once redeployed, the AI service should:
- ✅ Connect to MongoDB successfully
- ✅ Start without errors
- ✅ Be accessible from the backend

Then test:
```bash
curl https://mindwell-ai-service.onrender.com/health
```

Should return:
```json
{"status":"ok","service":"mindcareai_pr","version":"3.0.0"}
```

---

**Fix this now - it's blocking the entire AI service!** 🎯

