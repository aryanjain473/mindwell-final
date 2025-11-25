#!/bin/bash
# Bash script to start both AI service and backend
# Run this from the finalproject directory

echo "🚀 Starting MindCare Services..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
AI_SERVICE_DIR="$SCRIPT_DIR/mindcareai_pr"
BACKEND_DIR="$SCRIPT_DIR/MindWell"

# Check if directories exist
if [ ! -d "$AI_SERVICE_DIR" ]; then
    echo "❌ AI service directory not found: $AI_SERVICE_DIR"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Check for AI service virtual environment
AI_VENV="$AI_SERVICE_DIR/venv"
if [ ! -d "$AI_VENV" ]; then
    echo "❌ AI service virtual environment not found: $AI_VENV"
    echo "Please set up the virtual environment first:"
    echo "  cd $AI_SERVICE_DIR"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Check if Python executable exists in venv
AI_PYTHON="$AI_VENV/bin/python"
if [ ! -f "$AI_PYTHON" ]; then
    echo "❌ Python executable not found: $AI_PYTHON"
    exit 1
fi

# Escape paths for osascript
AI_SERVICE_DIR_ESC=$(printf '%s\n' "$AI_SERVICE_DIR" | sed "s/'/'\\\\''/g")
BACKEND_DIR_ESC=$(printf '%s\n' "$BACKEND_DIR" | sed "s/'/'\\\\''/g")

# Start AI Service in a new terminal window (macOS)
echo "🤖 Starting AI Service (Port 8001)..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$AI_SERVICE_DIR_ESC' && export PYTHONPATH='$AI_SERVICE_DIR_ESC' && source venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
end tell
EOF

# Wait a moment for AI service to start
sleep 2

# Start Backend in a new terminal window (macOS)
echo "🔧 Starting Backend Server (Port 8000)..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$BACKEND_DIR_ESC' && npm run server"
end tell
EOF

echo ""
echo "✅ Both services are starting in separate terminal windows!"
echo "   - AI Service: http://localhost:8001"
echo "   - Backend: http://localhost:8000"
echo ""
echo "Press any key to exit this window (services will continue running)..."
read -n 1 -s

