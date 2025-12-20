-- ============================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Placement Portal - All New Features
-- ============================================

-- 1. ADD NEW COLUMNS TO USERS TABLE
-- ============================================

-- Add admin_branch for DEPT_ADMIN
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_branch VARCHAR(100);

-- Add allowed_departments for COMPANY_ADMIN
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS allowed_departments VARCHAR(500);

-- Add computer_code for unique student identification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS computer_code VARCHAR(50) UNIQUE;

-- Add id_card_path for ID card storage
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS id_card_path VARCHAR(255);

-- Add batch field for students (passout year)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS batch VARCHAR(10);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_admin_branch ON users(admin_branch);
CREATE INDEX IF NOT EXISTS idx_users_computer_code ON users(computer_code);
CREATE INDEX IF NOT EXISTS idx_users_batch ON users(batch);

-- ============================================
-- 2. CREATE DEPARTMENT_BRANCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS department_branches (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(100) UNIQUE NOT NULL,
    degree VARCHAR(100),
    max_semesters INTEGER NOT NULL DEFAULT 4,
    hod_name VARCHAR(255),
    contact_email VARCHAR(255),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dept_branches_dept_id ON department_branches(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_branches_code ON department_branches(branch_code);

-- ============================================
-- 3. CREATE INTERVIEW_ELIGIBLE_BATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS interview_eligible_batches (
    id SERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    batch VARCHAR(10) NOT NULL,
    CONSTRAINT fk_interview_drive 
        FOREIGN KEY (interview_id) 
        REFERENCES interview_drives(id) 
        ON DELETE CASCADE
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_eligible_batches_interview_id 
ON interview_eligible_batches(interview_id);

-- ============================================
-- 4. UPDATE DEPARTMENTS TABLE (OPTIONAL)
-- ============================================

-- Add description field if not exists
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS description VARCHAR(500);

-- Add timestamps if not exists
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 5. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample departments
INSERT INTO departments (name, code, description) 
VALUES 
    ('School of Computer Science', 'SOC', 'Computer Science and IT programs'),
    ('School of Engineering', 'SOE', 'Engineering programs')
ON CONFLICT (code) DO NOTHING;

-- Insert sample branches
INSERT INTO department_branches (department_id, branch_name, branch_code, degree, max_semesters, hod_name)
SELECT 
    d.id,
    'Master of Computer Applications',
    'MCA',
    'MCA',
    4,
    'Dr. John Doe'
FROM departments d WHERE d.code = 'SOC'
ON CONFLICT (branch_code) DO NOTHING;

INSERT INTO department_branches (department_id, branch_name, branch_code, degree, max_semesters, hod_name)
SELECT 
    d.id,
    'Bachelor of Computer Applications',
    'BCA',
    'BCA',
    6,
    'Dr. Jane Smith'
FROM departments d WHERE d.code = 'SOC'
ON CONFLICT (branch_code) DO NOTHING;

INSERT INTO department_branches (department_id, branch_name, branch_code, degree, max_semesters, hod_name)
SELECT 
    d.id,
    'Integrated MCA',
    'IMCA',
    'IMCA',
    10,
    'Dr. Bob Johnson'
FROM departments d WHERE d.code = 'SOC'
ON CONFLICT (branch_code) DO NOTHING;

INSERT INTO department_branches (department_id, branch_name, branch_code, degree, max_semesters, hod_name)
SELECT 
    d.id,
    'B.Tech Computer Science',
    'BTECH_CSE',
    'B.Tech',
    8,
    'Dr. Alice Williams'
FROM departments d WHERE d.code = 'SOE'
ON CONFLICT (branch_code) DO NOTHING;

-- ============================================
-- 6. VERIFY MIGRATION
-- ============================================

-- Check users table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check department_branches table
SELECT COUNT(*) as branch_count FROM department_branches;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('users', 'department_branches', 'interview_eligible_batches')
ORDER BY tablename, indexname;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================

-- Summary:
-- ✅ Added 5 new columns to users table
-- ✅ Created department_branches table
-- ✅ Created interview_eligible_batches table
-- ✅ Added indexes for performance
-- ✅ Added sample data for testing
