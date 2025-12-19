@echo off
echo Pushing BACKEND fixes...
cd "placement-portal-backend-clean"
git add .
git commit -m "Fix ResumeFile Import and Build Errors"
git push origin main
cd ..

echo Pushing FRONTEND fixes...
cd "fully-frontend-react"
git add .
git commit -m "Patch Frontend to use config.js for API URL"
git push origin main
cd ..

echo DONE.
pause
