@echo off
echo ==================================================
echo STARTING APEX ECOSYSTEM
echo ==================================================

:: Stop any existing node processes to free ports
taskkill /F /IM node.exe >nul 2>&1

:: Start Relay Server in the background
start "APEX Relay Bridge" cmd /c "cd desktop && node relay.cjs"

:: Wait 2 seconds for relay to start
timeout /t 2 /nobreak >nul

:: Start Vite Frontend in the background
start "APEX Desktop UI" cmd /c "cd desktop && npm run dev"

:: Wait 3 seconds for Vite to compile
timeout /t 3 /nobreak >nul

:: Automatically open the desktop UI in the default browser
start http://localhost:1420/

echo ==================================================
echo APEX IS RUNNING!
echo ==================================================
echo 1. Desktop UI opened automatically at http://localhost:1420
echo 2. Connect your Phone to the Wi-Fi.
echo 3. Open the Mobile App by typing the IP address shown on the Desktop into your phone's browser.
echo ==================================================
pause
