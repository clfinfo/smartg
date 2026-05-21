@echo off
echo =======================================================
echo     Smart Reporting System - Live Frontend UI Launcher
echo =======================================================

cd /d "%~dp0"

echo.
echo Checking NPM Modules...
if not exist "node_modules" (
    echo Installing base dependencies...
    call npm install
)

echo.
echo Launching Live Frontend UI Development Server...
echo Server running at http://localhost:5173 / http://localhost:3000
echo.
call npm run dev

pause
