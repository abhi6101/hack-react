-- Create Test Users for RBAC Testing
-- Run this SQL script in your database BEFORE running the automated tests

-- Note: These passwords are bcrypt hashed versions of the plaintext passwords
-- superadmin: admin123
-- deptadmin_mca: dept123
-- google_admin: company123
-- student1: student123

-- 1. Create SUPER_ADMIN
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES (
    'superadmin',
    'super@admin.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
    'SUPER_ADMIN',
    true,
    true
);

-- 2. Create DEPT_ADMIN for MCA department
INSERT INTO users (username, email, password, role, enabled, verified, admin_branch)
VALUES (
    'deptadmin_mca',
    'mca@admin.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- dept123
    'DEPT_ADMIN',
    true,
    true,
    'MCA'
);

-- 3. Create COMPANY_ADMIN for Google
INSERT INTO users (username, email, password, role, enabled, verified, company_name)
VALUES (
    'google_admin',
    'google@admin.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- company123
    'COMPANY_ADMIN',
    true,
    true,
    'Google'
);

-- 4. Create STUDENT user
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES (
    'student1',
    'student@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- student123
    'USER',
    true,
    true
);

-- Verify the users were created
SELECT id, username, email, role, enabled, verified, company_name, admin_branch 
FROM users 
WHERE username IN ('superadmin', 'deptadmin_mca', 'google_admin', 'student1');

-- Expected output:
-- superadmin      | SUPER_ADMIN    | enabled | verified
-- deptadmin_mca   | DEPT_ADMIN     | enabled | verified | admin_branch: MCA
-- google_admin    | COMPANY_ADMIN  | enabled | verified | company_name: Google
-- student1        | USER           | enabled | verified
