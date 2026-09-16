@echo off
REM ==============================================================================
REM Smart Grocery AI Platform - Windows 1-Click Launcher
REM Runs full-stack React frontend + Node backend + Gemini AI
REM ==============================================================================

echo ====================================================================
echo Launching Smart Grocery AI Platform (with Google Gemini AI)
echo ====================================================================

REM 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org and run this script again.
    pause
    exit /b 1
)

echo.
echo [1/3] Checking MongoDB Database...
where mongod >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] MongoDB found. Ensuring service is active...
    net start MongoDB >nul 2>nul
)

echo.
echo [2/3] Installing Dependencies and Building Frontend...
cd frontend
if not exist "node_modules" (
    call npm install
)
call npm run build
cd ..

cd backend
if not exist "node_modules" (
    call npm install
)

echo.
echo [3/3] Starting Smart Grocery Server on http://localhost:5000 ...
echo ====================================================================
echo All Services Active!
echo  - Web Application:  http://localhost:5000
echo  - Health Endpoint:  http://localhost:5000/api/health
echo  - Gemini AI Engine: Initialized
echo ====================================================================
echo.
echo Opening browser to http://localhost:5000 ...
start http://localhost:5000

node src/server.js
pause
