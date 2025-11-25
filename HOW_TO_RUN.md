# How to Run the MindWell Project

This is a full-stack mental health platform with three main components:
1. **Frontend**: React/TypeScript application
2. **Backend**: Node.js/Express server
3. **AI Service**: Python FastAPI service

## Prerequisites

Before running the project, ensure you have installed:
- **Node.js** (v16 or higher) and npm
- **Python** (v3.8 or higher)
- **MongoDB** (running locally or MongoDB Atlas connection string)

## Quick Start (Recommended)

### Option 1: Using the PowerShell Script (Windows)

```powershell
cd finalproject
.\start-services.ps1
```

This will automatically start both the AI service and backend server in separate windows.

### Option 2: Using npm Scripts

```bash
cd finalproject/MindWell
npm run start:both
```

This starts both backend (port 8000) and AI service (port 8001).

Then in a separate terminal, start the frontend:
```bash
cd finalproject/MindWell
npm run client
```

## Detailed Setup Instructions

### Step 1: Set Up Environment Variables

1. Navigate to the MindWell directory:
   ```bash
   cd finalproject/MindWell
   ```

2. Copy the environment example file:
   ```bash
   copy env.example .env
   ```

3. Edit the `.env` file and configure:
   - `MONGODB_URI`: Your MongoDB connection string (default: `mongodb://localhost:27017/mindwell`)
   - `JWT_SECRET`: A secret key for JWT tokens
   - `EMAIL_USER` and `EMAIL_APP_PASSWORD`: For email functionality (optional)
   - `GROQ_API_KEY`: For AI chatbot features (get from https://console.groq.com/)
   - `VITE_GOOGLE_MAPS_API_KEY`: For Google Maps features (optional)

### Step 2: Install Frontend/Backend Dependencies

```bash
cd finalproject/MindWell
npm install
```

### Step 3: Set Up Python AI Service

1. Navigate to the AI service directory:
   ```bash
   cd finalproject/mindcareai_pr
   ```

2. Activate the virtual environment (if it exists):
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Or if using Command Prompt
   venv\Scripts\activate.bat
   ```

3. If the virtual environment doesn't exist, create it:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows
   # or: source venv/bin/activate  # Mac/Linux
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in `mindcareai_pr` directory (if needed):
   ```bash
   # Copy from env.example or create manually
   # Add GROQ_API_KEY and other required variables
   ```

### Step 4: Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
- If installed as a service, it should start automatically
- Or run: `mongod` in a terminal

**Mac/Linux:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### Step 5: Run the Services

You have three options:

#### Option A: Run All Services Separately (3 Terminals)

**Terminal 1 - AI Service:**
```bash
cd finalproject/mindcareai_pr
.\venv\Scripts\Activate.ps1  # Windows
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Backend Server:**
```bash
cd finalproject/MindWell
npm run server
```

**Terminal 3 - Frontend:**
```bash
cd finalproject/MindWell
npm run client
```

#### Option B: Use npm Scripts (2 Terminals)

**Terminal 1 - Backend + AI Service:**
```bash
cd finalproject/MindWell
npm run start:both
```

**Terminal 2 - Frontend:**
```bash
cd finalproject/MindWell
npm run client
```

#### Option C: Run Everything Together
```bash
cd finalproject/MindWell
npm run dev:full
```

## Service URLs

Once all services are running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **AI Service API**: http://localhost:8001
- **AI Service Docs**: http://localhost:8001/docs (FastAPI Swagger UI)

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
- **Port 8000**: Backend server - stop any process using this port
- **Port 8001**: AI service - stop any process using this port
- **Port 5173**: Frontend (Vite) - stop any process using this port
- **Port 27017**: MongoDB - ensure MongoDB is running

### Python Virtual Environment Issues
- Make sure you're using the correct Python version (3.8+)
- Try recreating the virtual environment: `python -m venv venv`
- On Windows, you may need to run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` or `mongo` (depending on your MongoDB version)
- Check the `MONGODB_URI` in your `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

### Missing Dependencies
- Frontend/Backend: Run `npm install` again in `MindWell` directory
- Python: Run `pip install -r requirements.txt` in `mindcareai_pr` directory

### Environment Variables Not Loading
- Ensure `.env` file exists in `MindWell` directory
- Check that variable names match exactly (case-sensitive)
- Restart the services after changing `.env` file

## Project Structure

```
finalproject/
├── MindWell/              # Frontend + Backend
│   ├── src/              # React frontend source
│   ├── server/           # Express backend
│   ├── package.json      # Node.js dependencies
│   └── .env             # Environment variables
│
├── mindcareai_pr/        # Python AI Service
│   ├── main.py          # FastAPI application
│   ├── requirements.txt # Python dependencies
│   └── venv/            # Python virtual environment
│
└── mongodb-data/         # MongoDB data (if using local MongoDB)
```

## Next Steps

1. Open http://localhost:5173 in your browser
2. Register a new account or login
3. Explore the features:
   - Chat with the AI chatbot
   - Journal entries
   - Emotion tracking
   - Therapist appointments
   - Wellness games

## Need Help?

- Check the individual README files:
  - `MindWell/README.md` - Frontend/Backend details
  - `mindcareai_pr/README.md` - AI service details
- Review the setup guides:
  - `MindWell/SETUP_GUIDE.md`
  - `MindWell/CHATBOT_SETUP.md`
  - `START_SERVICES.md`

