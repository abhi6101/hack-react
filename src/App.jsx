import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import ResumeBuilder from './pages/ResumeBuilder';
// ...
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
                </Routes >
            </Layout >
        </Router >
    );
}

export default App;
