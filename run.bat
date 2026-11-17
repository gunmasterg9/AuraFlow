@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo               AuraFlow AI Launcher
echo ===================================================

:: Ensure Electron runs in full GUI desktop mode
set "ELECTRON_RUN_AS_NODE="

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [!] node_modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: If user explicitly asked for dev mode: run.bat dev
if /i "%1"=="dev" goto :run_dev

:: Check if production dist exists
if not exist "dist\index.html" (
    echo [*] Production build not found. Running npm run build...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
)

echo [*] Starting AuraFlow AI...
call npm start
goto :end

:run_dev
echo [*] Starting AuraFlow AI in Development Mode (Vite + Electron)...
call npm run dev

:end
endlocal

