import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileUpdateModal from './components/ProfileUpdateModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Jobs from './pages/Jobs';
import ResumeBuilder from './pages/ResumeBuilder';
import Interview from './pages/Interview';
import Papers from './pages/Papers';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import Contact from './pages/Contact';
import VerifyAccount from './pages/VerifyAccount';
import keepAliveService from './services/keepAliveService';
import './styles/animations.css'; // Import animations

function Layout({ children }) {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/register', '/admin'];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Check if student needs to update profile
    useEffect(() => {
        const checkProfileStatus = async () => {
            const token = localStorage.getItem('authToken');
            const userRole = localStorage.getItem('userRole');

            // Only check for students (USER role)
            if (token && userRole === 'USER') {
                try {
                    const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/profile-status', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.needsUpdate) {
                            setShowProfileModal(true);
                        }
                    }
                } catch (error) {
                    console.error('Error checking profile status:', error);
                }
            }
        };

        checkProfileStatus();
    }, [location.pathname]);

    const handleProfileUpdate = () => {
        setShowProfileModal(false);
        // Optionally refresh the page or update state
    };

    return (
        <>
            {showNavbar && <Navbar />}
            {children}
            {showNavbar && <Footer />}
            <ProfileUpdateModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onUpdate={handleProfileUpdate}
            />
        </>
    );
}

function App() {
    // Start keep-alive service when app loads
    useEffect(() => {
        keepAliveService.start();

        // Cleanup on unmount
        return () => {
            keepAliveService.stop();
        };
    }, []);

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/resume-builder" element={<ResumeBuilder />} />
                    <Route path="/interview" element={<Interview />} />
                    <Route path="/papers" element={<Papers />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/profile" element={<StudentProfile />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:slug" element={<CourseDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
