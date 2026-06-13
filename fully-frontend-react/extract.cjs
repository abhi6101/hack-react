const fs = require('fs');
const path = require('path');

const adminFilePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let lines = fs.readFileSync(adminFilePath, 'utf-8').split('\n');

const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

fs.writeFileSync('student_monitor_extract.txt', getLines(1488, 1585));
fs.writeFileSync('jobs_extract.txt', getLines(1783, 2120));
fs.writeFileSync('apps_extract.txt', getLines(2389, 2492));
fs.writeFileSync('header_extract.txt', getLines(3106, 3140));

console.log('Extracted to files');
