import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Load remembered username on component mount
    useEffect(() => {
        const remembered = localStorage.getItem('adminRememberMe');
        const savedUsername = localStorage.getItem('savedAdminUsername');
        if (remembered === 'true' && savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('authToken', data.token); // Store JWT token
                } else {
                    setError('Login succeeded but no token received. Please contact support.');
                    setLoading(false);
                    return;
                }
                if (data.username) localStorage.setItem('username', data.username);

                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('adminRememberMe', 'true');
                    localStorage.setItem('savedAdminUsername', username);
                } else {
                    localStorage.removeItem('adminRememberMe');
                    localStorage.removeItem('savedAdminUsername');
                }

                // Backend returns "roles": ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", etc.]
                const roles = data.roles || [];
                const isSuperAdmin = roles.includes('ROLE_SUPER_ADMIN');
                const isCompanyAdmin = roles.includes('ROLE_COMPANY_ADMIN');
                const isDeptAdmin = roles.includes('ROLE_DEPT_ADMIN');
                const isLegacyAdmin = roles.includes('ROLE_ADMIN');

                const isAdmin = isSuperAdmin || isCompanyAdmin || isLegacyAdmin || isDeptAdmin;

                if (data.companyName) {
                    localStorage.setItem('companyName', data.companyName);
                } else {
                    localStorage.removeItem('companyName');
                }

                if (data.branch) {
                    localStorage.setItem('adminBranch', data.branch);
                } else {
                    localStorage.removeItem('adminBranch');
                }

                if (isAdmin) {
                    let role = 'ADMIN'; // Default
                    if (isSuperAdmin) role = 'SUPER_ADMIN';
                    if (isCompanyAdmin) role = 'COMPANY_ADMIN';
                    if (isDeptAdmin) role = 'DEPT_ADMIN';

                    localStorage.setItem('userRole', role);
                    localStorage.setItem('isAdmin', 'true');
                    navigate('/admin');
                } else {
                    // Not an admin - redirect to student login
                    setError('Access denied. This login is for administrators only. Please use the student login page.');
                    setLoading(false);
                    return;
                }
                setLoading(false);
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError('Network error. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow">
                    <Link to="/" style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        color: '#667eea',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        <i className="fas fa-home"></i> Home
                    </Link>

                    {/* Admin Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className="fas fa-shield-alt"></i> ADMIN ACCESS
                    </div>

                    <h1>Admin Portal</h1>
                    <p className="server-wait-note">
                        ⏳ The server may take 30–60 seconds to start if it was idle. Please wait after clicking Login.
                    </p>

                    {error && <div className="alert alert-error" role="alert" style={{ display: 'block' }}>{error}</div>}

                    <form id="adminLoginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                placeholder="Enter your admin username"
                                aria-label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="Enter your password"
                                    aria-label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <i
                                    className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>
                        </div>

                        <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember Me</span>
                            </label>
                            <Link to="/forgot-password" state={{ fromAdmin: true }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" id="adminLoginButton" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Admin Login'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Student? <Link to="/login">Login here</Link></p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminLogin;
