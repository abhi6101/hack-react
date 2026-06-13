const fs = require('fs');

const adminContent = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const extractFunction = (funcName) => {
    const startStr = `const ${funcName} =`;
    const startIdx = adminContent.indexOf(startStr);
    if (startIdx === -1) return '';
    let endStr = '    };\n';
    let endIdx = adminContent.indexOf(endStr, startIdx);
    if (endIdx === -1) {
        endStr = '    }';
        endIdx = adminContent.indexOf(endStr, startIdx);
    }
    return adminContent.substring(startIdx, endIdx + endStr.length);
};

const funcs = [
    extractFunction('updateGalleryStatus'),
    extractFunction('deleteGalleryItem'),
    extractFunction('handleGalleryUpload'),
    extractFunction('toggleEmailSetting')
].join('\n');

const lines = adminContent.split('\n');
let uiContent = [];
let inBlock = false;
for (let l of lines) {
    if (l.includes("case 'email-settings':")) inBlock = true;
    if (inBlock) {
        uiContent.push(l);
        if (l.includes("case 'paper-view-logs':")) {
            break;
        }
    }
}

const finalUi = uiContent.join('\n')
    .replace("case 'email-settings':", '')
    .replace('return (', '<div className="admin-settings-wrapper">')
    .replace(/case 'gallery-settings':/, '')
    .replace(/case 'paper-view-logs':/, '')
    .replace(/;\n\s*$/, '</div>'); // Wrap everything in a div

// Wait, the AdminDashboard has `case 'email-settings': return (...); case 'gallery-settings': return (...);`
// So combining them in one return is tricky because they are two separate renders based on activeTab.
// Let's modify the final UI slightly for AdminSettings to render based on activeTab.

const componentCode = `import React, { useState } from 'react';
import API_BASE_URL from '../../config';
import ToggleSwitch from '../components/ToggleSwitch';

const AdminSettings = ({
    activeTab, emailSettings, setEmailSettings, savingEmailSettings,
    galleryItems, setGalleryItems, loadGalleryItems, getToken, message, setMessage, showToast
}) => {
    const ADMIN_API_URL = \`\${API_BASE_URL}/admin\`;
    const [galleryUploadLoading, setGalleryUploadLoading] = useState(false);
    const [galleryForm, setGalleryForm] = useState({ title: '', type: 'campus', description: '', image: null });

${funcs}

    if (activeTab === 'email-settings') {
        return (
            <div className="email-settings-page animate-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Email Notifications
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Configure automated email alerts for system events</p>
                </div>

                <div className="card surface-glow-premium">
                    <div className="card-header" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <i className="fas fa-paper-plane" style={{ color: 'var(--primary)' }}></i> Master Control
                            </h3>
                        </div>
                        <div>
                            <ToggleSwitch
                                checked={emailSettings.masterEmailEnabled}
                                onChange={() => toggleEmailSetting('masterEmailEnabled', emailSettings.masterEmailEnabled)}
                                disabled={savingEmailSettings}
                            />
                        </div>
                    </div>

                    <div className="card-body" style={{ padding: '1.5rem' }}>
                        <div className="settings-list" style={{ opacity: emailSettings.masterEmailEnabled ? 1 : 0.5, pointerEvents: emailSettings.masterEmailEnabled ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
                            {[
                                { id: 'newJob', label: 'New Job Postings', desc: 'Alert students when a new job is added', icon: 'fa-briefcase', key: 'newJobEmailEnabled' },
                                { id: 'jobUpdate', label: 'Job Updates', desc: 'Alert applicants when job details change', icon: 'fa-edit', key: 'jobUpdateEmailEnabled' },
                                { id: 'newInterview', label: 'New Interview Drives', desc: 'Alert eligible students about new interview drives', icon: 'fa-calendar-alt', key: 'newInterviewEmailEnabled' },
                                { id: 'statusChange', label: 'Application Status Updates', desc: 'Notify students when their application status changes', icon: 'fa-tasks', key: 'applicationStatusEmailEnabled' },
                                { id: 'profileVerify', label: 'Profile Verification', desc: 'Notify students when their profile is verified or rejected', icon: 'fa-id-badge', key: 'profileVerificationEmailEnabled' }
                            ].map((item, index) => {
                                const isActive = emailSettings[item.key] !== false;
                                const effectiveDisabled = savingEmailSettings || !emailSettings.masterEmailEnabled;

                                return (
                                    <div key={item.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1.25rem',
                                        borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        background: isActive ? 'rgba(0, 212, 255, 0.02)' : 'transparent',
                                        transition: 'background 0.3s ease'
                                    }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: isActive ? 'var(--primary)' : '#888'
                                            }}>
                                                <i className={\`fas \${item.icon}\`}></i>
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.25rem 0', color: isActive ? 'white' : '#aaa' }}>{item.label}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <ToggleSwitch checked={isActive} onChange={() => toggleEmailSetting(item.key, isActive)} disabled={effectiveDisabled} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'gallery-settings') {
        return (
            <div className="gallery-settings-page animate-in">
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Gallery Settings
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage photos for the campus gallery</p>
                    </div>
                </div>

                {message.text && (
                    <div className={\`alert \${message.type === 'success' ? 'alert-success' : 'alert-danger'} animate-pulse-subtle\`} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <i className={\`fas \${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}\`}></i>
                        {message.text}
                    </div>
                )}

                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card surface-glow">
                        <div className="card-header"><h3 style={{ margin: 0 }}><i className="fas fa-upload"></i> Upload New Photo</h3></div>
                        <div className="card-body" style={{ padding: '1.5rem' }}>
                            <form onSubmit={handleGalleryUpload}>
                                <div className="form-group-modern" style={{ marginBottom: '1rem' }}>
                                    <label>Title</label>
                                    <input type="text" className="form-control-modern" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} required />
                                </div>
                                <div className="form-group-modern" style={{ marginBottom: '1rem' }}>
                                    <label>Category</label>
                                    <select className="form-control-modern" value={galleryForm.type} onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value })}>
                                        <option value="campus">Campus</option>
                                        <option value="event">Event</option>
                                        <option value="alumni">Alumni</option>
                                    </select>
                                </div>
                                <div className="form-group-modern" style={{ marginBottom: '1rem' }}>
                                    <label>Description</label>
                                    <textarea className="form-control-modern" rows="2" value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}></textarea>
                                </div>
                                <div className="form-group-modern" style={{ marginBottom: '1.5rem' }}>
                                    <label>Image File</label>
                                    <input type="file" className="form-control-modern" accept="image/*" onChange={e => setGalleryForm({ ...galleryForm, image: e.target.files[0] })} required style={{ padding: '0.5rem' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={galleryUploadLoading} style={{ width: '100%' }}>
                                    {galleryUploadLoading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-cloud-upload-alt"></i> Upload Photo</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="card surface-glow">
                        <div className="card-header"><h3 style={{ margin: 0 }}><i className="fas fa-images"></i> Manage Photos</h3></div>
                        <div className="card-body" style={{ padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
                            {galleryItems.length === 0 ? (
                                <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No photos found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {galleryItems.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                            <img src={\`\${API_BASE_URL.replace('/api', '')}\${item.image_url}\`} alt={item.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{item.title}</h4>
                                                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.type}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <ToggleSwitch checked={item.status === 'active'} onChange={() => updateGalleryStatus(item.id, item.status === 'active' ? 'inactive' : 'active')} />
                                                <button className="btn btn-danger" onClick={() => deleteGalleryItem(item.id)} style={{ padding: '0.4rem 0.6rem' }} title="Delete">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default AdminSettings;
`;

fs.writeFileSync('src/pages/admin/AdminSettings.jsx', componentCode);
console.log('AdminSettings.jsx created');
