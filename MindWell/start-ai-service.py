#!/usr/bin/env python3
"""
Startup script for MindCare AI Service
This script starts the FastAPI server for the AI chatbot service
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Change to the AI service directory
    # Try mindcareai_pr first (main service), fallback to mindcareAi_incomplete
    script_dir = Path(__file__).parent
    ai_service_dir = script_dir.parent / "mindcareai_pr"
    
    if not ai_service_dir.exists():
        # Fallback to the incomplete directory if main doesn't exist
        ai_service_dir = script_dir / "mindcareAi_incomplete"
    
    if not ai_service_dir.exists():
        print("❌ AI service directory not found!")
        print(f"Expected: {ai_service_dir}")
        sys.exit(1)
    
    # Check if .env file exists (optional, don't fail if it doesn't exist)
    env_file = ai_service_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found in AI service directory!")
        print("The service may still work if environment variables are set elsewhere.")
        env_example = ai_service_dir / "env.example"
        if env_example.exists():
            print(f"To create .env file, run: cp {env_example} {env_file}")
        print("Continuing anyway...")
    
    # Check if virtual environment exists
    venv_dir = ai_service_dir / "venv"
    if not venv_dir.exists():
        print("❌ Virtual environment not found!")
        print("Please set up the Python environment first:")
        print(f"cd {ai_service_dir}")
        print("python -m venv venv")
        print("source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
        print("pip install -r requirements.txt")
        sys.exit(1)
    
    # Determine the Python executable
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / "Scripts" / "python.exe"
        uvicorn_exe = venv_dir / "Scripts" / "uvicorn.exe"
    else:  # Unix-like
        python_exe = venv_dir / "bin" / "python"
        uvicorn_exe = venv_dir / "bin" / "uvicorn"
    
    if not python_exe.exists():
        print(f"❌ Python executable not found at {python_exe}")
        sys.exit(1)
    
    # Change to AI service directory
    os.chdir(ai_service_dir)
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = str(ai_service_dir)
    
    print("🚀 Starting MindCare AI Service...")
    print(f"📁 Working directory: {ai_service_dir}")
    print(f"🐍 Python executable: {python_exe}")
    print("=" * 50)
    
    try:
        # Start the FastAPI server
        if uvicorn_exe.exists():
            cmd = [str(uvicorn_exe), "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
        else:
            cmd = [str(python_exe), "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
        
        subprocess.run(cmd, env=env, check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 AI Service stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start AI service: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ uvicorn not found. Please install it:")
        print(f"{python_exe} -m pip install uvicorn")
        sys.exit(1)

if __name__ == "__main__":
    main()
