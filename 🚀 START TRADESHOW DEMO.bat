@echo off
cd /d "%~dp0"

echo.
echo Starting Alliance Demo Tradeshow Setup...
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

pause