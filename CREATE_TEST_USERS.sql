-- Create Test Users for RBAC Testing (PostgreSQL/Supabase Compatible)
-- Run this SQL script in your Supabase SQL Editor

-- Note: Using ON CONFLICT to avoid errors if users already exist
-- Passwords are plaintext here - they will be hashed by your backend on first login
-- Or you can use bcrypt hashed versions if your backend expects them

-- Clear existing test users first (optional - comment out if you want to keep existing data)
-- DELETE FROM users WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1');

-- 1. Create SUPER_ADMIN
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES (
    'superadmin',
    'super@admin.com',
    'admin123', -- Use plaintext if backend hashes on login, or use bcrypt hash
    'SUPER_ADMIN',
    true,
    true
)
ON CONFLICT (username) DO UPDATE 
SET role = 'SUPER_ADMIN', enabled = true, verified = true;

-- 2. Create DEPT_ADMIN for MCA department
INSERT INTO users (username, email, password, role, enabled, verified, admin_branch)
VALUES (
    'deptadmin_mca',
    'mca@admin.com',
    'dept123',
    'DEPT_ADMIN',
    true,
    true,
    'MCA'
)
ON CONFLICT (username) DO UPDATE 
SET role = 'DEPT_ADMIN', enabled = true, verified = true, admin_branch = 'MCA';

-- 3. Create COMPANY_ADMIN for Google
INSERT INTO users (username, email, password, role, enabled, verified, company_name)
VALUES (
    'google_admin',
    'google@admin.com',
    'company123',
    'COMPANY_ADMIN',
    true,
    true,
    'Google'
)
ON CONFLICT (username) DO UPDATE 
SET role = 'COMPANY_ADMIN', enabled = true, verified = true, company_name = 'Google';

-- 4. Create STUDENT user
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES (
    'student1',
    'student@test.com',
    'student123',
    'USER',
    true,
    true
)
ON CONFLICT (username) DO UPDATE 
SET role = 'USER', enabled = true, verified = true;

-- Verify the users were created
SELECT id, username, email, role, enabled, verified, company_name, admin_branch 
FROM users 
WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1')
ORDER BY 
    CASE role
        WHEN 'SUPER_ADMIN' THEN 1
        WHEN 'DEPT_ADMIN' THEN 2
        WHEN 'COMPANY_ADMIN' THEN 3
        WHEN 'USER' THEN 4
    END;

-- Expected output:
-- superadmin      | SUPER_ADMIN    | enabled | verified
-- deptadmin_mca   | DEPT_ADMIN     | enabled | verified | admin_branch: MCA
-- google_admin    | COMPANY_ADMIN  | enabled | verified | company_name: Google
-- student1        | USER           | enabled | verified
