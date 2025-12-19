@echo off
echo Starting Placement Portal Backend...
cd "placement-portal-backend-clean"

echo Loading Environment Variables from local.env...
for /f "usebackq tokens=*" %%a in ("local.env") do set %%a

echo Starting Spring Boot App...
call mvnw spring-boot:run
pause
