const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Jobs Tab
content = content.replace(
    /case 'jobs':\s*return \(\s*<>\s*<section id="jobs-section"/,
    `case 'jobs':\n                return (\n                    <>\n                        <ViewToggle activeView={activeJobsView} setActiveView={setActiveJobsView} formLabel="Post New Job" listLabel="View Posted Jobs" formIcon="fas fa-plus-circle" listIcon="fas fa-briefcase" />\n                        {activeJobsView === 'form' && (\n                        <section id="jobs-section"`
);
content = content.replace(
    /<\/form>\s*<\/section>\s*<div className="dashboard-grid">/,
    `</form>\n                        </section>\n                        )}\n\n                        {activeJobsView === 'list' && (\n                        <div className="dashboard-grid">`
);
content = content.replace(
    /<\/div>\s*<\/div>\s*<\/>\s*\);\s*case 'users':/g,
    `                            </div>\n                        </div>\n                        )}\n                    </>\n                );\n            case 'users':`
);

// 2. Users Tab
content = content.replace(
    /return \(\s*<div className="users-management-page animate-in">\s*\{!isCompanyAdmin && \(\s*<section className="card surface-glow-premium"/,
    `return (\n                    <div className="users-management-page animate-in">\n                        {!isCompanyAdmin && <ViewToggle activeView={activeUsersView} setActiveView={setActiveUsersView} formLabel="Onboard New User" listLabel="Registered Workforce" formIcon="fas fa-user-plus" listIcon="fas fa-users" />}\n                        {activeUsersView === 'form' && !isCompanyAdmin && (\n                            <section className="card surface-glow-premium"`
);
content = content.replace(
    /<\/div>\s*<\/section>\s*\)\}\s*<section className="card surface-glow"/,
    `                                </div>\n                            </section>\n                        )}\n\n                        {(activeUsersView === 'list' || isCompanyAdmin) && (\n                        <section className="card surface-glow"`
);
content = content.replace(
    /<\/div>\s*<\/section>\s*<\/div>\s*\);\s*\}\s*case 'applications':/g,
    `                            </div>\n                        </section>\n                        )}\n                    </div>\n                );\n            }\n            case 'applications':`
);

// 3. Interviews Tab
content = content.replace(
    /case 'interviews':\s*return \(\s*<>\s*\{!isCompanyAdmin && \(\s*<section className="card surface-glow">/,
    `case 'interviews':\n                return (\n                    <>\n                        {!isCompanyAdmin && <ViewToggle activeView={activeInterviewsView} setActiveView={setActiveInterviewsView} formLabel="Post New Interview" listLabel="Manage Interviews" formIcon="fas fa-calendar-plus" listIcon="fas fa-calendar-alt" />}\n                        {activeInterviewsView === 'form' && !isCompanyAdmin && (\n                            <section className="card surface-glow">`
);
content = content.replace(
    /<\/div>\s*<\/section>\s*\)\}\s*<div className="dashboard-grid">/,
    `                                </div>\n                            </section>\n                        )}\n\n                        {(activeInterviewsView === 'list' || isCompanyAdmin) && (\n                        <div className="dashboard-grid">`
);
content = content.replace(
    /<\/div>\s*<\/div>\s*<\/>\s*\);\s*case 'students':/g,
    `                            </div>\n                        </div>\n                        )}\n                    </>\n                );\n            case 'students':`
);

// 4. Students Tab
content = content.replace(
    /Student Monitor\s*<\/h2>\s*<\/div>\s*<section className="card surface-glow-premium"/,
    `Student Monitor\n                </h2>\n            </div>\n            <ViewToggle activeView={activeStudentsView} setActiveView={setActiveStudentsView} formLabel="Hide Monitor" listLabel="Show Monitor" formIcon="fas fa-eye-slash" listIcon="fas fa-eye" />\n            \n            {activeStudentsView === 'list' && (\n            <section className="card surface-glow-premium"`
);
content = content.replace(
    /<\/table>\s*<\/div>\s*\)\}\s*<\/section>\s*<\/div>\s*\);/g,
    `                        </table>\n                    </div>\n                )}\n            </section>\n            )}\n        </div>\n    );`
);

// 5. Papers Tab
content = content.replace(
    /case 'papers':\s*return \(\s*<div className="papers-management-page animate-in">/,
    `case 'papers':\n                return (\n                    <div className="papers-management-page animate-in">\n                        <ViewToggle activeView={activePapersView} setActiveView={setActivePapersView} formLabel="Upload Paper" listLabel="View Papers" formIcon="fas fa-file-upload" listIcon="fas fa-file-pdf" />\n                        {activePapersView === 'form' && (\n                            <div style={{ marginBottom: '2.5rem' }}>\n                                <PaperWizard onComplete={() => { setActivePapersView('list'); fetchPapers(); }} />\n                            </div>\n                        )}\n                        {activePapersView === 'list' && (\n                            <div>`
);
content = content.replace(
    /<PaperList papers=\{papers\} fetchPapers=\{fetchPapers\} \/>\s*<\/div>\s*\);\s*case 'notes':/,
    `<PaperList papers={papers} fetchPapers={fetchPapers} />\n                            </div>\n                        )}\n                    </div>\n                );\n            case 'notes':`
);

// 6. Gallery Tab (Placeholder rewrite request)
// Wait, for gallery, does it have a form?
// Let's not touch Gallery in this regex without knowing its structure.

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully refactored AdminDashboard.jsx!');
