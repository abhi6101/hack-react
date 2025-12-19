@echo off
echo Starting Backend with LOCAL H2 DATABASE (Safety Net)...
cd "placement-portal-backend-clean"

:: Override DB Config to use H2 Memory DB
set "DATABASE_URL=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
set "DATABASE_USERNAME=sa"
set "DATABASE_PASSWORD="
set "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
set "spring.datasource.driver-class-name=org.h2.Driver"

set "JWT_SECRET=abhijainabhijainabhijainabhijainabhijainabhijainabhijainabhijain"
set "SENDER_FROM_EMAIL=hack2hired.official@gmail.com"
set "CLOUDINARY_API_KEY=924632748857127"
set "CLOUDINARY_API_SECRET=_0Hjz1XbMjvgnA7oldT2QnxGpjc"
set "CLOUDINARY_CLOUD_NAME=dctjlc7qx"

echo Launching with H2 Database...
call mvnw spring-boot:run
pause
