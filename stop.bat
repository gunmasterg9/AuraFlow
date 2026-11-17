@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo               Stopping AuraFlow AI
echo ===================================================

set "STOPPED=0"

:: 1. Stop packaged AuraFlow AI executable if running
taskkill /F /IM "AuraFlow AI.exe" /T >nul 2>&1
if not errorlevel 1 (
    echo [+] Terminated AuraFlow AI packaged process.
    set "STOPPED=1"
)

:: 2. Stop running electron instances launched from node_modules
powershell -NoProfile -Command ^
    "Get-CimInstance Win32_Process -Filter \"Name = 'electron.exe'\" | Where-Object { $_.CommandLine -like '*AuraFlow-AI*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('[+] Stopped Electron PID: ' + $_.ProcessId) }"

:: 3. Stop any Node/Vite process listening on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    if not errorlevel 1 (
        echo [+] Stopped dev server process on port 5173 ^(PID: %%a^).
        set "STOPPED=1"
    )
)

echo.
echo ===================================================
echo AuraFlow AI processes stopped successfully.
echo ===================================================

endlocal

