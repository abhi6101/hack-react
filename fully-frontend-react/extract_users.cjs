const fs = require('fs');
const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
let content = [];
let inBlock = false;
for (let l of lines) {
    if (l.includes("case 'users':")) inBlock = true;
    if (inBlock) {
        content.push(l);
        if (l.includes("case 'interviews':")) {
            break;
        }
    }
}
fs.writeFileSync('users_extract.txt', content.join('\n'));
