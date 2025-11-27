# 🔍 Check Email Environment Variables

## Current Issue
- OTP resend returning 500 error
- "Failed to resend OTP email"

## Most Likely Cause
Email environment variables are not set or incorrect in Render.

## Step 1: Check Backend Environment Variables

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Verify these are set:**

   **Required:**
   - ✅ `EMAIL_USER` - Your Gmail address
     - Example: `aj7498197470@gmail.com`
   - ✅ `EMAIL_APP_PASSWORD` - Gmail App Password
     - Should be 16 characters, no spaces
     - Example: `abcd efgh ijkl mnop` → Use as `abcdefghijklmnop` (no spaces)

3. **If missing:**
   - See Step 2 to create App Password
   - Add both variables in Render
   - Save and redeploy

---

## Step 2: Create Gmail App Password

If `EMAIL_APP_PASSWORD` is missing or wrong:

1. **Go to:** [Google Account](https://myaccount.google.com/)
2. **Click:** "Security" (left sidebar)
3. **Enable "2-Step Verification"** (if not enabled)
4. **Scroll down** to "App passwords"
5. **Click:** "App passwords"
6. **Select:**
   - App: "Mail"
   - Device: "Other (Custom name)"
   - Name: "MindWell Backend"
7. **Click:** "Generate"
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
9. **Remove spaces** when adding to Render: `abcdefghijklmnop`

---

## Step 3: Update in Render

1. **Go to:** Render Dashboard → `mindwell-final` → Environment
2. **Add/Update:**
   - **Key:** `EMAIL_USER`
   - **Value:** Your Gmail address (e.g., `aj7498197470@gmail.com`)
3. **Add/Update:**
   - **Key:** `EMAIL_APP_PASSWORD`
   - **Value:** 16-character App Password (no spaces)
4. **Save Changes**
5. **Wait for redeploy** (2-3 minutes)

---

## Step 4: Check Backend Logs

After redeploy, check logs:

1. **Go to:** Render Dashboard → `mindwell-final` → Logs
2. **Try to resend OTP** from frontend
3. **Look for:**

   **Good Signs:**
   ```
   Email sent successfully: <message-id>
   ```

   **Error Signs:**
   ```
   ❌ Error sending email: Connection timeout
   ❌ Error sending email: Invalid login: 535-5.7.8
   📧 Email service not configured - skipping email send
   ```

---

## Step 5: Test After Fix

After setting environment variables and redeploying:

```bash
curl -X POST https://mindwell-final.onrender.com/api/otp/resend \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

**Expected Success:**
```json
{
  "message": "OTP resent successfully",
  "email": "your-email@gmail.com",
  "expiresIn": "10 minutes"
}
```

---

## Common Issues

### Issue 1: "Email service not configured"
**Cause:** `EMAIL_USER` or `EMAIL_APP_PASSWORD` not set  
**Fix:** Add both environment variables in Render

### Issue 2: "Invalid login: 535-5.7.8"
**Cause:** Wrong App Password or email  
**Fix:** Regenerate App Password, verify `EMAIL_USER` is correct

### Issue 3: "Connection timeout"
**Cause:** Network/SMTP connection issue  
**Fix:** Should be fixed with latest code update, verify environment variables

---

## Quick Checklist

- [ ] `EMAIL_USER` set in Render (your Gmail address)
- [ ] `EMAIL_APP_PASSWORD` set in Render (16-char, no spaces)
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password created in Google Account
- [ ] Backend redeployed after setting variables
- [ ] Checked backend logs for errors

---

**Most likely: `EMAIL_APP_PASSWORD` is missing or wrong. Check Render environment variables!** 🎯

