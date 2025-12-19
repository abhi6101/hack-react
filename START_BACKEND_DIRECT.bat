@echo off
echo Starting Backend with DIRECT Credentials...
cd "placement-portal-backend-clean"

set "DATABASE_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
set "DATABASE_USERNAME=postgres.qagobopkgowobjwubjah"
set "DATABASE_PASSWORD=abhishi@060070"
set "JWT_SECRET=abhijainabhijainabhijainabhijainabhijainabhijainabhijainabhijain"
set "SENDER_FROM_EMAIL=hack2hired.official@gmail.com"
set "CLOUDINARY_API_KEY=924632748857127"
set "CLOUDINARY_API_SECRET=_0Hjz1XbMjvgnA7oldT2QnxGpjc"
set "CLOUDINARY_CLOUD_NAME=dctjlc7qx"

echo Credentials set. Launching...
call mvnw spring-boot:run
pause
