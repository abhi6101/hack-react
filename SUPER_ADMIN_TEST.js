// Comprehensive SUPER_ADMIN Testing Script
// Tests all SUPER_ADMIN features first, then other roles
// Run this in browser console

const API_BASE = 'https://placement-portal-backend-production.up.railway.app/api';

// Test Results Storage
const testResults = {
    passed: [],
    failed: [],
    total: 0,
    superAdminTests: { passed: 0, failed: 0, total: 0 }
};

// Helper Functions
const log = (emoji, message) => console.log(`${emoji} ${message}`);
const pass = (test, isSuperAdmin = false) => {
    testResults.passed.push(test);
    testResults.total++;
    if (isSuperAdmin) {
        testResults.superAdminTests.passed++;
        testResults.superAdminTests.total++;
    }
    log('✅', test);
};
const fail = (test, error, isSuperAdmin = false) => {
    testResults.failed.push({ test, error });
    testResults.total++;
    if (isSuperAdmin) {
        testResults.superAdminTests.failed++;
        testResults.superAdminTests.total++;
    }
    log('❌', `${test}: ${error}`);
};

// Test Users
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

// ===== SUPER ADMIN COMPREHENSIVE TESTS =====

async function testSuperAdminLogin() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         🔐 PHASE 1: SUPER ADMIN AUTHENTICATION          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const token = await login(testUsers.superAdmin.username, testUsers.superAdmin.password);
    token ? pass('SUPER_ADMIN login successful', true) : fail('SUPER_ADMIN login', 'Login failed', true);

    return token;
}

async function testSuperAdminUserManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         👥 PHASE 2: SUPER ADMIN USER MANAGEMENT         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: Create SUPER_ADMIN
    let result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_super_admin',
        email: 'test_super@admin.com',
        password: 'test123',
        role: 'SUPER_ADMIN'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates another SUPER_ADMIN', true) : fail('Create SUPER_ADMIN', result.status, true);

    // Test 2: Create DEPT_ADMIN
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_dept_admin',
        email: 'test@dept.com',
        password: 'test123',
        role: 'DEPT_ADMIN',
        adminBranch: 'BCA'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates DEPT_ADMIN', true) : fail('Create DEPT_ADMIN', result.status, true);

    // Test 3: Create COMPANY_ADMIN
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_company_admin',
        email: 'test@company.com',
        password: 'test123',
        role: 'COMPANY_ADMIN',
        companyName: 'TestCorp'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates COMPANY_ADMIN', true) : fail('Create COMPANY_ADMIN', result.status, true);

    // Test 4: Create STUDENT
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_student',
        email: 'test@student.com',
        password: 'test123',
        role: 'USER'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates STUDENT', true) : fail('Create STUDENT', result.status, true);

    // Test 5: View all users
    result = await testAPI('/admin/users', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all users', true) : fail('View all users', result.status, true);
}

async function testSuperAdminDepartmentManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║      🏢 PHASE 3: SUPER ADMIN DEPARTMENT MANAGEMENT       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: Create department
    let result = await testAPI('/admin/departments', 'POST', token, {
        name: 'Test Department',
        code: 'TEST_DEPT',
        category: 'Test',
        degree: 'Test',
        hodName: 'Test HOD',
        contactEmail: 'test@dept.com',
        maxSemesters: 8
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates department', true) : fail('Create department', result.status, true);

    // Test 2: View all departments
    result = await testAPI('/admin/departments', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all departments', true) : fail('View departments', result.status, true);

    // Test 3: Bulk create departments
    result = await testAPI('/admin/departments/bulk', 'POST', token, [
        {
            name: 'B.Tech in AI',
            code: 'BTECH_AI',
            category: 'Engineering',
            degree: 'B.Tech',
            hodName: 'TBD',
            contactEmail: 'ai@college.edu',
            maxSemesters: 8
        }
    ], 200);
    result.ok ? pass('SUPER_ADMIN bulk creates departments', true) : fail('Bulk create departments', result.status, true);
}

async function testSuperAdminJobManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║        💼 PHASE 4: SUPER ADMIN JOB MANAGEMENT           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: Post job for any company
    let result = await testAPI('/admin/jobs', 'POST', token, {
        title: 'Senior Software Engineer',
        description: 'Test job posted by SUPER_ADMIN',
        company_name: 'Amazon',
        apply_link: 'https://amazon.com/apply',
        last_date: '2025-12-31',
        salary: 2000000,
        interview_details: '{}',
        eligibleBranches: ['MCA', 'BCA'],
        eligibleSemesters: [6, 8]
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts job for any company', true) : fail('Post job', result.status, true);

    // Test 2: View all jobs
    result = await testAPI('/admin/jobs', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all jobs', true) : fail('View all jobs', result.status, true);

    // Test 3: Post another job for different company
    result = await testAPI('/admin/jobs', 'POST', token, {
        title: 'Data Scientist',
        description: 'Another test job',
        company_name: 'Microsoft',
        apply_link: 'https://microsoft.com/apply',
        last_date: '2025-12-31',
        salary: 1800000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts job for different company', true) : fail('Post job for different company', result.status, true);
}

async function testSuperAdminStudentManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║       👨‍🎓 PHASE 5: SUPER ADMIN STUDENT MANAGEMENT        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all student profiles
    let result = await testAPI('/student-profile/admin/all', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all student profiles', true) : fail('View student profiles', result.status, true);

    // Test 2: View all job applications
    result = await testAPI('/admin/job-applications', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all job applications', true) : fail('View job applications', result.status, true);

    // Test 3: View all interview applications
    result = await testAPI('/admin/interview-applications', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all interview applications', true) : fail('View interview applications', result.status, true);
}

async function testSuperAdminAnalytics(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         📊 PHASE 6: SUPER ADMIN ANALYTICS & STATS        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View company stats
    let result = await testAPI('/admin/stats/companies', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views company statistics', true) : fail('View company stats', result.status, true);

    // Test 2: View student activity
    result = await testAPI('/admin/stats/students', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views student activity', true) : fail('View student activity', result.status, true);

    // Test 3: View email settings
    result = await testAPI('/admin/settings', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views email settings', true) : fail('View email settings', result.status, true);
}

async function testSuperAdminInterviewManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║      🎤 PHASE 7: SUPER ADMIN INTERVIEW MANAGEMENT        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: Post interview drive
    let result = await testAPI('/interview-drives/admin', 'POST', token, {
        company: 'Google',
        date: '2025-12-25',
        time: '10:00 AM',
        venue: 'Main Auditorium',
        positions: 'Software Engineer, Data Analyst',
        eligibility: 'MCA/BCA, CGPA > 7.0',
        totalSlots: 50,
        bookedSlots: 0
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts interview drive', true) : fail('Post interview drive', result.status, true);

    // Test 2: View all interview drives
    result = await testAPI('/interview-drives', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all interview drives', true) : fail('View interview drives', result.status, true);
}

async function testSuperAdminGalleryManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║       🖼️  PHASE 8: SUPER ADMIN GALLERY MANAGEMENT        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all gallery items
    let result = await testAPI('/admin/gallery', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all gallery items', true) : fail('View gallery items', result.status, true);
}

// ===== OTHER ROLES TESTS =====

async function testOtherRoles() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           🔐 PHASE 9: OTHER ROLES VERIFICATION           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Login all other roles
    const deptToken = await login(testUsers.deptAdmin.username, testUsers.deptAdmin.password);
    deptToken ? pass('DEPT_ADMIN login') : fail('DEPT_ADMIN login', 'Login failed');

    const companyToken = await login(testUsers.companyAdmin.username, testUsers.companyAdmin.password);
    companyToken ? pass('COMPANY_ADMIN login') : fail('COMPANY_ADMIN login', 'Login failed');

    const studentToken = await login(testUsers.student.username, testUsers.student.password);
    studentToken ? pass('STUDENT login') : fail('STUDENT login', 'Login failed');

    // DEPT_ADMIN tests
    let result = await testAPI('/admin/users', 'POST', deptToken, {
        username: 'dept_created_company',
        email: 'dept@company.com',
        password: 'test123',
        role: 'COMPANY_ADMIN',
        companyName: 'DeptCorp'
    }, 200);
    result.ok ? pass('DEPT_ADMIN creates COMPANY_ADMIN') : fail('DEPT_ADMIN creates COMPANY_ADMIN', result.status);

    // DEPT_ADMIN cannot create departments
    result = await testAPI('/admin/departments', 'POST', deptToken, {
        name: 'Unauthorized',
        code: 'UNAUTH',
        category: 'Test',
        degree: 'Test',
        hodName: 'Test',
        contactEmail: 'test@test.com',
        maxSemesters: 8
    }, 403);
    result.ok ? pass('DEPT_ADMIN blocked from creating departments') : fail('DEPT_ADMIN blocked from departments', 'Should be 403');

    // COMPANY_ADMIN tests
    result = await testAPI('/admin/jobs', 'POST', companyToken, {
        title: 'Company Job',
        description: 'Test',
        company_name: 'Google',
        apply_link: 'https://google.com',
        last_date: '2025-12-31',
        salary: 1500000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 200);
    result.ok ? pass('COMPANY_ADMIN posts job') : fail('COMPANY_ADMIN posts job', result.status);

    // COMPANY_ADMIN cannot create users
    result = await testAPI('/admin/users', 'POST', companyToken, {
        username: 'unauthorized_user',
        email: 'unauth@test.com',
        password: 'test123',
        role: 'USER'
    }, 403);
    result.ok ? pass('COMPANY_ADMIN blocked from creating users') : fail('COMPANY_ADMIN blocked from users', 'Should be 403');

    // STUDENT tests
    result = await testAPI('/jobs', 'GET', studentToken, null, 200);
    result.ok ? pass('STUDENT views public jobs') : fail('STUDENT views jobs', result.status);

    result = await testAPI('/admin/users', 'GET', studentToken, null, 403);
    result.ok ? pass('STUDENT blocked from admin access') : fail('STUDENT blocked from admin', 'Should be 403');
}

// ===== MAIN TEST RUNNER =====

async function runAllTests() {
    console.clear();
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║       🧪 COMPREHENSIVE RBAC TESTING SUITE 🧪             ║');
    console.log('║                                                           ║');
    console.log('║     Testing SUPER_ADMIN Features First, Then Others      ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        // SUPER ADMIN COMPREHENSIVE TESTS
        const superToken = await testSuperAdminLogin();
        if (!superToken) {
            console.error('❌ SUPER_ADMIN login failed. Cannot continue tests.');
            return;
        }

        await testSuperAdminUserManagement(superToken);
        await testSuperAdminDepartmentManagement(superToken);
        await testSuperAdminJobManagement(superToken);
        await testSuperAdminStudentManagement(superToken);
        await testSuperAdminAnalytics(superToken);
        await testSuperAdminInterviewManagement(superToken);
        await testSuperAdminGalleryManagement(superToken);

        // OTHER ROLES TESTS
        await testOtherRoles();

        // FINAL SUMMARY
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    📊 FINAL SUMMARY                       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        console.log('🎯 SUPER_ADMIN Tests:');
        console.log(`   ✅ Passed: ${testResults.superAdminTests.passed}/${testResults.superAdminTests.total}`);
        console.log(`   ❌ Failed: ${testResults.superAdminTests.failed}/${testResults.superAdminTests.total}`);
        console.log(`   📈 Success Rate: ${((testResults.superAdminTests.passed / testResults.superAdminTests.total) * 100).toFixed(1)}%\n`);

        console.log('🎯 Overall Tests:');
        console.log(`   ✅ Passed: ${testResults.passed.length}/${testResults.total}`);
        console.log(`   ❌ Failed: ${testResults.failed.length}/${testResults.total}`);
        console.log(`   📈 Success Rate: ${((testResults.passed.length / testResults.total) * 100).toFixed(1)}%`);

        if (testResults.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            testResults.failed.forEach(f => console.log(`   - ${f.test}: ${f.error}`));
        }

        console.log('\n╚═══════════════════════════════════════════════════════════╝\n');

        return testResults;

    } catch (error) {
        console.error('💥 Test suite crashed:', error);
        return null;
    }
}

// Export and auto-run
window.runRBACTests = runAllTests;

console.log('💡 Comprehensive RBAC Test Suite Loaded!');
console.log('📋 Tests SUPER_ADMIN features first, then other roles');
console.log('🚀 Auto-running in 3 seconds...\n');
console.log('Or run manually: runRBACTests()\n');

setTimeout(() => {
    runAllTests();
}, 3000);
