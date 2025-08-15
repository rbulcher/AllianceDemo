@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    Alliance Demo - Tradeshow Setup
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the AllianceDemo root directory.
    pause
    exit /b 1
)

:: Step 1: Git pull for latest changes
echo [1/6] Pulling latest changes from GitHub...
git pull
if errorlevel 1 (
    echo WARNING: Git pull failed. Continuing with existing code...
) else (
    echo ✓ Successfully pulled latest changes
)
echo.

:: Step 2: Get local IP address
echo [2/6] Detecting local IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%i"
    set "ip=!ip: =!"
    if "!ip!" neq "" if "!ip!" neq "127.0.0.1" (
        set "LOCAL_IP=!ip!"
        goto :ip_found
    )
)

:ip_found
if "%LOCAL_IP%"=="" (
    echo ERROR: Could not detect local IP address
    pause
    exit /b 1
)

echo ✓ Detected IP address: %LOCAL_IP%
echo.

:: Step 3: Update server configuration
echo [3/6] Configuring server for IP: %LOCAL_IP%...

:: Create or update server .env file
echo PORT=5000 > server\.env
echo HOST_IP=%LOCAL_IP% >> server\.env
echo NODE_ENV=development >> server\.env

:: Create or update client .env file  
echo REACT_APP_SERVER_HOST_IP=%LOCAL_IP% > client\.env
echo REACT_APP_SERVER_PORT=5000 >> client\.env
echo REACT_APP_SERVER_URL=http://%LOCAL_IP%:5000 >> client\.env
echo BROWSER=none >> client\.env

echo ✓ Configuration files updated
echo.

:: Step 4: Install dependencies (if needed)
echo [4/6] Checking dependencies...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client && npm install && cd ..
)
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server && npm install && cd ..
)
echo ✓ Dependencies ready
echo.

:: Step 5: Start the application
echo [5/6] Starting Alliance Demo...
echo.
echo Starting server and client...
echo ⏳ This may take a moment...
echo.

:: Start in background and capture the process ID
start "Alliance Demo Server" /min cmd /c "npm run dev"

:: Wait a moment for servers to start
timeout /t 5 /nobreak >nul

:: Step 6: Open browser and display connection info
echo [6/6] Opening display and showing connection info...
echo.

:: Open Chrome to the display page
start chrome "http://%LOCAL_IP%:3000/display"

:: Display connection information
echo ========================================
echo       *** ALLIANCE DEMO READY! ***
echo ========================================
echo.
echo Display opened in Chrome browser
echo.
echo CONTROLLER CONNECTION (for iPad/mobile):
echo     http://%LOCAL_IP%:3000/controller
echo.
echo ADMIN PANEL:
echo     http://%LOCAL_IP%:3000/admin
echo     Password: 7913
echo.
echo Local Network URLs:
echo     Display:    http://%LOCAL_IP%:3000/display  
echo     Controller: http://%LOCAL_IP%:3000/controller
echo     Admin:      http://%LOCAL_IP%:3000/admin
echo.
echo ========================================
echo.
echo Quick Setup Instructions:
echo 1. Display should already be open in Chrome
echo 2. On iPad/phone, open Safari and go to:
echo    http://%LOCAL_IP%:3000/controller
echo 3. Start demonstrating!
echo.
echo To stop the demo: Close this window or press Ctrl+C
echo.
echo ========================================

:: Keep the window open to show the information
echo Press any key to close this window (demo will keep running)...
pause >nul