@echo off
title Smart Reporting System - Startup
color 0A
echo ============================================================
echo     EcoSmart City - Smart Reporting System
echo     Starting All Services...
echo ============================================================
echo.

:: Kill anything on port 5000 first
echo [1/3] Clearing port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done.
echo.

:: Start MongoDB in a new window
echo [2/3] Starting MongoDB...
start "MongoDB" cmd /k ""C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db""
timeout /t 3 /nobreak >nul
echo       Done.
echo.

:: Start Backend in a new window
echo [3/3] Starting Backend (Port 5000)...
start "Backend - Node.js" cmd /k "cd /d "c:\Users\Prasiddu\Downloads\smart g\backend" && npm run dev"
timeout /t 3 /nobreak >nul
echo       Done.
echo.

:: Start Frontend in a new window
echo [4/4] Starting Frontend (Port 3000)...
start "Frontend - Vite" cmd /k "cd /d "c:\Users\Prasiddu\Downloads\smart g\frontend" && npm run dev"
echo       Done.
echo.

echo ============================================================
echo   All services started!
echo   Open your browser at: http://localhost:3000
echo ============================================================
echo.
echo   Waiting 5 seconds then opening browser...
timeout /t 5 /nobreak >nul
start chrome http://localhost:3000
echo.
pause
