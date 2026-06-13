const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Add imports
const newImports = `import ManageUsers from './admin/ManageUsers';
import InterviewDrives from './admin/InterviewDrives';
import ProfileDetails from './admin/ProfileDetails';
import AdminSettings from './admin/AdminSettings';
`;
content = content.replace("import AdminHeader from './admin/AdminHeader';", "import AdminHeader from './admin/AdminHeader';\n" + newImports);

// 2. Remove states and functions

// It's much easier to just recreate the file since it's a container. But let's safely replace blocks.
const removeBlock = (startRegex, endRegex) => {
    const sMatch = content.match(startRegex);
    if (!sMatch) return;
    const s = sMatch.index;
    const eMatch = content.substring(s).match(endRegex);
    if (!eMatch) return;
    const e = s + eMatch.index + eMatch[0].length;
    content = content.substring(0, s) + content.substring(e);
};

// Replace case 'users'
const caseUsersStart = content.indexOf("case 'users':");
const caseUsersEnd = content.indexOf("case 'interviews':");
if (caseUsersStart !== -1 && caseUsersEnd !== -1) {
    const usersUsage = `case 'users':
                return (
                    <ManageUsers 
                        users={users} setUsers={setUsers} loadingUsers={loadingUsers} setLoadingUsers={setLoadingUsers}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        showToast={showToast}
                    />
                );
            `;
    content = content.substring(0, caseUsersStart) + usersUsage + content.substring(caseUsersEnd);
}

// Replace case 'interviews'
const caseInterviewsStart = content.indexOf("case 'interviews':");
const caseInterviewsEnd = content.indexOf("case 'profile-details':");
if (caseInterviewsStart !== -1 && caseInterviewsEnd !== -1) {
    const interviewsUsage = `case 'interviews':
                return (
                    <InterviewDrives 
                        interviews={interviews} setInterviews={setInterviews} fetchInterviews={fetchInterviews}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            `;
    content = content.substring(0, caseInterviewsStart) + interviewsUsage + content.substring(caseInterviewsEnd);
}

// Replace case 'profile-details'
const caseProfileDetailsStart = content.indexOf("case 'profile-details':");
const caseProfileDetailsEnd = content.indexOf("case 'email-settings':");
if (caseProfileDetailsStart !== -1 && caseProfileDetailsEnd !== -1) {
    const profileDetailsUsage = `case 'profile-details':
                return (
                    <ProfileDetails 
                        allProfiles={allProfiles} setAllProfiles={setAllProfiles} getToken={getToken} 
                        showToast={showToast} isSuperAdmin={isSuperAdmin} role={role}
                    />
                );
            `;
    content = content.substring(0, caseProfileDetailsStart) + profileDetailsUsage + content.substring(caseProfileDetailsEnd);
}

// Replace case 'email-settings' & 'gallery-settings'
const caseEmailSettingsStart = content.indexOf("case 'email-settings':");
const casePaperViewLogsStart = content.indexOf("case 'paper-view-logs':");
if (caseEmailSettingsStart !== -1 && casePaperViewLogsStart !== -1) {
    const emailSettingsUsage = `case 'email-settings':
            case 'gallery-settings':
                return (
                    <AdminSettings 
                        activeTab={activeTab} emailSettings={emailSettings} setEmailSettings={setEmailSettings} 
                        savingEmailSettings={savingEmailSettings} galleryItems={galleryItems} 
                        setGalleryItems={setGalleryItems} loadGalleryItems={loadGalleryItems} 
                        getToken={getToken} message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            `;
    content = content.substring(0, caseEmailSettingsStart) + emailSettingsUsage + content.substring(casePaperViewLogsStart);
}

// Remove Verification Modal from the bottom
const modalStartStr = '{/* Verification Modal */}';
const modalStartIdx = content.indexOf(modalStartStr);
if (modalStartIdx !== -1) {
    const modalEndStr = '{/* --- End Verification Modal --- */}';
    let modalEndIdx = content.indexOf(modalEndStr, modalStartIdx);
    if (modalEndIdx === -1) {
        const afterModalStr = '{/* Delete All Students (Super Admin) */}';
        modalEndIdx = content.indexOf(afterModalStr, modalStartIdx);
        if(modalEndIdx === -1) modalEndIdx = content.indexOf('</main>', modalStartIdx);
    }
    content = content.substring(0, modalStartIdx) + content.substring(modalEndIdx);
}

// Remove renderProfileDetails
content = content.replace(/const renderProfileDetails = \(\) => \([\s\S]*?\n    \);\n/m, '');

// Remove funcs from AdminDashboard to strip lines
content = content.replace(/const loadUsers =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleUserSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteUser =[\s\S]*?    };\n/m, '');
content = content.replace(/const startEditUser =[\s\S]*?    };\n/m, '');
content = content.replace(/const clearUserForm =[\s\S]*?    };\n/m, '');

content = content.replace(/const fetchInterviews =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleInterviewSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteInterview =[\s\S]*?    };\n/m, '');
content = content.replace(/const startEditInterview =[\s\S]*?    };\n/m, '');
content = content.replace(/const clearInterviewForm =[\s\S]*?    };\n/m, '');
content = content.replace(/const fillInterviewSampleData =[\s\S]*?    };\n/m, '');

content = content.replace(/const fetchAllProfiles =[\s\S]*?    };\n/m, '');
content = content.replace(/const verifyProfileIdentity =[\s\S]*?    };\n/m, '');

content = content.replace(/const updateGalleryStatus =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteGalleryItem =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleGalleryUpload =[\s\S]*?    };\n/m, '');
content = content.replace(/const toggleEmailSetting =[\s\S]*?    };\n/m, '');

fs.writeFileSync(adminPath, content);
console.log('Final refactor applied.');
