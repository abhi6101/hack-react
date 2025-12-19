// SUPER_ADMIN Testing Script - Using YOUR Credentials
// Modified to work with your existing admin account
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

// ⚠️ IMPORTANT: Replace these with YOUR actual credentials
const YOUR_ADMIN_USERNAME = '@hack-2-hired'; // Your SUPER_ADMIN username
const YOUR_ADMIN_PASSWORD = 'YOUR_PASSWORD_HERE'; // Replace with your actual password

// Test Users - Using your existing account
const testUsers = {
    superAdmin: { username: YOUR_ADMIN_USERNAME, password: YOUR_ADMIN_PASSWORD, role: 'SUPER_ADMIN' }
};

// Authentication Helper
async function login(username, password) {
    try {
        console.log(`🔐 Attempting login for: ${username}`);
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            console.error(`❌ Login failed with status: ${response.status}`);
            const errorText = await response.text();
            console.error(`Error details: ${errorText}`);
            return null;
        }

        const data = await response.json();
        console.log(`✅ Login successful! Token received.`);
        return data.token;
    } catch (error) {
        console.error(`❌ Login error:`, error);
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

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        return {
            status: response.status,
            ok: response.status === expectedStatus,
            data: response.ok ? await response.json() : null
        };
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        return { status: 0, ok: false, data: null };
    }
}

// ===== SUPER ADMIN COMPREHENSIVE TESTS =====

async function testSuperAdminLogin() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         🔐 PHASE 1: SUPER ADMIN AUTHENTICATION          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const token = await login(testUsers.superAdmin.username, testUsers.superAdmin.password);
    token ? pass('SUPER_ADMIN login successful', true) : fail('SUPER_ADMIN login', 'Login failed - Check credentials', true);

    return token;
}

async function testSuperAdminUserManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         👥 PHASE 2: SUPER ADMIN USER MANAGEMENT         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all users
    let result = await testAPI('/admin/users', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all users', true) : fail('View all users', result.status, true);

    // Test 2: Create DEPT_ADMIN
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_dept_admin_' + Date.now(),
        email: 'test_dept@admin.com',
        password: 'test123',
        role: 'DEPT_ADMIN',
        adminBranch: 'MCA'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates DEPT_ADMIN', true) : fail('Create DEPT_ADMIN', result.status, true);

    // Test 3: Create COMPANY_ADMIN
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_company_admin_' + Date.now(),
        email: 'test_company@admin.com',
        password: 'test123',
        role: 'COMPANY_ADMIN',
        companyName: 'TestCorp'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates COMPANY_ADMIN', true) : fail('Create COMPANY_ADMIN', result.status, true);

    // Test 4: Create STUDENT
    result = await testAPI('/admin/users', 'POST', token, {
        username: 'test_student_' + Date.now(),
        email: 'test_student@test.com',
        password: 'test123',
        role: 'USER'
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates STUDENT', true) : fail('Create STUDENT', result.status, true);
}

async function testSuperAdminDepartmentManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║      🏢 PHASE 3: SUPER ADMIN DEPARTMENT MANAGEMENT       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all departments
    let result = await testAPI('/admin/departments', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all departments', true) : fail('View departments', result.status, true);

    // Test 2: Create department
    result = await testAPI('/admin/departments', 'POST', token, {
        name: 'Test Department ' + Date.now(),
        code: 'TEST_' + Date.now(),
        category: 'Test',
        degree: 'Test',
        hodName: 'Test HOD',
        contactEmail: 'test@dept.com',
        maxSemesters: 8
    }, 200);
    result.ok ? pass('SUPER_ADMIN creates department', true) : fail('Create department', result.status, true);
}

async function testSuperAdminJobManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║        💼 PHASE 4: SUPER ADMIN JOB MANAGEMENT           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all jobs
    let result = await testAPI('/admin/jobs', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all jobs', true) : fail('View all jobs', result.status, true);

    // Test 2: Post job for any company
    result = await testAPI('/admin/jobs', 'POST', token, {
        title: 'Test Job ' + Date.now(),
        description: 'Test job posted by SUPER_ADMIN',
        company_name: 'Test Company',
        apply_link: 'https://test.com/apply',
        last_date: '2025-12-31',
        salary: 1000000,
        interview_details: '{}',
        eligibleBranches: [],
        eligibleSemesters: []
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts job for any company', true) : fail('Post job', result.status, true);
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
}

async function testSuperAdminAnalytics(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         📊 PHASE 6: SUPER ADMIN ANALYTICS & STATS        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View company stats
    let result = await testAPI('/admin/stats/companies', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views company statistics', true) : fail('View company stats', result.status, true);

    // Test 2: View email settings
    result = await testAPI('/admin/settings', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views email settings', true) : fail('View email settings', result.status, true);
}

async function testSuperAdminInterviewManagement(token) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║      🎤 PHASE 7: SUPER ADMIN INTERVIEW MANAGEMENT        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Test 1: View all interview drives
    let result = await testAPI('/interview-drives', 'GET', token, null, 200);
    result.ok ? pass('SUPER_ADMIN views all interview drives', true) : fail('View interview drives', result.status, true);

    // Test 2: Post interview drive
    result = await testAPI('/interview-drives/admin', 'POST', token, {
        company: 'Test Company',
        date: '2025-12-25',
        time: '10:00 AM',
        venue: 'Main Auditorium',
        positions: 'Software Engineer',
        eligibility: 'All branches',
        totalSlots: 50,
        bookedSlots: 0
    }, 200);
    result.ok ? pass('SUPER_ADMIN posts interview drive', true) : fail('Post interview drive', result.status, true);
}

// ===== MAIN TEST RUNNER =====

async function runAllTests() {
    console.clear();
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║       🧪 SUPER_ADMIN COMPREHENSIVE TEST SUITE 🧪         ║');
    console.log('║                                                           ║');
    console.log('║          Using YOUR Existing Admin Account               ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`📝 Testing with username: ${YOUR_ADMIN_USERNAME}`);
    console.log(`⚠️  Make sure you've set YOUR_ADMIN_PASSWORD in the script!\n`);

    try {
        // SUPER ADMIN COMPREHENSIVE TESTS
        const superToken = await testSuperAdminLogin();
        if (!superToken) {
            console.error('\n❌ SUPER_ADMIN login failed.');
            console.error('⚠️  Please check:');
            console.error('   1. Your username is correct: ' + YOUR_ADMIN_USERNAME);
            console.error('   2. Your password is set correctly in the script');
            console.error('   3. Your backend is running');
            return;
        }

        await testSuperAdminUserManagement(superToken);
        await testSuperAdminDepartmentManagement(superToken);
        await testSuperAdminJobManagement(superToken);
        await testSuperAdminStudentManagement(superToken);
        await testSuperAdminAnalytics(superToken);
        await testSuperAdminInterviewManagement(superToken);

        // FINAL SUMMARY
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    📊 FINAL SUMMARY                       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        console.log('🎯 SUPER_ADMIN Tests:');
        console.log(`   ✅ Passed: ${testResults.superAdminTests.passed}/${testResults.superAdminTests.total}`);
        console.log(`   ❌ Failed: ${testResults.superAdminTests.failed}/${testResults.superAdminTests.total}`);
        console.log(`   📈 Success Rate: ${((testResults.superAdminTests.passed / testResults.superAdminTests.total) * 100).toFixed(1)}%\n`);

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

// Instructions
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║         ⚠️  IMPORTANT: SET YOUR PASSWORD FIRST! ⚠️        ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');
console.log('📝 Before running, edit line 28 in this script:');
console.log('   const YOUR_ADMIN_PASSWORD = \'YOUR_PASSWORD_HERE\';');
console.log('   Replace YOUR_PASSWORD_HERE with your actual password\n');
console.log('💡 Then run: runRBACTests()\n');

// Export for use
window.runRBACTests = runAllTests;
