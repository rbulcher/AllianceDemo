# Alliance Demo - Tradeshow Setup Script
# PowerShell version for Windows
param(
    [switch]$Offline
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($Offline) {
    Write-Host "    Alliance Demo - Offline Setup" -ForegroundColor Cyan  
} else {
    Write-Host "    Alliance Demo - Online Setup" -ForegroundColor Cyan  
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Please run this script from the AllianceDemo root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $stepCount = if ($Offline) { 4 } else { 6 }
    $currentStep = 1

    # Step 1: Git pull for latest changes (skip if offline)
    if (-not $Offline) {
        Write-Host "[$currentStep/$stepCount] Pulling latest changes from GitHub..." -ForegroundColor Yellow
        $gitResult = git pull 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Successfully pulled latest changes" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Git pull failed. Continuing with existing code..." -ForegroundColor Yellow
        }
        Write-Host ""
        $currentStep++
    }

    # Step 2: Get local IP address
    Write-Host "[$currentStep/$stepCount] Detecting local IP address..." -ForegroundColor Yellow
    $networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -ne "127.0.0.1" -and 
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
    }
    
    $LOCAL_IP = $networkAdapters | Select-Object -First 1 | Select-Object -ExpandProperty IPAddress
    
    if (-not $LOCAL_IP) {
        Write-Host "ERROR: Could not detect local IP address" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✓ Detected IP address: $LOCAL_IP" -ForegroundColor Green
    Write-Host ""
    $currentStep++

    # Step 3: Update server configuration
    Write-Host "[$currentStep/$stepCount] Configuring server for IP: $LOCAL_IP..." -ForegroundColor Yellow
    
    # Create or update server .env file
    @"
PORT=5000
HOST_IP=$LOCAL_IP
NODE_ENV=development
"@ | Out-File -FilePath "server\.env" -Encoding ASCII

    # Create or update client .env file
    @"
REACT_APP_SERVER_HOST_IP=$LOCAL_IP
REACT_APP_SERVER_PORT=5000
REACT_APP_SERVER_URL=http://$LOCAL_IP:5000
BROWSER=none
"@ | Out-File -FilePath "client\.env" -Encoding ASCII

    Write-Host "✓ Configuration files updated" -ForegroundColor Green
    Write-Host ""
    $currentStep++

    # Step 4: Install dependencies (skip if offline)
    if (-not $Offline) {
        Write-Host "[$currentStep/$stepCount] Checking dependencies..." -ForegroundColor Yellow
        
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing root dependencies..."
            npm install
        }
        
        if (-not (Test-Path "client\node_modules")) {
            Write-Host "Installing client dependencies..."
            Push-Location client
            npm install
            Pop-Location
        }
        
        if (-not (Test-Path "server\node_modules")) {
            Write-Host "Installing server dependencies..."
            Push-Location server
            npm install
            Pop-Location
        }
        
        Write-Host "✓ Dependencies ready" -ForegroundColor Green
        Write-Host ""
        $currentStep++
    }

    # Step 5: Start the application
    Write-Host "[$currentStep/$stepCount] Starting Alliance Demo..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting server and client..."
    Write-Host "⏳ This may take a moment..."
    Write-Host ""

    # Start the application in a new window
    Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Minimized

    # Wait for servers to start
    Start-Sleep -Seconds 5
    $currentStep++

    # Step 6: Open browser and display connection info
    Write-Host "[$currentStep/$stepCount] Opening display and showing connection info..." -ForegroundColor Yellow
    Write-Host ""

    # Open Chrome to the display page
    Start-Process "chrome" -ArgumentList "http://$LOCAL_IP:3000/display"

    # Display connection information
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "       *** ALLIANCE DEMO READY! ***" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Display opened in Chrome browser"
    Write-Host ""
    Write-Host "CONTROLLER CONNECTION (for iPad/mobile):" -ForegroundColor Cyan
    Write-Host "    http://$LOCAL_IP:3000/controller" -ForegroundColor White
    Write-Host ""
    Write-Host "ADMIN PANEL:" -ForegroundColor Cyan
    Write-Host "    http://$LOCAL_IP:3000/admin" -ForegroundColor White
    Write-Host "    Password: 7913" -ForegroundColor White
    Write-Host ""
    Write-Host "Local Network URLs:" -ForegroundColor Cyan
    Write-Host "    Display:    http://$LOCAL_IP:3000/display" -ForegroundColor White
    Write-Host "    Controller: http://$LOCAL_IP:3000/controller" -ForegroundColor White
    Write-Host "    Admin:      http://$LOCAL_IP:3000/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Setup Instructions:" -ForegroundColor Yellow
    Write-Host "1. Display should already be open in Chrome"
    Write-Host "2. On iPad/phone, open Safari and go to:"
    Write-Host "   http://$LOCAL_IP:3000/controller" -ForegroundColor White
    Write-Host "3. Start demonstrating!"
    Write-Host ""
    Write-Host "To stop the demo: Close the npm window or press Ctrl+C in it" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green

    # Keep the window open
    Write-Host ""
    Read-Host "Press Enter to close this window (demo will keep running)"

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}