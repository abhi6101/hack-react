import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://placement-portal-backend-nwaj.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(result.message || "Registration successful! Redirecting to verification...");
                setLoading(false);
                setTimeout(() => {
                    // Navigate to verify page with email param
                    // Using window.location to ensure fresh state or useNavigate
                    // Since I am in a component, I likely have access to navigate (wait, Register.jsx used Link. I need to add useNavigate)
                    window.location.href = `/verify-account?email=${encodeURIComponent(formData.email)}`;
                }, 1500);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="register-page-container">
            <section id="register-form-card" className="register-card surface-glow">
                <h1>Create Your Account</h1>
                <p className="subtitle">Join our portal to access exclusive job opportunities and resources.</p>

                {error && <div className="alert alert-error" style={{ display: 'block' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ display: 'block' }}>{success}</div>}

                <form id="registrationForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            placeholder="e.g., @yourusername"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <small>Must start with '@', be lowercase, and have no spaces.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Select Role</label>
                        <select
                            id="role"
                            name="role"
                            required
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="">-- Please Select a Role --</option>
                            <option value="USER">Student</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                required
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <i
                                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            ></i>
                        </div>
                        <small>Min. 8 characters, with 1 number & 1 special character.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <i
                                className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ cursor: 'pointer' }}
                            ></i>
                        </div>
                    </div>

                    <button type="submit" id="registerButton" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        ) : (
                            <span className="button-text">Register Now <i className="fas fa-user-plus"></i></span>
                        )}
                    </button>
                </form>
                <p className="form-footer-text">Already have an account? <Link to="/login">Login here</Link></p>
            </section>
        </main>
    );
};

export default Register;
