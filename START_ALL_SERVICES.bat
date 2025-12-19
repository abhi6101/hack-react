@echo off
echo ==================================================
echo      STARTING ALL LOCAL SERVICES for DEMO
echo ==================================================
echo.

echo [1/4] Cleaning up old processes (Closing stuck ports)...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo Done.
echo.

echo [2/4] Starting Backend Server (H2 Database)...
start "Backend Service (H2)" "START_BACKEND_H2.bat"
echo Backend launched. Please wait 15-20s for it to initialize.
echo.

echo [3/4] Starting OCR Python Service...
start "OCR Service" "START_OCR.bat"
echo OCR Service launched.
echo.

echo [4/4] Starting Frontend (React)...
start "Frontend Service" "START_FRONTEND.bat"
echo Frontend launched.
echo.

echo ==================================================
echo      ALL SERVICES LAUNCHED! 🚀
echo ==================================================
echo IMPORTANT: 
echo 1. Wait for the Backend window to say "Started AuthProjectApplication".
echo 2. Then refresh your browser at: http://localhost:5173
echo.
pause
