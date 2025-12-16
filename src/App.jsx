import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import UserInfoBar from './components/UserInfoBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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

function Layout({ children }) {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/register', '/admin'];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            {showNavbar && <Navbar />}
            {showNavbar && <UserInfoBar />}
            {children}
            {showNavbar && <Footer />}
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
