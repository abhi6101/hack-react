-- Simple Test User Creation (Supabase/PostgreSQL)
-- Run this in Supabase SQL Editor

-- First, check if users exist
SELECT username, role, enabled, verified FROM users 
WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1');

-- If they don't exist or need to be recreated, run the following:

-- Delete existing test users (optional)
-- DELETE FROM users WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1');

-- Create SUPER_ADMIN
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES ('superadmin', 'super@admin.com', 'admin123', 'SUPER_ADMIN', true, true)
ON CONFLICT (username) DO UPDATE 
SET password = 'admin123', role = 'SUPER_ADMIN', enabled = true, verified = true;

-- Create DEPT_ADMIN
INSERT INTO users (username, email, password, role, enabled, verified, admin_branch)
VALUES ('deptadmin_mca', 'mca@admin.com', 'dept123', 'DEPT_ADMIN', true, true, 'MCA')
ON CONFLICT (username) DO UPDATE 
SET password = 'dept123', role = 'DEPT_ADMIN', enabled = true, verified = true, admin_branch = 'MCA';

-- Create COMPANY_ADMIN
INSERT INTO users (username, email, password, role, enabled, verified, company_name)
VALUES ('google_admin', 'google@admin.com', 'company123', 'COMPANY_ADMIN', true, true, 'Google')
ON CONFLICT (username) DO UPDATE 
SET password = 'company123', role = 'COMPANY_ADMIN', enabled = true, verified = true, company_name = 'Google';

-- Create STUDENT
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES ('student1', 'student@test.com', 'student123', 'USER', true, true)
ON CONFLICT (username) DO UPDATE 
SET password = 'student123', role = 'USER', enabled = true, verified = true;

-- Verify users were created
SELECT username, email, role, enabled, verified, company_name, admin_branch 
FROM users 
WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1')
ORDER BY 
    CASE role
        WHEN 'SUPER_ADMIN' THEN 1
        WHEN 'DEPT_ADMIN' THEN 2
        WHEN 'COMPANY_ADMIN' THEN 3
        WHEN 'USER' THEN 4
    END;
