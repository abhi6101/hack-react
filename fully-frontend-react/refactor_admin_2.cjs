const fs = require('fs');

const adminPath = 'src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(adminPath, 'utf8');

const removeBlock = (startStr, endStr) => {
    const s = content.indexOf(startStr);
    if (s === -1) return;
    const e = content.indexOf(endStr, s);
    if (e !== -1) {
        content = content.substring(0, s) + content.substring(e + endStr.length);
    }
};

removeBlock('const downloadCSV =', '    };'); // This might just remove one function

// Actually, using a regex to remove functions is safer:
content = content.replace(/const downloadCSV =[\s\S]*?    };\n/m, '');
content = content.replace(/const fetchStudentActivity =[\s\S]*?    };\n/m, '');
content = content.replace(/const loadApplications =[\s\S]*?    };\n/m, '');
content = content.replace(/const updateApplicationStatus =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteApplication =[\s\S]*?    };\n/m, '');
content = content.replace(/const deleteJob =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleInputChange =[\s\S]*?    };\n/m, '');
content = content.replace(/const fillSampleData =[\s\S]*?    };\n/m, '');
content = content.replace(/const clearForm =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleDeleteAllJobs =[\s\S]*?    };\n/m, '');
content = content.replace(/const handleSubmit =[\s\S]*?    };\n/m, '');
content = content.replace(/const startEditJob =[\s\S]*?    };\n/m, '');

// State removals
content = content.replace(/const \[applications, setApplications\] = useState\(\[\]\);\n/m, '');
content = content.replace(/const \[loadingApplications, setLoadingApplications\] = useState\(false\);\n/m, '');
content = content.replace(/const \[studentActivity, setStudentActivity\] = useState\(\[\]\);\n/m, '');
content = content.replace(/const \[loadingActivity, setLoadingActivity\] = useState\(false\);\n/m, '');
content = content.replace(/const \[appSearch, setAppSearch\] = useState\(''\);\n/m, '');
content = content.replace(/const \[editingJob, setEditingJob\] = useState\(null\);\n/m, '');
content = content.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);\n/m, '');
content = content.replace(/const \[interviewDetails, setInterviewDetails\] = useState\(\{[\s\S]*?\}\);\n/m, '');
content = content.replace(/const \[sendEmailNotifications, setSendEmailNotifications\] = useState[\s\S]*?\}\);\n/m, '');
content = content.replace(/useEffect\(\(\) => \{\n\s*localStorage\.setItem\('sendEmailNotifications'[\s\S]*?\}\, \[sendEmailNotifications\]\);\n/m, '');

// Effects removals
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(activeTab === 'students'[\s\S]*?\}\, \[activeTab\]\);\n/m, '');
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(activeTab === 'applications'[\s\S]*?\}\, \[activeTab\]\);\n/m, '');

// Auto-fill company name effect for jobs (using formData) - Remove it
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(isCompanyAdmin && myCompanyName\) \{\n\s*setFormData[\s\S]*?\}\, \[isCompanyAdmin, myCompanyName\]\);\n/m, '');

fs.writeFileSync(adminPath, content);
console.log('Cleanup complete.');
