import API_BASE_URL from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        branch: '',
        semester: '',
        startYear: new Date().getFullYear().toString(),
        batch: '',
        computerCode: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState([]);

    React.useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/public/departments`);
                if (res.ok) setDepartments(await res.json());
            } catch (e) {
                console.error("Failed to load departments", e);
            }
        };
        fetchDepts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Reset semester when branch changes
        if (name === 'branch') {
            setFormData(prev => ({ ...prev, branch: value, semester: '' }));
        }
    };

    // Auto-calculate Batch
    React.useEffect(() => {
        if (formData.branch && formData.startYear) {
            const dept = departments.find(d => d.code === formData.branch);
            if (dept) {
                const durationYears = Math.ceil((dept.maxSemesters || 8) / 2);
                const endYear = parseInt(formData.startYear) + durationYears;
                const batchStr = `${formData.startYear}-${endYear}`;
                if (formData.batch !== batchStr) {
                    setFormData(prev => ({ ...prev, batch: batchStr }));
                }
            }
        }
    }, [formData.branch, formData.startYear, departments]);

    // Get semester options based on selected branch
    const getSemesterOptions = () => {
        const branchCode = formData.branch;
        const dept = departments.find(d => d.code === branchCode);
        const maxSem = (dept && dept.maxSemesters) ? dept.maxSemesters : 8;

        return Array.from({ length: maxSem }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }));
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
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    branch: formData.role === 'USER' ? formData.branch : undefined,
                    semester: formData.role === 'USER' ? parseInt(formData.semester) : undefined,
                    batch: formData.role === 'USER' ? formData.batch : undefined,
                    computerCode: formData.role === 'USER' ? formData.computerCode : undefined
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
                    navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`);
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

                    {/* Branch/Semester fields - Only for Students */}
                    {formData.role === 'USER' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="branch">Branch *</label>
                                <select
                                    id="branch"
                                    name="branch"
                                    required
                                    value={formData.branch}
                                    onChange={handleChange}
                                >
                                    <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Your Branch --</option>
                                    {departments.length > 0 ? departments.map(d => (
                                        <option key={d.code} value={d.code} style={{ background: '#1e293b', color: '#fff' }}>
                                            {d.name} ({d.code})
                                        </option>
                                    )) : (
                                        <>
                                            <option value="IMCA" style={{ background: '#1e293b', color: '#fff' }}>IMCA (Integrated MCA)</option>
                                            <option value="MCA" style={{ background: '#1e293b', color: '#fff' }}>MCA (Master's)</option>
                                            <option value="BCA" style={{ background: '#1e293b', color: '#fff' }}>BCA (Bachelor's)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {formData.branch && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="semester">Semester/Year *</label>
                                        <select
                                            id="semester"
                                            name="semester"
                                            required
                                            value={formData.semester}
                                            onChange={handleChange}
                                        >
                                            <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Semester/Year --</option>
                                            {getSemesterOptions().map(opt => (
                                                <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label htmlFor="startYear">Admission Year *</label>
                                            <select
                                                id="startYear"
                                                name="startYear"
                                                required
                                                value={formData.startYear}
                                                onChange={handleChange}
                                                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}
                                            >
                                                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i + 1).map(y => (
                                                    <option key={y} value={y} style={{ background: '#1e293b' }}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Batch Session</label>
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.batch}
                                                style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', color: '#4ade80', fontWeight: 'bold' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="computerCode">Computer Code (Student ID) *</label>
                                        <input
                                            type="text"
                                            id="computerCode"
                                            name="computerCode"
                                            required
                                            placeholder="e.g. 59500"
                                            value={formData.computerCode}
                                            onChange={handleChange}
                                        />
                                        <small>Your unique college ID/Roll Number.</small>
                                    </div>

                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        color: '#fca5a5'
                                    }}>
                                        <strong>⚠️ Important:</strong> Fill this carefully! Your branch and semester will be used to match you with eligible job opportunities. This can only be updated at the end of each semester.
                                    </div>
                                </>
                            )}
                        </>
                    )}

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
