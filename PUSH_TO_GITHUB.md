# Push to GitHub - Quick Guide

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `mindwell`
3. Description: "Mental Health Platform - Final Year Project"
4. Choose Private or Public
5. **DO NOT** initialize with README
6. Click "Create repository"

## Step 2: Push Code

Run these commands in the `finalproject` directory:

```bash
cd /Users/aryan/Desktop/finalproject_final_new/finalproject

# Add remote (replace 'mindwell' with your actual repo name)
git remote add origin https://github.com/aryanjain473/mindwell.git

# Ensure you're on main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

When prompted:
- **Username**: `aryanjain473`
- **Password**: Use your GitHub Personal Access Token (not your password)

## Step 3: Verify

Check your repository at: https://github.com/aryanjain473/mindwell

You should see:
- ✅ All project files
- ✅ Deployment configuration files
- ✅ README.md

## Next: Deploy to Render

After pushing, follow `MindWell/DEPLOY_STEPS.md` to deploy to Render and Vercel.

