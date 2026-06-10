import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/CustomToast';
import '../styles/quiz.css';
import '../styles/papers.css';
import { quizData } from '../data/quizData';

const subjects = [
    { id: 'html', name: 'HTML', icon: 'fab fa-html5', desc: 'Web Structure' },
    { id: 'css', name: 'CSS', icon: 'fab fa-css3-alt', desc: 'Web Styling' },
    { id: 'javascript', name: 'JavaScript', icon: 'fab fa-js', desc: 'Web Interactivity' },
    { id: 'react', name: 'React', icon: 'fab fa-react', desc: 'Frontend Library' },
    { id: 'java', name: 'Java', icon: 'fab fa-java', desc: 'Backend & OOP' },
    { id: 'springboot', name: 'Spring Boot', icon: 'fas fa-leaf', desc: 'Java Framework' },
    { id: 'python', name: 'Python', icon: 'fab fa-python', desc: 'Versatile Language' },
    { id: 'sql', name: 'SQL', icon: 'fas fa-database', desc: 'Database Queries' },
    { id: 'dsa', name: 'DSA', icon: 'fas fa-sitemap', desc: 'Problem Solving' },
    { id: 'git', name: 'Git', icon: 'fab fa-git-alt', desc: 'Version Control' }
];

const Quiz = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState('subject-selection'); // subject-selection, quiz, quiz-results
    const [currentSubject, setCurrentSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerState, setAnswerState] = useState(null); // 'correct' | 'wrong' | null
    const timerRef = useRef(null);

    // Timer logic
    const startTimer = () => {
        clearInterval(timerRef.current);
        setTimeElapsed(0);
        timerRef.current = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
    };

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleStartQuiz = (subjectId) => {
        const subjectQuestions = quizData[subjectId] || [];
        if (subjectQuestions.length === 0) {
            showToast({
                message: `Sorry, no questions available for ${subjectId.toUpperCase()} yet!`,
                type: 'info'
            });
            return;
        }
        setCurrentSubject(subjects.find(s => s.id === subjectId));
        setQuestions(subjectQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
        setAnswerState(null);
        setStep('quiz');
        startTimer();
    };

    const handleOptionSelect = (option) => {
        if (answerState) return; // Prevent changing after submission/reveal
        setSelectedOption(option);
    };

    const handleNextQuestion = () => {
        // Logic checks if user has selected
        if (!selectedOption) return;

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQ.answer;

        if (!answerState) {
            // First click calculates result
            if (isCorrect) setScore(prev => prev + 1);
            setAnswerState(isCorrect ? 'correct' : 'wrong');

            // Auto advance after short delay
            setTimeout(() => {
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setSelectedOption(null);
                    setAnswerState(null);
                } else {
                    stopTimer();
                    setStep('quiz-results');
                }
            }, 1200);
        }
    };

    // Need to handle manually clicking Next if we want that behavior, 
    // but the original logic seemed to rely on button click to confirm.
    // The original logic: user selects radio, then clicks next. 
    // Wait, the original was: "nextBtn.addEventListener('click', handleNextQuestion);"
    // handleNextQuestion checks: "const selectedOptionInput = document.querySelector('.option input:checked');"
    // Then it shows correct/wrong styles AND then setTimeout to next question.

    // Adjusted logic to match React:
    // Button triggers check.
    const onNextClick = () => {
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQ.answer;

        if (isCorrect) setScore(prev => prev + 1);
        setAnswerState(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setAnswerState(null);
            } else {
                stopTimer();
                setStep('quiz-results');
            }
        }, 1200);
    };

    const handleQuit = () => {
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
            stopTimer();
            setStep('subject-selection');
        }
    };

    const handleRestart = () => {
        setStep('subject-selection');
        stopTimer();
    };

    return (
        <main className="quiz-container" style={{ paddingTop: '80px' }}>
            <Helmet>
                <title>Placement Preparation Quizzes | Hack-2-Hired</title>
                <meta name="description" content="Test your knowledge with our free placement preparation quizzes. Practice HTML, CSS, JavaScript, React, Java, DSA, and more to ace your technical interviews." />
                <meta name="keywords" content="placement quiz, technical interview practice, DSA quiz, React quiz, coding test preparation" />
            </Helmet>
            {step === 'subject-selection' && (
                <section id="subject-selection" className="quiz-step active">
                    <div className="papers-header-container" style={{ marginBottom: '3rem' }}>
                        <div className="papers-header-left">
                            <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700' }}>
                                <i className="fas fa-brain" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                                Quiz <span style={{ color: 'var(--primary)' }}>Master</span>
                            </h2>
                            <p className="sr-only">Select a subject to test your knowledge and prepare for interviews.</p>
                        </div>
                        <div className="papers-header-right">
                            <div className="global-search-container" style={{
                                position: 'relative',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50px',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backdropFilter: 'blur(15px)',
                                transition: 'all 0.3s ease',
                                width: '100%',
                                maxWidth: '300px'
                            }}>
                                <i className="fas fa-search" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                                <input
                                    type="text"
                                    placeholder="Search Quizzes..."
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        width: '100%',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div id="subject-menu" className="subject-grid">
                        {subjects.map(s => (
                            <div key={s.id} className="subject-btn" onClick={() => handleStartQuiz(s.id)}>
                                <i className={s.icon}></i>
                                <div className="subject-name">{s.name}</div>
                                <div className="subject-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {step === 'quiz' && (
                <section id="quiz" className="quiz-step active">
                    {/* Slim Header Container */}
                    <div className="papers-header-container slim-interview-header" style={{ marginBottom: '24px', borderRadius: '24px', border: '1px solid rgba(0, 212, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)', alignItems: 'center' }}>
                        <div className="papers-header-left">
                            <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: '700' }}>{currentSubject?.name} Quiz</h2>
                        </div>
                        <div className="papers-header-right" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <span id="progress-text" style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <div id="timer" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: '700', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                                <i className="fas fa-clock"></i> <span style={{ marginLeft: '5px' }}>{formatTime(timeElapsed)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quiz-card" style={{ position: 'relative', overflow: 'hidden', padding: '3rem 2.5rem', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 212, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)', margin: '0 auto', maxWidth: '800px' }}>
                        {/* Sleek pulsating progress bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(0,0,0,0.3)' }}>
                            <div style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)', transition: 'width 0.3s ease', animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}></div>
                        </div>

                        <div className="question-container" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                            <p id="question-text" style={{ fontSize: '1.4rem', fontWeight: '600', lineHeight: '1.6' }}>{questions[currentQuestionIndex]?.question}</p>
                        </div>

                        <div id="options-container" className="options-grid">
                            {questions[currentQuestionIndex]?.options.map((opt, i) => {
                                const currentQ = questions[currentQuestionIndex];
                                let className = 'option';
                                if (answerState) {
                                    if (opt === currentQ.answer) className += ' correct';
                                    else if (selectedOption === opt) className += ' wrong';
                                } else {
                                    if (selectedOption === opt) className += ' selected';
                                }

                                return (
                                    <label key={i} className={className} onClick={() => !answerState && handleOptionSelect(opt)}>
                                        <input type="radio" name="option" value={opt} checked={selectedOption === opt} readOnly />
                                        <div className="option-badge">{String.fromCharCode(65 + i)}</div>
                                        <span className="option-text">{opt}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <footer className="quiz-card-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', gap: '1.5rem' }}>
                            <div id="score-display" style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>Score: <span style={{ color: '#fff', marginLeft: '5px' }}>{score}</span></div>
                            <button
                                id="next-question-btn"
                                className="btn btn-primary"
                                disabled={!selectedOption || !!answerState}
                                onClick={onNextClick}
                                style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #007aff 100%)', border: 'none', color: '#fff', padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '700', cursor: (!selectedOption || !!answerState) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', opacity: (!selectedOption || !!answerState) ? 0.6 : 1 }}
                            >
                                Next Question <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                            </button>
                        </footer>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button id="quit-quiz-btn" className="btn btn-outline" onClick={handleQuit} style={{ padding: '0.6rem 2rem', borderRadius: '50px', fontSize: '0.9rem' }}>Quit Quiz</button>
                    </div>
                </section>
            )}

            {step === 'quiz-results' && (
                <section id="quiz-results" className="quiz-step active">
                    <div className="result-card surface-glow">
                        <i className="fas fa-trophy result-icon"></i>
                        <h2>Quiz Completed!</h2>
                        <p id="result-message" className="result-message">
                            {Math.round((score / questions.length) * 100) >= 80 ? "Excellent Work! You're a true pro." :
                                Math.round((score / questions.length) * 100) >= 50 ? "Good Job! Keep practicing to master it." :
                                    "Keep Trying! Every attempt is a step forward."}
                        </p>
                        <p className="final-score">Your Score: <span>{score}</span> / <span>{questions.length}</span></p>
                        <div className="result-stats">
                            <div className="stat"><i className="fas fa-check-circle success"></i> Correct: <span>{score}</span></div>
                            <div className="stat"><i className="fas fa-times-circle danger"></i> Wrong: <span>{questions.length - score}</span></div>
                            <div className="stat"><i className="fas fa-hourglass-half"></i> Time: <span>{formatTime(timeElapsed)}</span></div>
                        </div>
                        <div className="result-actions">
                            <button id="play-again-btn" className="btn btn-primary" onClick={handleRestart}>Play Another Quiz</button>
                            <button id="back-to-home-btn" className="btn btn-outline" onClick={() => navigate('/')}>Back to Home</button>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default Quiz;
