const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Add imports
const newImports = `import API_BASE_URL from '../../config';
import ManageJobs from './admin/ManageJobs';
import StudentMonitor from './admin/StudentMonitor';
import InterviewApplications from './admin/InterviewApplications';
import AdminHeader from './admin/AdminHeader';
`;
content = content.replace("import API_BASE_URL from '../../config';", newImports);

// 2. Remove states and functions

// Remove ToggleSwitch and TableSkeleton definitions
const toggleSwitchStart = content.indexOf('// Simple Toggle Switch Component');
const tableSkeletonEnd = content.indexOf('const AdminDashboard = () => {');
if (toggleSwitchStart !== -1 && tableSkeletonEnd !== -1) {
    content = content.substring(0, toggleSwitchStart) + content.substring(tableSkeletonEnd);
}

// 3. Replace header
const headerStartStr = '<header className="main-header"';
const headerEndStr = '</header>';
const headerStart = content.indexOf(headerStartStr);
const headerEnd = content.indexOf(headerEndStr, headerStart);
if (headerStart !== -1 && headerEnd !== -1) {
    const adminHeaderUsage = `<AdminHeader 
                    activeTab={activeTab} 
                    menuItems={menuItems} 
                    isJobFormOpen={isJobFormOpen} 
                    setIsJobFormOpen={setIsJobFormOpen} 
                />`;
    content = content.substring(0, headerStart) + adminHeaderUsage + content.substring(headerEnd + headerEndStr.length);
}

// 4. Replace Switch Cases
const caseJobsStart = content.indexOf("case 'jobs':");
const caseJobsEnd = content.indexOf("case 'users':");
if (caseJobsStart !== -1 && caseJobsEnd !== -1) {
    const jobsUsage = `case 'jobs':
                return (
                    <ManageJobs 
                        jobs={jobs} loadingJobs={loadingJobs} fetchJobs={fetchJobs} setJobs={setJobs}
                        departments={departments} emailSettings={emailSettings} message={message} setMessage={setMessage}
                        isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} myCompanyName={myCompanyName}
                        getToken={getToken} handleUnauthorized={handleUnauthorized} role={role} activeTab={activeTab}
                        isJobFormOpen={isJobFormOpen} setIsJobFormOpen={setIsJobFormOpen}
                    />
                );
            `;
    content = content.substring(0, caseJobsStart) + jobsUsage + content.substring(caseJobsEnd);
}

const caseStudentsStart = content.indexOf("case 'students':");
const caseStudentsEnd = content.indexOf("case 'dashboard':");
if (caseStudentsStart !== -1 && caseStudentsEnd !== -1) {
    const studentsUsage = `case 'students':
                return (
                    <StudentMonitor 
                        getToken={getToken} 
                        handleUnauthorized={handleUnauthorized} 
                        showToast={showToast} 
                        activeTab={activeTab} 
                    />
                );
            `;
    content = content.substring(0, caseStudentsStart) + studentsUsage + content.substring(caseStudentsEnd);
}

const caseAppsStart = content.indexOf("case 'applications':");
const caseAppsEnd = content.indexOf("case 'interviews':");
if (caseAppsStart !== -1 && caseAppsEnd !== -1) {
    const appsUsage = `case 'applications':
                return (
                    <InterviewApplications 
                        getToken={getToken} 
                        handleUnauthorized={handleUnauthorized} 
                        setMessage={setMessage} 
                        activeTab={activeTab} 
                    />
                );
            `;
    content = content.substring(0, caseAppsStart) + appsUsage + content.substring(caseAppsEnd);
}

fs.writeFileSync(adminPath, content);
console.log('AdminDashboard refactored step 1.');
