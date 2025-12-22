import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
    const [loginMode, setLoginMode] = useState('student'); // 'student' or 'admin'
    const [identifier, setIdentifier] = useState(''); // Computer Code for students, Username for admins
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Load remembered credentials based on mode
    useEffect(() => {
        if (loginMode === 'student') {
            const remembered = localStorage.getItem('rememberMe');
            const savedComputerCode = localStorage.getItem('savedComputerCode');
            if (remembered === 'true' && savedComputerCode) {
                setIdentifier(savedComputerCode);
                setRememberMe(true);
            } else {
                setIdentifier('');
                setRememberMe(false);
            }
        } else {
            const remembered = localStorage.getItem('adminRememberMe');
            const savedUsername = localStorage.getItem('savedAdminUsername');
            if (remembered === 'true' && savedUsername) {
                setIdentifier(savedUsername);
                setRememberMe(true);
            } else {
                setIdentifier('');
                setRememberMe(false);
            }
        }
    }, [loginMode]);

    // Handle identifier input - only digits for student mode
    const handleIdentifierChange = (e) => {
        const value = e.target.value;
        if (loginMode === 'student') {
            // Only allow digits for Computer Code
            const filtered = value.replace(/[^0-9]/g, '');
            setIdentifier(filtered);
        } else {
            // Allow any characters for admin username
            setIdentifier(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = loginMode === 'student' ? '/auth/login' : '/auth/admin/login';
            const payload = loginMode === 'student'
                ? { computerCode: identifier, password }
                : { username: identifier, password };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                } else {
                    setError('Login succeeded but no token received. Please contact support.');
                    setLoading(false);
                    return;
                }
                if (data.username) localStorage.setItem('username', data.username);

                // Handle Remember Me
                if (loginMode === 'student') {
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                        localStorage.setItem('savedComputerCode', identifier);
                    } else {
                        localStorage.removeItem('rememberMe');
                        localStorage.removeItem('savedComputerCode');
                    }
                } else {
                    if (rememberMe) {
                        localStorage.setItem('adminRememberMe', 'true');
                        localStorage.setItem('savedAdminUsername', identifier);
                    } else {
                        localStorage.removeItem('adminRememberMe');
                        localStorage.removeItem('savedAdminUsername');
                    }
                }

                // Handle role-based navigation
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
                    let role = 'ADMIN';
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

                    {/* Login Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.3rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setLoginMode('student')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: loginMode === 'student'
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'transparent',
                                color: '#fff',
                                fontWeight: loginMode === 'student' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '0.95rem'
                            }}
                        >
                            <i className="fas fa-user-graduate"></i> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMode('admin')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: loginMode === 'admin'
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'transparent',
                                color: '#fff',
                                fontWeight: loginMode === 'admin' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '0.95rem'
                            }}
                        >
                            <i className="fas fa-shield-alt"></i> Admin
                        </button>
                    </div>

                    <p className="server-wait-note">
                        ⏳ The server may take 30–60 seconds to start if it was idle. Please wait after clicking Login.
                    </p>

                    {error && <div className="alert alert-error" role="alert" style={{ display: 'block' }}>{error}</div>}

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="identifier">
                                {loginMode === 'student' ? 'Computer Code (Student ID)' : 'Username'}
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                required
                                placeholder={loginMode === 'student'
                                    ? 'Enter your Computer Code (e.g., 59500)'
                                    : 'Enter your admin username'}
                                aria-label={loginMode === 'student' ? 'Computer Code' : 'Username'}
                                value={identifier}
                                onChange={handleIdentifierChange}
                                inputMode={loginMode === 'student' ? 'numeric' : 'text'}
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
                            {loading ? 'Logging in...' : `Login as ${loginMode === 'student' ? 'Student' : 'Admin'}`}
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
