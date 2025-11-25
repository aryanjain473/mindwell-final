# PowerShell script to start both AI service and backend
# Run this from the finalproject directory

Write-Host "🚀 Starting MindCare Services..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$aiServiceDir = Join-Path $scriptDir "mindcareai_pr"
$backendDir = Join-Path $scriptDir "MindWell"

# Check if directories exist
if (-not (Test-Path $aiServiceDir)) {
    Write-Host "❌ AI service directory not found: $aiServiceDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found: $backendDir" -ForegroundColor Red
    exit 1
}

# Check for AI service virtual environment
$aiVenv = Join-Path $aiServiceDir "venv"
if (-not (Test-Path $aiVenv)) {
    Write-Host "❌ AI service virtual environment not found: $aiVenv" -ForegroundColor Red
    Write-Host "Please set up the virtual environment first:" -ForegroundColor Yellow
    Write-Host "  cd $aiServiceDir" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Start AI Service in a new window
Write-Host "🤖 Starting AI Service (Port 8001)..." -ForegroundColor Cyan
$aiPython = Join-Path $aiVenv "Scripts\python.exe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aiServiceDir'; Write-Host '🤖 AI Service (Port 8001)' -ForegroundColor Cyan; `$env:PYTHONPATH='$aiServiceDir'; & '$aiPython' -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

# Wait a moment for AI service to start
Start-Sleep -Seconds 2

# Start Backend in a new window
Write-Host "🔧 Starting Backend Server (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host '🔧 Backend Server (Port 8000)' -ForegroundColor Cyan; npm run server"

Write-Host ""
Write-Host "✅ Both services are starting in separate windows!" -ForegroundColor Green
Write-Host "   - AI Service: http://localhost:8001" -ForegroundColor Yellow
Write-Host "   - Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


