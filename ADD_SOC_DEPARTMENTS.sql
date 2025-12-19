-- SQL Script to Add School of Computer (SOC) Departments
-- Run this script in your database to add the departments

-- 1. MCA (Master of Computer Applications) - 4 Semesters (2 Years)
INSERT INTO departments (name, code, category, degree, hod_name, contact_email, max_semesters)
VALUES ('Master of Computer Applications', 'MCA', 'School of Computer', 'MCA', 'TBD', 'mca@college.edu', 4);

-- 2. BCA (Bachelor of Computer Applications) - 6 Semesters (3 Years)
INSERT INTO departments (name, code, category, degree, hod_name, contact_email, max_semesters)
VALUES ('Bachelor of Computer Applications', 'BCA', 'School of Computer', 'BCA', 'TBD', 'bca@college.edu', 6);

-- 3. IMCA (Integrated MCA) - 10 Semesters (5 Years)
INSERT INTO departments (name, code, category, degree, hod_name, contact_email, max_semesters)
VALUES ('Integrated Master of Computer Applications', 'IMCA', 'School of Computer', 'IMCA', 'TBD', 'imca@college.edu', 10);

-- Verify the insertions
SELECT * FROM departments WHERE category = 'School of Computer';
