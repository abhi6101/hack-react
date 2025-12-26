import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import '../styles/papers.css';

const Papers = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            showAlert({
                title: 'Login Required',
                message: 'You must be logged in to view this page.',
                type: 'login',
                actions: [
                    { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
                    { label: 'Go Home', primary: false, onClick: () => navigate('/') }
                ]
            });
            return;
        }

        // Optional token expiration check
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp < Date.now() / 1000) {
                showAlert({
                    title: 'Session Expired',
                    message: 'Your session has expired. Please log in again.',
                    type: 'warning',
                    actions: [
                        { label: 'Login', primary: true, onClick: () => { localStorage.clear(); navigate('/login'); } }
                    ]
                });
                localStorage.clear();
            }
        } catch (e) {
            console.error("Invalid token");
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate, showAlert]);

    return (
        <>
            <header className="page-header">
                <h1>IMCA Exam Papers Archive</h1>
                <p className="subtitle">Select a semester to view and download all available previous year papers.</p>
            </header>

            <main className="papers-container">
                <div className="semester-grid">
                    {/* Semester 1 */}
                    <a href="https://drive.google.com/drive/folders/1LkdlVCArIssfUoRztGp6F8ZwNCzWo9Hi?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 1</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 2 */}
                    <a href="https://drive.google.com/drive/folders/1tpsSU0BB_cQm4q1goULkxHSDQheHYNAz?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 2</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 3 */}
                    <a href="https://drive.google.com/drive/folders/1taxdg7Sbb5lizCSoTRXi9-lkOZD4dqs8?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 3</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 4 */}
                    <a href="https://drive.google.com/drive/folders/1ZyzqTkr_5H8l6qrTPHUcONzITNMvxglL?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 4</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 5 */}
                    <a href="https://drive.google.com/drive/folders/1WepaoiXLTuquFPVLQeYo__7NAGXrmP-G?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 5</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 6 */}
                    <a href="https://drive.google.com/drive/folders/1jg5zaDei1uwaOuZtl71AK5GbDVdNQUUR?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 6</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 7 */}
                    <a href="https://drive.google.com/drive/folders/1-vrToKAdP1WspzQTqUB3OsiAQhTktfVZ?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 7</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* Semester 8 */}
                    <a href="https://drive.google.com/drive/folders/1VjMYdHWFdLFbHXRkdi2DgqSUSBTNrxSC?usp=drive_link" target="_blank" rel="noopener noreferrer" className="semester-card surface-glow">
                        <div className="card-content">
                            <h2>Semester 8</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </a>

                    {/* MST Papers (Placeholder) */}
                    <div className="semester-card surface-glow" onClick={() => showToast({ message: 'MST Papers coming soon!', type: 'info' })} style={{ cursor: 'pointer' }}>
                        <div className="card-content">
                            <h2>MST Papers</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </div>

                    {/* NOTES (Placeholder) */}
                    <div className="semester-card surface-glow" onClick={() => showToast({ message: 'Notes coming soon!', type: 'info' })} style={{ cursor: 'pointer' }}>
                        <div className="card-content">
                            <h2>NOTES</h2>
                        </div>
                        <div className="card-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Papers;
