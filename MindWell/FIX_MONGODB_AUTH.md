# 🔧 Fix MongoDB Authentication Error

## Current Error
```
pymongo.errors.OperationFailure: bad auth : authentication failed
```

**Status:** Connection string is parsing correctly, but authentication is failing.

## Possible Causes

### 1. Password Encoding Issue
The password might not be encoded correctly, or there might be extra characters.

### 2. Wrong Username or Password
The credentials might be incorrect.

### 3. Database User Permissions
The database user might not have access to the `mindcare_ai` database.

---

## Step-by-Step Fix

### Step 1: Verify MongoDB Atlas Credentials

1. **Go to:** [MongoDB Atlas](https://cloud.mongodb.com)
2. **Click:** "Database Access" (left sidebar)
3. **Find your user:** `aryangj_db_user`
4. **Verify:**
   - Username is correct
   - Password is correct (should be `Aryanjain31@`)

### Step 2: Get Fresh Connection String

1. **Go to:** MongoDB Atlas → "Database" → Your Cluster
2. **Click:** "Connect"
3. **Choose:** "Connect your application"
4. **Copy the connection string** they provide
5. **It will look like:**
   ```
   mongodb+srv://<username>:<password>@cluster0.8abgndi.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Build Correct Connection String

**Format:**
```
mongodb+srv://USERNAME:ENCODED_PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

**For your setup:**
- **Username:** `aryangj_db_user`
- **Password:** `Aryanjain31@` → URL-encode to `Aryanjain31%40`
- **Cluster:** `cluster0.8abgndi.mongodb.net`
- **Database:** `mindcare_ai` (for AI service) or `mindwell` (for backend)

**AI Service Connection String:**
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindcare_ai?retryWrites=true&w=majority
```

**Backend Connection String:**
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
```

### Step 4: Update MONGO_URI in AI Service

1. **Go to:** Render Dashboard → `mindwell-ai-service` → Environment
2. **Find:** `MONGO_URI`
3. **Update to:**
   ```
   mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindcare_ai?retryWrites=true&w=majority
   ```
4. **Save Changes**
5. **Wait for redeploy**

---

## Alternative: Reset MongoDB Password

If authentication keeps failing, try resetting the password:

1. **Go to:** MongoDB Atlas → "Database Access"
2. **Click:** Edit on your user (`aryangj_db_user`)
3. **Click:** "Edit Password"
4. **Set a new password** (without special characters like `@`)
5. **Update connection string** with new password
6. **Update in Render** environment variables

---

## Verify Database User Permissions

1. **Go to:** MongoDB Atlas → "Database Access"
2. **Click:** Your user (`aryangj_db_user`)
3. **Check "Database User Privileges":**
   - Should have "Read and write to any database" or
   - At least access to `mindcare_ai` and `mindwell` databases

---

## Test After Fix

After updating `MONGO_URI` and redeploying:

1. **Check AI service logs:**
   - Should see "Application startup complete"
   - No authentication errors

2. **Test health endpoint:**
   ```bash
   curl https://mindwell-ai-service.onrender.com/health
   ```

3. **Test backend connection:**
   ```bash
   curl https://mindwell-final.onrender.com/api/chatbot/health
   ```

---

## Common Issues

### Issue 1: Password Has Special Characters
**Solution:** URL-encode all special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- etc.

### Issue 2: Wrong Database Name
**Solution:** Make sure database name matches:
- AI service uses: `mindcare_ai`
- Backend uses: `mindwell`

### Issue 3: User Doesn't Have Access
**Solution:** Check database user permissions in MongoDB Atlas

---

**Try updating the MONGO_URI with the exact format above, or reset the MongoDB password if needed!** 🎯

