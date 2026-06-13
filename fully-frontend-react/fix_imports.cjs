const fs = require('fs');
const files = ['ManageJobs.jsx', 'InterviewApplications.jsx', 'AdminSettings.jsx'];

files.forEach(f => {
    const p = 'src/pages/admin/' + f;
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/from '\.\.\/components\//g, "from '../../components/");
    fs.writeFileSync(p, content);
    console.log("Updated " + f);
});
