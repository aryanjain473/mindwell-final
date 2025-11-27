# 🔧 Fix Render Root Directory Issue

## Problem
Render can't find `mindcareai_pr` directory. This is likely because the **Root Directory** setting is incorrect.

## Solution: Check and Fix Root Directory

### Step 1: Check Current Root Directory Setting

1. **Go to:** https://dashboard.render.com
2. **Click:** `mindwell-ai-service`
3. **Click:** "Settings" tab
4. **Find:** "Root Directory" field
5. **Check what it says:**
   - If it's **empty** or **blank** → Go to Step 2A
   - If it says **`MindWell`** → Go to Step 2B
   - If it says something else → Go to Step 2C

---

### Step 2A: Root Directory is Empty (Should work, but let's verify)

1. **Keep Root Directory:** Empty/blank (this means repository root)
2. **Build Command should be:** `cd mindcareai_pr && pip install -r requirements.txt`
3. **Start Command should be:** `cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Save and redeploy**

If this still doesn't work, try Step 2C.

---

### Step 2B: Root Directory is Set to `MindWell` (Most Likely Issue!)

If Root Directory is `MindWell`, then Render is looking in the wrong place.

**Option 1: Clear Root Directory (Recommended)**
1. **Set Root Directory to:** (empty/blank)
2. **Build Command:** `cd mindcareai_pr && pip install -r requirements.txt`
3. **Start Command:** `cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Save and redeploy**

**Option 2: Keep Root Directory as `MindWell`**
1. **Keep Root Directory:** `MindWell`
2. **Build Command:** `cd ../mindcareai_pr && pip install -r requirements.txt`
3. **Start Command:** `cd ../mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Save and redeploy**

---

### Step 2C: Alternative - Use Absolute Path Detection

If the above doesn't work, use a more robust build command:

**Build Command:**
```bash
if [ -d "mindcareai_pr" ]; then cd mindcareai_pr && pip install -r requirements.txt; elif [ -d "../mindcareai_pr" ]; then cd ../mindcareai_pr && pip install -r requirements.txt; else echo "Error: mindcareai_pr not found" && exit 1; fi
```

**Start Command:**
```bash
if [ -d "mindcareai_pr" ]; then cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT; else cd ../mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT; fi
```

---

## Quick Fix (Try This First!)

1. **Go to Settings**
2. **Set Root Directory to:** (empty/blank - clear it if it has a value)
3. **Build Command:** `cd mindcareai_pr && pip install -r requirements.txt`
4. **Start Command:** `cd mindcareai_pr && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Save Changes**
6. **Manual Deploy**

---

## Verify Repository Structure

The repository should have this structure:
```
mindwell-final/
├── MindWell/
│   └── ...
├── mindcareai_pr/          ← This should be at root level
│   ├── requirements.txt
│   ├── main.py
│   └── ...
└── ...
```

If `mindcareai_pr` is at the root level in GitHub, then Root Directory should be **empty**.

---

## Still Not Working?

If none of the above works, check:
1. **GitHub repository:** https://github.com/aryanjain473/mindwell-final
2. **Verify** that `mindcareai_pr/requirements.txt` exists in the repository
3. **Check** if there are any `.gitignore` rules excluding it (shouldn't be)

Let me know what the Root Directory setting currently shows! 🎯

