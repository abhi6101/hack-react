import React from 'react';
import { motion } from 'framer-motion';

const SEOContent = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <section style={{
            maxWidth: '1200px',
            margin: '4rem auto',
            padding: '0 2rem',
            color: 'var(--text-primary)'
        }}>
            {/* Main SEO Content - Google will read this! */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '24px',
                    padding: '3rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* H1 - Most Important for SEO */}
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                }}>
                    Hack2Hired – Complete College Placement & Job Portal for Students and Recruiters
                </h1>

                {/* Introduction Paragraph */}
                <p style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    marginBottom: '2rem'
                }}>
                    Hack2Hired is a comprehensive college placement and recruitment management platform designed to bridge the gap between students, colleges, and recruiters. Our intelligent system streamlines the entire placement process, from resume building and job applications to interview preparation and final hiring decisions. Whether you're a student looking for your dream job, a college managing placement drives, or a recruiter searching for top talent, Hack2Hired provides all the tools you need in one powerful platform.
                </p>

                {/* H2 - What is Hack2Hired */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginTop: '3rem',
                    marginBottom: '1rem',
                    color: '#667eea'
                }}>
                    What is Hack2Hired?
                </h2>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Hack2Hired is an all-in-one placement portal that revolutionizes how colleges conduct campus placements and how students prepare for their careers. Built with modern technology and user-centric design, our platform offers a seamless experience for managing job postings, student applications, resume screening, interview scheduling, and placement analytics. The system is designed to handle everything from small college placement cells to large-scale recruitment drives involving multiple companies and thousands of students.
                </p>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Our platform integrates advanced features like AI-powered resume analysis, automated job matching, real-time application tracking, and comprehensive analytics dashboards. Students can build professional resumes, practice with coding quizzes, access previous year placement papers, and apply to multiple jobs with a single click. Recruiters get access to a curated pool of verified candidates, advanced filtering options, and streamlined communication tools to make hiring faster and more efficient.
                </p>

                {/* H2 - Features for Students */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginTop: '3rem',
                    marginBottom: '1rem',
                    color: '#667eea'
                }}>
                    Features for Students
                </h2>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Students using Hack2Hired get access to a complete suite of career preparation and job application tools:
                </p>

                <ul style={{
                    fontSize: '1.05rem',
                    lineHeight: 2,
                    color: 'var(--text-secondary)',
                    marginLeft: '2rem',
                    marginBottom: '1.5rem'
                }}>
                    <li><strong>Smart Resume Builder:</strong> Create ATS-friendly resumes with our intelligent resume builder. Choose from multiple professional templates, get real-time suggestions, and ensure your resume passes automated screening systems used by top companies.</li>

                    <li><strong>Job Portal:</strong> Browse and apply to hundreds of job openings from leading companies. Filter by location, salary, skills required, and company type. Track all your applications in one centralized dashboard.</li>

                    <li><strong>Interview Preparation:</strong> Access comprehensive interview preparation resources including commonly asked questions, coding challenges, behavioral interview tips, and company-specific interview experiences shared by seniors.</li>

                    <li><strong>Practice Quizzes:</strong> Test your knowledge with topic-wise quizzes covering programming, aptitude, logical reasoning, and technical concepts. Get instant feedback and track your progress over time.</li>

                    <li><strong>Previous Year Papers:</strong> Access a vast collection of previous year placement papers from top companies. Practice with real questions asked in past recruitment drives to boost your confidence.</li>

                    <li><strong>Learning Resources:</strong> Explore curated learning paths, video tutorials, and study materials for popular programming languages, frameworks, and technologies demanded by employers.</li>

                    <li><strong>Application Tracking:</strong> Monitor the status of all your job applications in real-time. Receive notifications for interview calls, test invitations, and offer letters directly in your dashboard.</li>
                </ul>

                {/* H2 - Features for Colleges & Recruiters */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginTop: '3rem',
                    marginBottom: '1rem',
                    color: '#667eea'
                }}>
                    Features for Colleges and Recruiters
                </h2>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Colleges and recruiters benefit from powerful administrative and recruitment management tools:
                </p>

                <ul style={{
                    fontSize: '1.05rem',
                    lineHeight: 2,
                    color: 'var(--text-secondary)',
                    marginLeft: '2rem',
                    marginBottom: '1.5rem'
                }}>
                    <li><strong>Job Posting Management:</strong> Create and publish job openings with detailed requirements, eligibility criteria, and application deadlines. Manage multiple recruitment drives simultaneously with ease.</li>

                    <li><strong>Student Database:</strong> Access a comprehensive database of registered students with their academic records, skills, projects, and resumes. Use advanced filters to shortlist candidates based on specific criteria.</li>

                    <li><strong>Application Management:</strong> Review, shortlist, and reject applications efficiently. Send bulk notifications to selected candidates for tests, interviews, or final offers.</li>

                    <li><strong>Analytics Dashboard:</strong> Get detailed insights into placement statistics, application trends, company-wise hiring data, and student performance metrics. Generate reports for accreditation and internal reviews.</li>

                    <li><strong>Communication Tools:</strong> Send announcements, interview schedules, and updates to students through integrated email and notification systems. Maintain transparent communication throughout the recruitment process.</li>

                    <li><strong>Document Management:</strong> Collect, verify, and store student documents including resumes, mark sheets, and certificates in a secure, organized manner. Ensure compliance with data protection regulations.</li>
                </ul>

                {/* H2 - Why Choose Hack2Hired */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginTop: '3rem',
                    marginBottom: '1rem',
                    color: '#667eea'
                }}>
                    Why Choose Hack2Hired?
                </h2>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Hack2Hired stands out from traditional placement management systems through its modern approach, user-friendly interface, and comprehensive feature set. Our platform is built by students, for students, with deep understanding of the challenges faced during campus placements. We combine cutting-edge technology with practical insights to create a solution that truly works.
                </p>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    The platform is completely web-based, requiring no installation or complex setup. It works seamlessly across all devices – desktops, tablets, and smartphones – ensuring that students and recruiters can access it anytime, anywhere. Our responsive design and intuitive interface make it easy for users of all technical backgrounds to navigate and utilize the system effectively.
                </p>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Security and privacy are our top priorities. All student data is encrypted and stored securely, with role-based access controls ensuring that sensitive information is only accessible to authorized personnel. We comply with industry-standard security practices and regularly update our systems to protect against emerging threats.
                </p>

                {/* H2 - Get Started */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginTop: '3rem',
                    marginBottom: '1rem',
                    color: '#667eea'
                }}>
                    Get Started with Hack2Hired Today
                </h2>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Join thousands of students and hundreds of colleges already using Hack2Hired to streamline their placement processes. Whether you're a final year student preparing for campus placements, a college placement officer managing recruitment drives, or a recruiter looking for talented candidates, Hack2Hired has the tools and features you need to succeed.
                </p>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Getting started is simple – create your free account, complete your profile, and start exploring all the features we offer. Students can immediately begin building their resumes, browsing job openings, and practicing with quizzes. Colleges can set up their placement cell, add student records, and start posting job opportunities. Our comprehensive documentation and support team are always available to help you make the most of the platform.
                </p>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    Experience the future of campus placements with Hack2Hired – where technology meets opportunity, and dreams meet reality. Start your journey towards a successful career today!
                </p>
            </motion.div>
        </section>
    );
};

export default SEOContent;
