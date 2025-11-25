# Starting Both Services

This guide shows you how to start both the AI service and backend server.

## Quick Start Options

### Option 1: Using the Startup Scripts (Recommended)

**Windows PowerShell:**
```powershell
cd finalproject
.\start-services.ps1
```

**Windows Command Prompt:**
```cmd
cd finalproject
start-services.bat
```

### Option 2: Using npm Scripts

From the `MindWell` directory:
```bash
cd MindWell
npm run start:both
```

This will start:
- **Backend Server** on port 8000
- **AI Service** on port 8001

### Option 3: Manual Start (Separate Terminals)

**Terminal 1 - AI Service:**
```bash
cd finalproject/mindcareai_pr
venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Backend:**
```bash
cd finalproject/MindWell
npm run server
```

## Service URLs

- **Backend API**: http://localhost:8000
- **AI Service API**: http://localhost:8001
- **Frontend** (if running): http://localhost:5173

## Prerequisites

1. **AI Service:**
   - Python virtual environment set up in `mindcareai_pr/venv`
   - Dependencies installed: `pip install -r requirements.txt`

2. **Backend:**
   - Node.js and npm installed
   - Dependencies installed: `npm install` (in `MindWell` directory)
   - MongoDB running (if required)

## Troubleshooting

- If the AI service fails to start, ensure the virtual environment is activated and all dependencies are installed
- If the backend fails to start, check that MongoDB is running and the `.env` file is configured correctly
- Make sure ports 8000 and 8001 are not already in use


