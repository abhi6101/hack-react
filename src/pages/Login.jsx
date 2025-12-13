import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token); // Store JWT token
                // Optionally store user info if returned, e.g. role/username
                if (data.username) localStorage.setItem('username', data.username);
                if (data.role) localStorage.setItem('userRole', data.role);

                setLoading(false);
                // navigate users based on role perhaps? For now just home
                navigate('/');
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
                    <h1>Welcome Back</h1>
                    <p className="server-wait-note">
                        ⏳ The server may take 30–60 seconds to start if it was idle. Please wait after clicking Login.
                    </p>

                    {error && <div className="alert alert-error" role="alert" style={{ display: 'block' }}>{error}</div>}

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                placeholder="Enter your username"
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

                        <button type="submit" id="loginButton" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                            ) : (
                                <span className="button-text">Login <i className="fas fa-arrow-right"></i></span>
                            )}
                        </button>
                    </form>
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </section>
        </div>
    );
};

export default Login;
