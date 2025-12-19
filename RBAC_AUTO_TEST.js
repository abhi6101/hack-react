// Automated RBAC Testing Script
// Run this in browser console to test all role-based features

const API_BASE = 'https://placement-portal-backend-production.up.railway.app/api';

// Test Results Storage
const testResults = {
    passed: [],
    failed: [],
    total: 0
};

// Helper Functions
const log = (emoji, message) => console.log(`${emoji} ${message}`);
const pass = (test) => { testResults.passed.push(test); testResults.total++; log('✅', test); };
const fail = (test, error) => { testResults.failed.push({ test, error }); testResults.total++; log('❌', `${test}: ${error}`); };

// Test Configuration
const testUsers = {
    superAdmin: { username: 'superadmin', password: 'admin123', role: 'SUPER_ADMIN' },
    deptAdmin: { username: 'deptadmin_mca', password: 'dept123', role: 'DEPT_ADMIN', department: 'MCA' },
    companyAdmin: { username: 'google_admin', password: 'company123', role: 'COMPANY_ADMIN', company: 'Google' },
    student: { username: 'student1', password: 'student123', role: 'USER' }
};

// Authentication Helper
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        return data.token;
    } catch (error) {
        return null;
    }
}

// API Test Helper
async function testAPI(endpoint, method, token, body = null, expectedStatus = 200) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    return {
        status: response.status,
        ok: response.status === expectedStatus,
        data: response.ok ? await response.json() : null
    };
}

// ===== TEST SUITE =====

console.log('🚀 Starting RBAC Automated Tests...\n');

// Test 1: Authentication Tests
async function testAuthentication() {
    log('📋', 'Testing Authentication...');

    // Test SUPER_ADMIN login
    const superToken = await login(testUsers.superAdmin.username, testUsers.superAdmin.password);
    superToken ? pass('SUPER_ADMIN login') : fail('SUPER_ADMIN login', 'Login failed');

    // Test DEPT_ADMIN login
    const deptToken = await login(testUsers.deptAdmin.username, testUsers.deptAdmin.password);
    deptToken ? pass('DEPT_ADMIN login') : fail('DEPT_ADMIN login', 'Login failed');

    // Test COMPANY_ADMIN login
    const companyToken = await login(testUsers.companyAdmin.username, testUsers.companyAdmin.password);
    companyToken ? pass('COMPANY_ADMIN login') : fail('COMPANY_ADMIN login', 'Login failed');

    // Test STUDENT login
    const studentToken = await login(testUsers.student.username, testUsers.student.password);
    studentToken ? pass('STUDENT login') : fail('STUDENT login', 'Login failed');

    return { superToken, deptToken, companyToken, studentToken };
}

// Test 2: User Management Tests
async function testUserManagement(tokens) {
    log('📋', 'Testing User Management...');

    // SUPER_ADMIN can create DEPT_ADMIN
    let result = await testAPI('/admin/users', 'POST', tokens.superToken, {
        username: 'test_dept_admin',
        email: 'test@dept.com',
        password: 'test123',
        role: 'DEPT_ADMIN'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates DEPT_ADMIN') : fail('SUPER_ADMIN creates DEPT_ADMIN', result.status);

    // DEPT_ADMIN can create COMPANY_ADMIN
    result = await testAPI('/admin/users', 'POST', tokens.deptToken, {
        username: 'test_company_admin',
        email: 'test@company.com',
        password: 'test123',
        role: 'COMPANY_ADMIN',
        companyName: 'TestCorp'
    }, 200);
    result.ok ? pass('DEPT_ADMIN creates COMPANY_ADMIN') : fail('DEPT_ADMIN creates COMPANY_ADMIN', result.status);

    // COMPANY_ADMIN cannot create users (should get 403)
    result = await testAPI('/admin/users', 'POST', tokens.companyToken, {
        username: 'test_user',
        email: 'test@user.com',
        password: 'test123',
        role: 'USER'
    }, 403);
    result.ok ? pass('COMPANY_ADMIN blocked from creating users') : fail('COMPANY_ADMIN blocked from creating users', 'Should be 403');

    // STUDENT cannot access admin endpoints (should get 403)
    result = await testAPI('/admin/users', 'GET', tokens.studentToken, null, 403);
    result.ok ? pass('STUDENT blocked from admin access') : fail('STUDENT blocked from admin access', 'Should be 403');
}

// Test 3: Department Management Tests
async function testDepartmentManagement(tokens) {
    log('📋', 'Testing Department Management...');

    // SUPER_ADMIN can create department
    let result = await testAPI('/admin/departments', 'POST', tokens.superToken, {
        name: 'Test Department',
        code: 'TEST_DEPT',
        category: 'Test',
        degree: 'Test',
        hodName: 'Test HOD',
        contactEmail: 'test@dept.com',
        maxSemesters: 8
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates department') : fail('SUPER_ADMIN creates department', result.status);

    // DEPT_ADMIN cannot create department (should get 403)
    result = await testAPI('/admin/departments', 'POST', tokens.deptToken, {
        name: 'Unauthorized Dept',
        code: 'UNAUTH',
        category: 'Test',
        degree: 'Test',
        hodName: 'Test',
        contactEmail: 'test@test.com',
        maxSemesters: 8
    }, 403);
    result.ok ? pass('DEPT_ADMIN blocked from creating departments') : fail('DEPT_ADMIN blocked from creating departments', 'Should be 403');
}

// Test 4: Job Management Tests
async function testJobManagement(tokens) {
    log('📋', 'Testing Job Management...');

    // SUPER_ADMIN can post job for any company
    let result = await testAPI('/admin/jobs', 'POST', tokens.superToken, {
        title: 'Test Job',
        description: 'Test Description',
        company_name: 'Any Company',
        apply_link: 'https://test.com',
        last_date: '2025-12-31',
        salary: 1000000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts job for any company') : fail('SUPER_ADMIN posts job', result.status);

    // COMPANY_ADMIN can post job (company auto-filled)
    result = await testAPI('/admin/jobs', 'POST', tokens.companyToken, {
        title: 'Google Job',
        description: 'Test Description',
        company_name: 'Google', // Should be forced to their company
        apply_link: 'https://google.com',
        last_date: '2025-12-31',
        salary: 1500000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 200);
    result.ok ? pass('COMPANY_ADMIN posts job') : fail('COMPANY_ADMIN posts job', result.status);

    // DEPT_ADMIN cannot post jobs (should get 403)
    result = await testAPI('/admin/jobs', 'POST', tokens.deptToken, {
        title: 'Unauthorized Job',
        description: 'Test',
        company_name: 'Test',
        apply_link: 'https://test.com',
        last_date: '2025-12-31',
        salary: 100000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 403);
    result.ok ? pass('DEPT_ADMIN blocked from posting jobs') : fail('DEPT_ADMIN blocked from posting jobs', 'Should be 403');
}

// Test 5: Data Visibility Tests
async function testDataVisibility(tokens) {
    log('📋', 'Testing Data Visibility...');

    // SUPER_ADMIN can view all jobs
    let result = await testAPI('/admin/jobs', 'GET', tokens.superToken, null, 200);
    result.ok ? pass('SUPER_ADMIN views all jobs') : fail('SUPER_ADMIN views all jobs', result.status);

    // COMPANY_ADMIN can view jobs
    result = await testAPI('/admin/jobs', 'GET', tokens.companyToken, null, 200);
    result.ok ? pass('COMPANY_ADMIN views jobs') : fail('COMPANY_ADMIN views jobs', result.status);

    // STUDENT can view public jobs
    result = await testAPI('/jobs', 'GET', tokens.studentToken, null, 200);
    result.ok ? pass('STUDENT views public jobs') : fail('STUDENT views public jobs', result.status);
}

// Run All Tests
async function runAllTests() {
    console.log('═══════════════════════════════════════');
    console.log('🧪 RBAC AUTOMATED TEST SUITE');
    console.log('═══════════════════════════════════════\n');

    try {
        // Run tests
        const tokens = await testAuthentication();
        console.log('');

        await testUserManagement(tokens);
        console.log('');

        await testDepartmentManagement(tokens);
        console.log('');

        await testJobManagement(tokens);
        console.log('');

        await testDataVisibility(tokens);
        console.log('');

        // Print Summary
        console.log('═══════════════════════════════════════');
        console.log('📊 TEST SUMMARY');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Passed: ${testResults.passed.length}/${testResults.total}`);
        console.log(`❌ Failed: ${testResults.failed.length}/${testResults.total}`);
        console.log(`📈 Success Rate: ${((testResults.passed.length / testResults.total) * 100).toFixed(1)}%`);

        if (testResults.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            testResults.failed.forEach(f => console.log(`   - ${f.test}: ${f.error}`));
        }

        console.log('\n═══════════════════════════════════════\n');

        // Return results
        return testResults;

    } catch (error) {
        console.error('💥 Test suite crashed:', error);
        return null;
    }
}

// Export for use
window.runRBACTests = runAllTests;

// Auto-run if desired
console.log('💡 Test suite loaded! Run: runRBACTests()');
console.log('Or it will auto-run in 3 seconds...\n');

setTimeout(() => {
    runAllTests();
}, 3000);
