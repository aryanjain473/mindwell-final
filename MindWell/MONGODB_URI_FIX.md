# 🔧 MongoDB URI Fix for Render

## ❌ Your Current String (Has Issues):
```
mongodb+srv://aryangj_db_user:<Aryanjain31@>@cluster0.8abgndi.mongodb.net/?appName=mindwell
```

## ✅ Correct Format:

### Option 1: If your password is `Aryanjain31@` (without the `<>`):
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
```

### Option 2: If your password literally contains `<>` characters:
```
mongodb+srv://aryangj_db_user:%3CAryanjain31%40%3E@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
```

## 🔑 Key Changes:

1. **Remove `<>` around password** (if they're not part of the actual password)
2. **URL-encode special characters:**
   - `@` → `%40`
   - `<` → `%3C`
   - `>` → `%3E`
3. **Add database name to path:** `/mindwell` (before the `?`)
4. **Add standard parameters:** `?retryWrites=true&w=majority`
5. **Remove `appName`** (optional, not needed for connection)

## 📝 Step-by-Step:

### Step 1: Determine Your Actual Password
- Is your password: `Aryanjain31@` (without `<>`)?
- Or is it literally: `<Aryanjain31@>` (with `<>`)?

### Step 2: URL-Encode Special Characters

If password is `Aryanjain31@`:
- Replace `@` with `%40`
- Result: `Aryanjain31%40`

If password is `<Aryanjain31@>`:
- Replace `<` with `%3C`
- Replace `@` with `%40`
- Replace `>` with `%3E`
- Result: `%3CAryanjain31%40%3E`

### Step 3: Build the Correct URI

**Format:**
```
mongodb+srv://USERNAME:ENCODED_PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Example (if password is `Aryanjain31@`):**
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
```

## 🎯 What to Add in Render:

1. **Key:** `MONGODB_URI`
2. **Value:** Use the corrected string above (choose Option 1 or 2 based on your actual password)

## ✅ Test Your Connection String:

You can test if your connection string works by:
1. Going to MongoDB Atlas
2. Click "Connect" → "Connect your application"
3. Copy the connection string they provide
4. Replace `<password>` with your URL-encoded password
5. Add `/mindwell` before the `?`

---

**Most likely, your password is `Aryanjain31@` (without `<>`), so use:**
```
mongodb+srv://aryangj_db_user:Aryanjain31%40@cluster0.8abgndi.mongodb.net/mindwell?retryWrites=true&w=majority
```

