# 🔧 Fix Registration 400 Error

## Current Issue
```
POST /api/auth/register 400 (Bad Request)
```

The registration endpoint is working, but validation is failing.

## Registration Validation Requirements

The backend validates these fields:

### Required Fields:
- ✅ `firstName` - Required, max 50 characters
- ✅ `lastName` - Required, max 50 characters
- ✅ `email` - Required, valid email format
- ✅ `password` - Required, must meet all criteria below

### Password Requirements:
- ✅ At least 8 characters long
- ✅ At least one lowercase letter (a-z)
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one number (0-9)
- ✅ Maximum 128 characters

---

## How to Debug

### Step 1: Check Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try to register**
4. **Look for the error response** - it should show:
   ```json
   {
     "message": "Validation failed",
     "errors": ["Password must contain at least one uppercase letter", ...]
   }
   ```

### Step 2: Check Network Tab

1. **Go to Network tab** in DevTools
2. **Try to register**
3. **Click on the failed request** (`/api/auth/register`)
4. **Go to "Response" tab**
5. **See the exact validation errors**

---

## Common Validation Errors

### Error: "Password must contain at least one uppercase letter"
**Fix:** Add at least one capital letter (A-Z) to your password

### Error: "Password must contain at least one lowercase letter"
**Fix:** Add at least one lowercase letter (a-z) to your password

### Error: "Password must contain at least one number"
**Fix:** Add at least one number (0-9) to your password

### Error: "Password must be at least 8 characters long"
**Fix:** Make password at least 8 characters

### Error: "First name is required" or "Last name is required"
**Fix:** Make sure firstName and lastName are being sent in the request

### Error: "Email is required" or "Please enter a valid email address"
**Fix:** Make sure email is valid format (e.g., `user@example.com`)

---

## Example Valid Registration Data

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

**Password breakdown:**
- ✅ 12 characters (meets 8+ requirement)
- ✅ Contains lowercase: `assword`
- ✅ Contains uppercase: `P`
- ✅ Contains number: `123`

---

## Frontend Fix

If your frontend form isn't showing validation errors:

1. **Check the error response** in the network tab
2. **Display the errors** to the user
3. **Add client-side validation** to show errors before submitting

Example error handling:
```javascript
try {
  const response = await api.post('/auth/register', formData);
  // Success
} catch (error) {
  if (error.response?.data?.errors) {
    // Show validation errors
    console.log('Validation errors:', error.response.data.errors);
    // Display to user
  }
}
```

---

## Test Registration

You can test the registration endpoint directly:

```bash
curl -X POST https://mindwell-final.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Expected Success Response:**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }
}
```

---

**Check the browser console/network tab to see the exact validation errors!** 🔍

