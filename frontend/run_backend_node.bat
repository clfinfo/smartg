@echo off
title Smart Reporting System - Node.js Backend Launcher
echo ======================================================
echo     Smart Reporting System - Node.js Backend
echo ======================================================

cd /d "%~dp0backend"

echo [1/3] Verifying dependencies...
call npm install
echo Dependencies synchronized.

echo.
echo [2/3] Booting Node.js Express Server...
echo Server will listen on http://localhost:5000
echo Close this window to stop the backend.
echo.

npm run dev
pause
