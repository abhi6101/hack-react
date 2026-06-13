const fs = require('fs');
const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
let out = [];

let skip = false;
let skipUntil = null;

const newImports = `import AdminHeader from './admin/AdminHeader';
import ManageJobs from './admin/ManageJobs';
import StudentMonitor from './admin/StudentMonitor';
import InterviewApplications from './admin/InterviewApplications';
import ManageUsers from './admin/ManageUsers';
import InterviewDrives from './admin/InterviewDrives';
import ProfileDetails from './admin/ProfileDetails';
import AdminSettings from './admin/AdminSettings';`;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("import AdminMobileMenu from '../components/AdminMobileMenu';")) {
        out.push(line);
        out.push(newImports);
        continue;
    }

    if (!skip && line.includes('<header className="dashboard-header">')) {
        skip = true;
        skipUntil = '</header>';
        out.push(`                <AdminHeader 
                    activeTab={activeTab} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                    globalSearch={globalSearch} 
                    setGlobalSearch={setGlobalSearch} 
                    role={role} 
                    handleLogout={() => setIsLoggingOut(true)} 
                />`);
        continue;
    }

    if (!skip && line.includes("case 'jobs':")) {
        skip = true;
        skipUntil = "case 'departments':";
        out.push(`            case 'jobs':
                return (
                    <ManageJobs 
                        jobs={jobs} setJobs={setJobs} loadingJobs={loadingJobs}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin}
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized}
                        showToast={showToast}
                    />
                );`);
        continue;
    }

    if (!skip && line.includes("case 'students':")) {
        skip = true;
        skipUntil = "case 'applications':";
        out.push(`            case 'students':
                return (
                    <StudentMonitor 
                        studentActivity={studentActivity} loadingActivity={loadingActivity}
                    />
                );`);
        continue;
    }

    if (!skip && line.includes("case 'interview-applications':")) {
        skip = true;
        skipUntil = "case 'users':";
        out.push(`            case 'interview-applications':
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
                );`);
        continue;
    }

    if (!skip && line.includes("case 'users':")) {
        skip = true;
        skipUntil = "case 'interviews':";
        out.push(`            case 'users':
                return (
                    <ManageUsers 
                        users={users} setUsers={setUsers} loadingUsers={loadingUsers} setLoadingUsers={setLoadingUsers}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        showToast={showToast}
                    />
                );`);
        continue;
    }

    if (!skip && line.includes("case 'interviews':")) {
        skip = true;
        skipUntil = "case 'profile-details':";
        out.push(`            case 'interviews':
                return (
                    <InterviewDrives 
                        interviews={interviews} setInterviews={setInterviews} fetchInterviews={() => {}}
                        departments={departments} isCompanyAdmin={isCompanyAdmin} isSuperAdmin={isSuperAdmin} 
                        myCompanyName={myCompanyName} role={role} getToken={getToken} handleUnauthorized={handleUnauthorized} 
                        message={message} setMessage={setMessage} showToast={showToast}
                    />
                );`);
        continue;
    }

    if (!skip && line.includes("case 'profile-details':")) {
        skip = true;
        skipUntil = "case 'email-settings':";
        out.push(`            case 'profile-details':
                return (
                    <ProfileDetails 
                        allProfiles={allProfiles} setAllProfiles={setAllProfiles} getToken={getToken} 
                        showToast={showToast} isSuperAdmin={isSuperAdmin} role={role}
                    />
                );`);
        continue;
    }

    if (!skip && line.includes("case 'email-settings':")) {
        skip = true;
        // The next case after gallery-settings is 'notes'
        skipUntil = "case 'notes':";
        out.push(`            case 'email-settings':
            case 'gallery-settings':
                return (
                    <AdminSettings 
                        activeTab={activeTab} emailSettings={emailSettings} setEmailSettings={setEmailSettings} 
                        savingEmailSettings={savingEmailSettings} galleryItems={galleryItems} 
                        setGalleryItems={setGalleryItems} loadGalleryItems={() => {}} 
                        getToken={getToken} message={message} setMessage={setMessage} showToast={showToast}
                    />
                );`);
        continue;
    }

    if (skip) {
        if (line.includes(skipUntil)) {
            skip = false;
            // Also push this line since we stopped skipping BEFORE this line
            out.push(line);
        }
        continue;
    }

    out.push(line);
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', out.join('\n'), 'utf8');
