# How to Access Admin Page

## Quick Steps to Access Admin Dashboard

### Step 1: Create Admin User

Run this command from the `server` directory:

```bash
cd finalproject/MindWell/server
node scripts/createAdmin.js
```

**Or if you're already in the MindWell directory:**
```bash
cd server
node scripts/createAdmin.js
```

This will create an admin user with:
- **Email**: `admin@mindwell.com`
- **Password**: `admin123456`

### Step 2: Start Your Servers

Make sure both backend and frontend are running:

**Terminal 1 - Backend:**
```bash
cd finalproject/MindWell
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd finalproject/MindWell
npm run client
```

### Step 3: Login as Admin

1. Go to: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@mindwell.com`
   - Password: `admin123456`
3. Click "Login"

### Step 4: Access Admin Dashboard

After logging in, you can access the admin page in two ways:

**Option 1: Direct URL**
- Go to: `http://localhost:5173/admin`

**Option 2: Through Navigation**
- The admin link should appear in the navbar if you're logged in as admin
- Or manually navigate to `/admin` in the URL

## Important Notes

⚠️ **Security**: Change the default password immediately after first login!

## Troubleshooting

### "Access Denied" or Redirected to Dashboard?

1. **Check your user role:**
   - Open browser console (F12)
   - Check if `user.role === 'admin'`
   - The AdminRoute component logs debug info

2. **Verify admin user was created:**
   - Check MongoDB to see if admin user exists
   - Run the createAdmin script again if needed

3. **Check authentication:**
   - Make sure you're logged in
   - Check if JWT token is valid
   - Try logging out and logging in again

### Admin User Already Exists?

If you see "Admin user already exists", you can:
- Use the existing admin credentials
- Or update the script to create a different admin email
- Or manually update a user's role to 'admin' in MongoDB

## Manual Admin Creation (Alternative)

If the script doesn't work, you can manually create an admin user in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@mindwell.com",
  password: "$2a$10$...", // Hashed password (use bcrypt)
  role: "admin",
  isActive: true,
  emailVerified: true,
  createdAt: new Date()
})
```

Or update an existing user:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Admin Dashboard Features

Once you access `/admin`, you'll see:
- **Overview**: Platform statistics
- **Users**: User management
- **Analytics**: Usage analytics
- **Content**: Content management
- **Notifications**: Send notifications
- **Settings**: Platform settings

---

**Need Help?** Check the browser console for any errors and ensure your servers are running properly.

