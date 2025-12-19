@echo off
echo ==========================================
echo FIXING FRONTEND (Installing Missing Library)
echo ==========================================
cd "fully-frontend-react"
call npm install recharts

echo.
echo ==========================================
echo STARTING FRONTEND
echo ==========================================
npm run dev
pause
