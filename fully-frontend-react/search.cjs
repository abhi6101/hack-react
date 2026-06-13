const fs = require('fs');
const path = require('path');

const adminFilePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(adminFilePath, 'utf-8');

// The goal is to write a script that helps me identify line numbers or exact strings.
// Since grep is failing, I'll print the line numbers for specific keywords.
const lines = content.split('\n');
const printLines = (query) => {
    console.log(`\n--- Matches for "${query}" ---`);
    lines.forEach((line, i) => {
        if (line.includes(query)) {
            console.log(`${i + 1}: ${line}`);
        }
    });
};

printLines('const renderStudentMonitor');
printLines('case \'jobs\':');
printLines('case \'students\':');
printLines('case \'applications\':');
printLines('const [jobs');
printLines('const fetchJobs');
printLines('const fetchStudentActivity');
printLines('const loadApplications');
printLines('<header className="main-header"');

