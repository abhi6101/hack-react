import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/CustomToast';
import '../styles/quiz.css';
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
        <main className="quiz-container">
            {step === 'subject-selection' && (
                <section id="subject-selection" className="quiz-step active">
                    <header className="page-header">
                        <h1><i className="fas fa-brain"></i> Quiz Master</h1>
                        <p className="subtitle">Select a subject to test your knowledge and prepare for interviews.</p>
                    </header>
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
                    <div className="quiz-card surface-glow">
                        <header className="quiz-card-header">
                            <h2 id="quiz-subject-title">{currentSubject?.name} Quiz</h2>
                            <div id="timer"><i className="fas fa-clock"></i> <span>{formatTime(timeElapsed)}</span></div>
                        </header>
                        <div className="progress-container">
                            <div id="progress-bar-container">
                                <div id="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                            <span id="progress-text">Question {currentQuestionIndex + 1}/{questions.length}</span>
                        </div>
                        <div className="question-container">
                            <p id="question-text">{questions[currentQuestionIndex]?.question}</p>
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
                                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                                        <span className="option-text">{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <footer className="quiz-card-footer">
                            <div id="score-display">Score: <span>{score}</span></div>
                            <button
                                id="next-question-btn"
                                className="btn btn-primary"
                                disabled={!selectedOption || !!answerState}
                                onClick={onNextClick}
                            >
                                Next Question <i className="fas fa-arrow-right"></i>
                            </button>
                        </footer>
                    </div>
                    <button id="quit-quiz-btn" className="quit-btn" onClick={handleQuit}>Quit Quiz</button>
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
