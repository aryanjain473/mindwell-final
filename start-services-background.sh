#!/bin/bash
# Bash script to start both AI service and backend in background
# Run this from the finalproject directory

echo "🚀 Starting MindCare Services in background..."
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

# Create log directory if it doesn't exist
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Start AI Service in background
echo "🤖 Starting AI Service (Port 8001) in background..."
cd "$AI_SERVICE_DIR"
export PYTHONPATH="$AI_SERVICE_DIR"
source venv/bin/activate
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload > "$LOG_DIR/ai-service.log" 2>&1 &
AI_PID=$!
echo "   AI Service PID: $AI_PID"
echo "   Logs: $LOG_DIR/ai-service.log"

# Wait a moment for AI service to start
sleep 2

# Start Backend in background
echo "🔧 Starting Backend Server (Port 8000) in background..."
cd "$BACKEND_DIR"
nohup npm run server > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: $LOG_DIR/backend.log"

echo ""
echo "✅ Both services are running in the background!"
echo "   - AI Service: http://localhost:8001 (PID: $AI_PID)"
echo "   - Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo ""
echo "To stop the services, run:"
echo "   kill $AI_PID $BACKEND_PID"
echo ""
echo "To view logs:"
echo "   tail -f $LOG_DIR/ai-service.log"
echo "   tail -f $LOG_DIR/backend.log"
echo ""

