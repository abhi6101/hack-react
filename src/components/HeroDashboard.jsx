import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import '../styles/hero-dashboard.css';

const HeroDashboard = ({ user, onLogout }) => {
    const [greeting, setGreeting] = useState('');
    const [displayName, setDisplayName] = useState(user.name || user.username);

    useEffect(() => {
        setDisplayName(user.name || user.username);
    }, [user]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Self-healing: If name is all digits (ID), try to fetch real name
    useEffect(() => {
        const isNumeric = /^\d+$/.test(displayName);
        if (isNumeric) {
            const token = localStorage.getItem('authToken');
            if (token) {
                fetch(`${API_BASE_URL}/student-profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.fullName) {
                            setDisplayName(data.fullName);
                            localStorage.setItem('userFullName', data.fullName);
                        }
                    })
                    .catch(err => console.error("Dashboard name fetch failed", err));
            }
        }
    }, [displayName]);

    return (
        <div className="hero-dashboard-card animate-on-scroll visible">
            <div className="dashboard-user-info">
                <div className="dashboard-greeting">
                    {greeting} 👋
                </div>
                <h2 className="dashboard-username" style={{ textTransform: 'capitalize' }}>
                    {displayName}
                </h2>
                <div className="dashboard-role-badge">
                    <span className="status-dot"></span>
                    {user.role} ACCOUNT
                </div>
            </div>

            <div className="dashboard-actions">
                <Link to="/jobs" className="action-card primary">
                    <i className="fas fa-rocket"></i>
                    <span>Explore Jobs</span>
                </Link>

                <Link to="/dashboard" className="action-card">
                    <i className="fas fa-chart-pie"></i>
                    <span>Dashboard</span>
                </Link>

                <Link to="/profile" className="action-card">
                    <i className="fas fa-user-edit"></i>
                    <span>Profile</span>
                </Link>

                <button onClick={onLogout} className="action-card logout">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default HeroDashboard;
