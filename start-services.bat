@echo off
REM Batch script to start both AI service and backend
REM Run this from the finalproject directory

echo 🚀 Starting MindCare Services...
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set AI_SERVICE_DIR=%SCRIPT_DIR%mindcareai_pr
set BACKEND_DIR=%SCRIPT_DIR%MindWell

REM Check if directories exist
if not exist "%AI_SERVICE_DIR%" (
    echo ❌ AI service directory not found: %AI_SERVICE_DIR%
    exit /b 1
)

if not exist "%BACKEND_DIR%" (
    echo ❌ Backend directory not found: %BACKEND_DIR%
    exit /b 1
)

REM Check for AI service virtual environment
set AI_VENV=%AI_SERVICE_DIR%\venv
if not exist "%AI_VENV%" (
    echo ❌ AI service virtual environment not found: %AI_VENV%
    echo Please set up the virtual environment first:
    echo   cd %AI_SERVICE_DIR%
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    exit /b 1
)

REM Start AI Service in a new window
echo 🤖 Starting AI Service (Port 8001)...
set AI_PYTHON=%AI_VENV%\Scripts\python.exe
start "AI Service (Port 8001)" cmd /k "cd /d %AI_SERVICE_DIR% && set PYTHONPATH=%AI_SERVICE_DIR% && %AI_PYTHON% -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

REM Wait a moment for AI service to start
timeout /t 2 /nobreak >nul

REM Start Backend in a new window
echo 🔧 Starting Backend Server (Port 8000)...
start "Backend Server (Port 8000)" cmd /k "cd /d %BACKEND_DIR% && npm run server"

echo.
echo ✅ Both services are starting in separate windows!
echo    - AI Service: http://localhost:8001
echo    - Backend: http://localhost:8000
echo.
pause


