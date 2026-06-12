
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileUpdateModal from './components/ProfileUpdateModal';
import UserBottomNav from './components/UserBottomNav';
import UserMobileMenu from './components/UserMobileMenu';
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
import InterviewDetails from './pages/InterviewDetails';
import Papers from './pages/Papers';
import Notes from './pages/Notes';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Onboarding from './pages/Onboarding';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import Contact from './pages/Contact';
import VerifyAccount from './pages/VerifyAccount';
import UploadPaper from './pages/UploadPaper';
import keepAliveService from './services/keepAliveService';
import './styles/animations.css'; // Import animations
import { ToastProvider } from './components/Toast';
import './styles/interaction.css';



import { AlertProvider } from './components/CustomAlert';
import { ToastProvider as CustomToastProvider } from './components/CustomToast';


function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate(); // Add hook
    const hideNavbarRoutes = ['/login', '/admin/login', '/register', '/admin', '/onboarding', '/forgot-password', '/verify-otp', '/reset-password', '/reset-success', '/verify-account'];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);
    const showFooter = location.pathname === '/contact';
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleProfileUpdate = () => {
        setShowProfileModal(false);
        // Optionally refresh the page or update state
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            {showNavbar && <Navbar menuOpen={isMobileMenuOpen} />}
            {isMobileMenuOpen && showNavbar && <UserMobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />}
            {children}
            {showNavbar && <UserBottomNav isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />}
            {showFooter && <Footer />}
        </>
    );
}

function App() {
    const [isLoading, setIsLoading] = useState(true);

    // Start keep-alive service when app loads
    useEffect(() => {
        keepAliveService.start();

        // Cleanup on unmount
        return () => {
            keepAliveService.stop();
        };
    }, []);

    return (
        <CustomToastProvider>
            <AlertProvider>
                <ToastProvider>

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
                                <Route path="/resume-builder" element={<ResumeBuilder />} />
                                <Route path="/interview" element={<Interview />} />
                                <Route path="/interview/:id" element={<InterviewDetails />} />
                                <Route path="/papers" element={<Papers />} />
                                <Route path="/upload-paper" element={<UploadPaper />} />
                                <Route path="/notes" element={<Notes />} />
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
            </AlertProvider>
        </CustomToastProvider>
    );
}

export default App;
