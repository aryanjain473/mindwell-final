# ✅ Correct MongoDB Connection String

## Password Correction

**Actual Password:** `Aryanjain31` (NO `@` symbol)

## Correct Connection String for AI Service

```
mongodb+srv://aryangj_db_user:Aryanjain31@cluster0.8abgndi.mongodb.net/mindcare_ai?retryWrites=true&w=majority
```

**Important:**
- Password: `Aryanjain31` (no URL encoding needed - no special characters)
- Database: `mindcare_ai` (for AI service)
- No `%40` encoding needed!

---

## Step-by-Step Fix

### Step 1: Update MONGO_URI in AI Service

1. **Go to:** Render Dashboard → `mindwell-ai-service` → Environment
2. **Find:** `MONGO_URI`
3. **Update to:**
   ```
   mongodb+srv://aryangj_db_user:Aryanjain31@cluster0.8abgndi.mongodb.net/mindcare_ai?retryWrites=true&w=majority
   ```
4. **Save Changes**
5. **Wait for redeploy** (2-3 minutes)

---

## What Was Wrong

You were using:
- `Aryanjain31%40` (URL-encoded `@`)
- But the actual password is `Aryanjain31` (no `@`)

So MongoDB was trying to authenticate with the wrong password!

---

## After Fix

Once redeployed, the AI service should:
- ✅ Connect to MongoDB successfully
- ✅ Authenticate correctly
- ✅ Start without errors

Test:
```bash
curl https://mindwell-ai-service.onrender.com/health
```

Should return:
```json
{"status":"ok","service":"mindcareai_pr","version":"3.0.0"}
```

---

**Update the MONGO_URI with the correct password (no encoding needed)!** 🎯

