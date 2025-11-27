# 🔧 Fix Login 500 Error

## Current Issue
```
POST /api/auth/login 500 (Internal Server Error)
"Login failed. Please try again."
```

## Debug Steps

### Step 1: Check Backend Logs

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Try to login** from frontend
3. **Look for error logs:**
   ```
   ❌ Login error: ...
   Error stack: ...
   Error name: ...
   ```

### Step 2: Common Causes

**Possible Issues:**
1. **Database connection error** - MongoDB not connected
2. **bcrypt error** - Password hashing/comparison failing
3. **JWT_SECRET missing** - Token generation failing
4. **User model error** - Schema validation failing

### Step 3: Verify Environment Variables

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Verify these are set:**
   - ✅ `MONGODB_URI` - MongoDB connection string
   - ✅ `JWT_SECRET` - JWT secret key
   - ✅ `JWT_EXPIRE` - Token expiration (default: 7d)

### Step 4: Test Directly

```bash
curl -X POST https://mindwell-final.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aj7498197470@gmail.com","password":"Aryanjain31@"}'
```

**Check the response and backend logs for the exact error.**

---

## Most Likely Issues

### Issue 1: User Doesn't Exist
**Symptom:** User not found in database  
**Fix:** Register the user first, or check if user exists in MongoDB

### Issue 2: Password Mismatch
**Symptom:** Password comparison failing  
**Fix:** Verify password is correct, or reset password

### Issue 3: Database Connection
**Symptom:** MongoDB connection error  
**Fix:** Check `MONGODB_URI` is set correctly

### Issue 4: bcrypt Error
**Symptom:** Password hashing/comparison error  
**Fix:** Check if bcrypt is installed correctly

---

**Check the backend logs first - they'll show the exact error!** 🔍

