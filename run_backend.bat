@echo off
echo =======================================================
echo     Smart Reporting System - Live Backend Launcher
echo =======================================================

cd /d "%~dp0backend"

echo.
echo [1/3] Checking Python Virtual Environment...
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

echo.
echo [2/3] Activating Virtual Environment and Installing Dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [3/3] Booting Flask Server...
echo Server running on http://localhost:5000
echo Close this window to stop the backend.
echo.
python app.py

pause
