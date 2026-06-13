const fs = require('fs');

const adminContent = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const extractFunction = (funcName) => {
    const startStr = `const ${funcName} =`;
    const startIdx = adminContent.indexOf(startStr);
    if (startIdx === -1) return '';
    const endStr = '    };\n';
    const endIdx = adminContent.indexOf(endStr, startIdx);
    return adminContent.substring(startIdx, endIdx + endStr.length);
};

const funcs = [
    extractFunction('fetchAllProfiles'),
    extractFunction('verifyProfileIdentity')
].join('\n');

// Extract renderProfileDetails
const renderStartStr = 'const renderProfileDetails = () => (';
const renderStartIdx = adminContent.indexOf(renderStartStr);
let renderEndIdx = -1;
if (renderStartIdx !== -1) {
    const renderEndStr = '    );\n';
    renderEndIdx = adminContent.indexOf(renderEndStr, renderStartIdx);
}
const renderUi = renderStartIdx !== -1 ? adminContent.substring(renderStartIdx + renderStartStr.length, renderEndIdx) : '';

// Also need the modal part for Verification Modal. It's at the bottom of AdminDashboard!
const modalStartStr = '{/* Verification Modal */}';
const modalStartIdx = adminContent.indexOf(modalStartStr);
let modalUi = '';
if (modalStartIdx !== -1) {
    // The modal goes until the closing </main> or some other tag.
    const modalEndStr = '{/* --- End Verification Modal --- */}';
    let modalEndIdx = adminContent.indexOf(modalEndStr, modalStartIdx);
    if (modalEndIdx === -1) {
        // Find closing tag of modal wrapper manually or just extract block
        const afterModalStr = '{/* Delete All Students (Super Admin) */}';
        modalEndIdx = adminContent.indexOf(afterModalStr, modalStartIdx);
        if(modalEndIdx === -1) modalEndIdx = adminContent.indexOf('</main>', modalStartIdx);
    }
    modalUi = adminContent.substring(modalStartIdx, modalEndIdx);
}

const componentCode = `import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import { downloadCSV } from '../../utils/csvExport';

const ProfileDetails = ({
    allProfiles, setAllProfiles, getToken, showToast, isSuperAdmin, role
}) => {
    const ADMIN_API_URL = \`\${API_BASE_URL}/admin\`;
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [selectedProfileForVerification, setSelectedProfileForVerification] = useState(null);
    const [verificationTab, setVerificationTab] = useState('idCard');

${funcs}

    return (
        <>
            ${renderUi}
            ${modalUi}
        </>
    );
};

export default ProfileDetails;
`;

fs.writeFileSync('src/pages/admin/ProfileDetails.jsx', componentCode);
console.log('ProfileDetails.jsx created');
