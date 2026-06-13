const fs = require('fs');

let content = fs.readFileSync('clean_admin.jsx', 'utf8'); // Original file

// 1. Add imports
const newImports = `import ManageUsers from './admin/ManageUsers';
import InterviewDrives from './admin/InterviewDrives';
import ProfileDetails from './admin/ProfileDetails';
import AdminSettings from './admin/AdminSettings';
`;
content = content.replace("import AdminHeader from './admin/AdminHeader';", "import AdminHeader from './admin/AdminHeader';\n" + newImports);

// 2. We will use string split and slice.
// Find the switch(activeTab) {
const switchStr = 'switch (activeTab) {';
const switchIdx = content.indexOf(switchStr);
if (switchIdx === -1) {
    console.error("Could not find switch statement");
    process.exit(1);
}

// Find case 'users':
const caseUsersIdx = content.indexOf("case 'users':", switchIdx);
const caseInterviewsIdx = content.indexOf("case 'interviews':", switchIdx);
const caseProfileDetailsIdx = content.indexOf("case 'profile-details':", switchIdx);
const caseEmailSettingsIdx = content.indexOf("case 'email-settings':", switchIdx);
const casePaperViewLogsIdx = content.indexOf("case 'paper-view-logs':", switchIdx);

if (caseUsersIdx !== -1 && caseInterviewsIdx !== -1) {
    content = content.substring(0, caseUsersIdx) + 
`case 'users':
                return (
                    <ManageUsers 
                        users={users} setUsers={setUsers} loadingUsers={loadingUsers} setLoadingUsers={setLoadingUsers}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        showToast={showToast}
                    />
                );
            ` + content.substring(caseInterviewsIdx);
}

// re-find indices after modification
const caseInterviewsIdx2 = content.indexOf("case 'interviews':", switchIdx);
const caseProfileDetailsIdx2 = content.indexOf("case 'profile-details':", switchIdx);
if (caseInterviewsIdx2 !== -1 && caseProfileDetailsIdx2 !== -1) {
    content = content.substring(0, caseInterviewsIdx2) + 
`case 'interviews':
                return (
                    <InterviewDrives 
                        interviews={interviews} setInterviews={setInterviews} fetchInterviews={fetchInterviews}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            ` + content.substring(caseProfileDetailsIdx2);
}

const caseProfileDetailsIdx3 = content.indexOf("case 'profile-details':", switchIdx);
const caseEmailSettingsIdx3 = content.indexOf("case 'email-settings':", switchIdx);
if (caseProfileDetailsIdx3 !== -1 && caseEmailSettingsIdx3 !== -1) {
    content = content.substring(0, caseProfileDetailsIdx3) + 
`case 'profile-details':
                return (
                    <ProfileDetails 
                        allProfiles={allProfiles} setAllProfiles={setAllProfiles} getToken={getToken} 
                        showToast={showToast} isSuperAdmin={isSuperAdmin} role={role}
                    />
                );
            ` + content.substring(caseEmailSettingsIdx3);
}

const caseEmailSettingsIdx4 = content.indexOf("case 'email-settings':", switchIdx);
const casePaperViewLogsIdx4 = content.indexOf("case 'paper-view-logs':", switchIdx);
if (caseEmailSettingsIdx4 !== -1 && casePaperViewLogsIdx4 !== -1) {
    content = content.substring(0, caseEmailSettingsIdx4) + 
`case 'email-settings':
            case 'gallery-settings':
                return (
                    <AdminSettings 
                        activeTab={activeTab} emailSettings={emailSettings} setEmailSettings={setEmailSettings} 
                        savingEmailSettings={savingEmailSettings} galleryItems={galleryItems} 
                        setGalleryItems={setGalleryItems} loadGalleryItems={loadGalleryItems} 
                        getToken={getToken} message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            ` + content.substring(casePaperViewLogsIdx4);
}

// Strip Verification Modal
const modalStartStr = '{/* Verification Modal */}';
const modalStartIdx = content.indexOf(modalStartStr);
const modalEndStr = '{/* --- End Verification Modal --- */}';
const modalEndIdx = content.indexOf(modalEndStr);
if (modalStartIdx !== -1 && modalEndIdx !== -1) {
    content = content.substring(0, modalStartIdx) + content.substring(modalEndIdx + modalEndStr.length);
}

// Strip renderProfileDetails
const renderStartStr = 'const renderProfileDetails = () => (';
const renderStartIdx = content.indexOf(renderStartStr);
if (renderStartIdx !== -1) {
    const renderEndStr = '    );\n';
    let renderEndIdx = content.indexOf(renderEndStr, renderStartIdx);
    content = content.substring(0, renderStartIdx) + content.substring(renderEndIdx + renderEndStr.length);
}

// Write file
fs.writeFileSync('src/pages/AdminDashboard.jsx', content, 'utf8');
console.log('Successfully applied replacements!');
