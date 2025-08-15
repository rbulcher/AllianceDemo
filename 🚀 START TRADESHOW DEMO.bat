@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo    Alliance Demo - Tradeshow Setup
echo ========================================
echo.
echo Choose setup mode:
echo [1] Online  - Pull updates, install dependencies, then start
echo [2] Offline - Skip updates, start immediately with existing code
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting ONLINE setup - will check for updates...
    echo.
    :: Try PowerShell first (more reliable)
    powershell -ExecutionPolicy Bypass -File "start-tradeshow.ps1"
    
    :: If PowerShell fails, fallback to batch
    if errorlevel 1 (
        echo.
        echo PowerShell failed, trying batch version...
        echo.
        call "start-tradeshow.bat"
    )
) else if "%choice%"=="2" (
    echo.
    echo Starting OFFLINE setup - skipping updates...
    echo.
    :: Try PowerShell first with offline flag
    powershell -ExecutionPolicy Bypass -File "start-tradeshow.ps1" -Offline
    
    :: If PowerShell fails, fallback to offline setup
    if errorlevel 1 (
        echo.
        echo PowerShell failed, trying batch offline version...
        echo.
        call :offline_setup
    )
) else (
    echo.
    echo Invalid choice. Please run the script again and choose 1 or 2.
    pause
    exit /b 1
)

goto :end

:offline_setup
:: Offline setup - just configure and start without git pull or npm install
echo ========================================
echo    Alliance Demo - Offline Setup
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the AllianceDemo root directory.
    pause
    exit /b 1
)

:: Get local IP address
echo [1/3] Detecting local IP address...
setlocal enabledelayedexpansion
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%i"
    set "ip=!ip: =!"
    if "!ip!" neq "" if "!ip!" neq "127.0.0.1" (
        set "LOCAL_IP=!ip!"
        goto :ip_found_offline
    )
)

:ip_found_offline
if "%LOCAL_IP%"=="" (
    echo ERROR: Could not detect local IP address
    pause
    exit /b 1
)

echo ✓ Detected IP address: %LOCAL_IP%
echo.

:: Update server configuration
echo [2/3] Configuring server for IP: %LOCAL_IP%...

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

:: Start the application directly
echo [3/3] Starting Alliance Demo (offline mode)...
echo.
echo Starting server and client...
echo ⏳ This may take a moment...
echo.

:: Start in background
start "Alliance Demo Server" /min cmd /c "npm run dev"

:: Wait a moment for servers to start
timeout /t 5 /nobreak >nul

:: Open browser and display connection info
echo Opening display and showing connection info...
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
echo To stop the demo: Close the npm window or press Ctrl+C in it
echo.
echo ========================================

goto :end

:end

pause