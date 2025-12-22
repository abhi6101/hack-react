import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
    const [computerCode, setComputerCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Load remembered computer code on component mount
    useEffect(() => {
        const remembered = localStorage.getItem('rememberMe');
        const savedComputerCode = localStorage.getItem('savedComputerCode');
        if (remembered === 'true' && savedComputerCode) {
            setComputerCode(savedComputerCode);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ computerCode, password })
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
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('savedComputerCode', computerCode);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('savedComputerCode');
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
                    localStorage.setItem('userRole', 'USER');
                    navigate('/');
                }
                setLoading(false);
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="login-body-wrapper">
            {/* Note: login.css might target body, so we wrap it or ensure global styles are compatible. 
                Using a wrapper div to approximate body styling if needed. */}

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
                    <h1>Welcome Back</h1>
                    <p className="server-wait-note">
                        ⏳ The server may take 30–60 seconds to start if it was idle. Please wait after clicking Login.
                    </p>

                    {error && <div className="alert alert-error" role="alert" style={{ display: 'block' }}>{error}</div>}

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="computerCode">Computer Code (Student ID)</label>
                            <input
                                type="text"
                                id="computerCode"
                                name="computerCode"
                                required
                                placeholder="Enter your Computer Code (e.g., 59500)"
                                aria-label="Computer Code"
                                value={computerCode}
                                onChange={(e) => setComputerCode(e.target.value)}
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
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" id="loginButton" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/register">Register here</Link></p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
