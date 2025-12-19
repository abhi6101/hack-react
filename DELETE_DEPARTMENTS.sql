-- SQL Script to DELETE ALL Department Data
-- WARNING: This will permanently delete all departments from the database
-- Use with caution!

-- Option 1: Delete ALL departments
DELETE FROM departments;

-- Option 2: Delete only specific departments (if you want to keep some)
-- Uncomment the lines below and comment out the line above

-- Delete only School of Computer departments
-- DELETE FROM departments WHERE category = 'School of Computer';

-- Delete specific departments by code
-- DELETE FROM departments WHERE code IN ('MCA', 'BCA', 'IMCA');

-- Delete BTech departments
-- DELETE FROM departments WHERE code LIKE 'BTECH_%';

-- Reset auto-increment ID (optional - starts IDs from 1 again)
-- For MySQL:
-- ALTER TABLE departments AUTO_INCREMENT = 1;

-- For PostgreSQL:
-- ALTER SEQUENCE departments_id_seq RESTART WITH 1;

-- For H2:
-- ALTER TABLE departments ALTER COLUMN id RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_departments FROM departments;
SELECT * FROM departments;
