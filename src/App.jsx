
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileUpdateModal from './components/ProfileUpdateModal';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import ResetSuccess from './pages/ResetSuccess';
import Jobs from './pages/Jobs';
import ResumeBuilder from './pages/ResumeBuilder';
import Interview from './pages/Interview';
import Papers from './pages/Papers';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Onboarding from './pages/Onboarding';
import ResumeAnalysis from './pages/ResumeAnalysis';
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
import { ToastProvider } from './components/Toast';
import './styles/interaction.css';
import Lenis from 'lenis';
import CustomCursor from './components/CustomCursor';


function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate(); // Add hook
    const hideNavbarRoutes = ['/login', '/admin/login', '/register', '/admin', '/onboarding', '/forgot-password', '/verify-otp', '/reset-password', '/reset-success', '/verify-account'];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Check if student needs to update profile
    // DISABLED: Iron Dome Guard - All data now collected during registration
    // Users no longer need to complete onboarding form after registration
    /*
    useEffect(() => {
        const checkProfileStatus = async () => {
            const token = localStorage.getItem('authToken');
            const userRole = localStorage.getItem('userRole');

            // Only check for students (USER role)
            if (token && userRole === 'USER') {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/profile-status`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.needsUpdate) {
                            // IRON DOME GUARD: Force redirect to Onboarding
                            if (location.pathname !== '/onboarding' && location.pathname !== '/resume-builder') {
                                navigate('/onboarding');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking profile status:', error);
                }
            }
        };

        checkProfileStatus();
    }, [location.pathname, navigate]);
    */

    const handleProfileUpdate = () => {
        setShowProfileModal(false);
        // Optionally refresh the page or update state
    };

    return (
        <>
            {showNavbar && <Navbar />}
            {children}
            {showNavbar && <Footer />}
            {/* DISABLED: Profile completion modal - all data collected during registration
            <ProfileUpdateModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onUpdate={handleProfileUpdate}
            />
            */}
        </>
    );
}

function App() {
    const [isLoading, setIsLoading] = useState(true);

    // Start keep-alive service when app loads
    useEffect(() => {
        keepAliveService.start();

        // Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Cleanup on unmount
        return () => {
            keepAliveService.stop();
            lenis.destroy();
        };
    }, []);

    return (
        <ToastProvider>
            <CustomCursor />
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/reset-success" element={<ResetSuccess />} />
                        <Route path="/verify-account" element={<VerifyAccount />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/resume" element={<ResumeAnalysis />} />
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
                    </Routes>
                </Layout>
            </Router>
        </ToastProvider>
    );
}

export default App;
