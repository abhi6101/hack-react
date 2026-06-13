const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const newImports = `import AdminHeader from './admin/AdminHeader';
import ManageJobs from './admin/ManageJobs';
import StudentMonitor from './admin/StudentMonitor';
import InterviewApplications from './admin/InterviewApplications';
import ManageUsers from './admin/ManageUsers';
import InterviewDrives from './admin/InterviewDrives';
import ProfileDetails from './admin/ProfileDetails';
import AdminSettings from './admin/AdminSettings';
`;
content = content.replace("import AdminMobileMenu from '../components/AdminMobileMenu';", "import AdminMobileMenu from '../components/AdminMobileMenu';\n" + newImports);

const replaceBlock = (startStr, endStr, replacement) => {
    const s = content.indexOf(startStr);
    if (s === -1) return;
    const e = content.indexOf(endStr, s);
    if (e === -1) return;
    content = content.substring(0, s) + replacement + content.substring(e);
};

// AdminHeader
replaceBlock('<header className="dashboard-header">', '</header>', `
                <AdminHeader 
                    activeTab={activeTab} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                    globalSearch={globalSearch} 
                    setGlobalSearch={setGlobalSearch} 
                    role={role} 
                    handleLogout={() => setIsLoggingOut(true)} 
                />`);

// Jobs
replaceBlock("case 'jobs':", "case 'departments':", `case 'jobs':
                return (
                    <ManageJobs 
                        jobs={jobs} setJobs={setJobs} loadingJobs={loadingJobs}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin}
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized}
                        showToast={showToast}
                    />
                );
            `);

// Students
replaceBlock("case 'students':", "case 'applications':", `case 'students':
                return (
                    <StudentMonitor 
                        studentActivity={studentActivity} loadingActivity={loadingActivity}
                    />
                );
            `);

// Interview Applications
replaceBlock("case 'interview-applications':", "case 'users':", `case 'interview-applications':
                return (
                    <InterviewApplications 
                        interviewApplications={interviewApplications} 
                        setInterviewApplications={setInterviewApplications} 
                        loadingInterviewApps={loadingInterviewApps}
                        fetchInterviewApplications={() => {}} 
                        isCompanyAdmin={isCompanyAdmin} 
                        myCompanyName={myCompanyName} 
                        getToken={getToken} 
                        handleUnauthorized={handleUnauthorized} 
                        message={message} 
                        setMessage={setMessage}
                    />
                );
            `);

// Users
replaceBlock("case 'users':", "case 'interviews':", `case 'users':
                return (
                    <ManageUsers 
                        users={users} setUsers={setUsers} loadingUsers={loadingUsers} setLoadingUsers={setLoadingUsers}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        showToast={showToast}
                    />
                );
            `);

// Interviews
replaceBlock("case 'interviews':", "case 'profile-details':", `case 'interviews':
                return (
                    <InterviewDrives 
                        interviews={interviews} setInterviews={setInterviews} fetchInterviews={() => {}}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            `);

// Profile Details
replaceBlock("case 'profile-details':", "case 'email-settings':", `case 'profile-details':
                return (
                    <ProfileDetails 
                        allProfiles={allProfiles} setAllProfiles={setAllProfiles} getToken={getToken} 
                        showToast={showToast} isSuperAdmin={isSuperAdmin} role={role}
                    />
                );
            `);

// Email Settings & Gallery Settings
replaceBlock("case 'email-settings':", "case 'paper-view-logs':", `case 'email-settings':
            case 'gallery-settings':
                return (
                    <AdminSettings 
                        activeTab={activeTab} emailSettings={emailSettings} setEmailSettings={setEmailSettings} 
                        savingEmailSettings={savingEmailSettings} galleryItems={galleryItems} 
                        setGalleryItems={setGalleryItems} loadGalleryItems={() => {}} 
                        getToken={getToken} message={message} setMessage={setMessage} showToast={showToast}
                    />
                );
            `);


// Now strip old functions to reduce file size.
content = content.replace(/const loadJobs =[\s\S]*?    };\n/m, '');
content = content.replace(/const loadUsers =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleUserSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteUser =[\s\S]*?    };\n/m, '');
content = content.replace(/const startEditUser =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteJob =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleInterviewSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteInterview =[\s\S]*?    };\n/m, '');
content = content.replace(/const fillSampleData =[\s\S]*?    };\n/m, '');
content = content.replace(/const fetchAllProfiles =[\s\S]*?    };\n/m, '');
content = content.replace(/const verifyProfileIdentity =[\s\S]*?    };\n/m, '');
content = content.replace(/const updateGalleryStatus =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteGalleryItem =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleGalleryUpload =[\s\S]*?    };\n/m, '');
content = content.replace(/const toggleEmailSetting =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleJobSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const startEditJob =[\s\S]*?    };\n/m, '');
content = content.replace(/const clearForm =[\s\S]*?    };\n/m, '');
content = content.replace(/const renderProfileDetails = \(\) => \([\s\S]*?\n    \);\n/m, '');
content = content.replace(/const updateApplicationStatus =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteApplication =[\s\S]*?    };\n/m, '');

const modalStartStr = '{/* Verification Modal */}';
const modalStartIdx = content.indexOf(modalStartStr);
const modalEndStr = '{/* --- End Verification Modal --- */}';
const modalEndIdx = content.indexOf(modalEndStr);
if (modalStartIdx !== -1 && modalEndIdx !== -1) {
    content = content.substring(0, modalStartIdx) + content.substring(modalEndIdx + modalEndStr.length);
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', content, 'utf8');
console.log('Ultimate refactor applied. Lines:', content.split('\\n').length);
