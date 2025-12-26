import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ai-robot.css';

const AIRobot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m your AI career assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickActions = [
        { icon: '💼', text: 'Find Jobs', action: 'jobs' },
        { icon: '📄', text: 'Resume Tips', action: 'resume' },
        { icon: '🎯', text: 'Career Roadmap', action: 'roadmap' },
        { icon: '📚', text: 'Learning Resources', action: 'learning' }
    ];

    const handleQuickAction = (action) => {
        const responses = {
            jobs: 'Great! Check out our Jobs page for the latest opportunities. You can filter by location, skills, and experience level.',
            resume: 'I can help you build an ATS-friendly resume! Visit our Resume Builder to get started. Make sure to quantify your achievements and use action verbs.',
            roadmap: 'Our Career Roadmap section shows you the 4-step path: Learn Skills → Build Projects → Perfect Resume → Get Hired. Scroll down to explore!',
            learning: 'We have curated learning resources including Web Security Academy, JavaScript tutorials, and Hack The Box challenges. Check the Learning Hub section!'
        };

        setMessages(prev => [...prev,
        { role: 'user', text: quickActions.find(q => q.action === action).text },
        { role: 'bot', text: responses[action] }
        ]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsTyping(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const botResponse = generateResponse(userMessage);
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = (message) => {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('job') || lowerMsg.includes('hiring')) {
            return 'We have 500+ companies actively hiring! Visit our Jobs page to explore opportunities in your field.';
        } else if (lowerMsg.includes('resume')) {
            return 'Our Resume Builder helps you create ATS-optimized resumes. Key tips: Use action verbs, quantify achievements, and tailor for each job.';
        } else if (lowerMsg.includes('interview')) {
            return 'Ace your interviews with our prep resources! Practice DSA, communicate your thought process, and do mock interviews.';
        } else if (lowerMsg.includes('learn') || lowerMsg.includes('course')) {
            return 'Check out our Learning Hub for curated resources on Web Development, Security, and Programming fundamentals.';
        } else {
            return 'I\'m here to help with jobs, resumes, interviews, and learning resources. What would you like to know more about?';
        }
    };

    return (
        <>
            {/* Floating Robot Button */}
            <motion.div
                className="ai-robot-button"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                    y: isOpen ? 0 : [0, -10, 0],
                }}
                transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <img src="/images/robot-assistant.png" alt="AI Assistant" />
                <div className="pulse-ring"></div>
                <div className="status-indicator"></div>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ai-chat-window"
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="header-content">
                                <img src="/images/robot-assistant.png" alt="AI" className="header-avatar" />
                                <div>
                                    <h3>AI Career Assistant</h3>
                                    <p className="status-text">
                                        <span className="status-dot"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`message ${msg.role}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {msg.role === 'bot' && (
                                        <img src="/images/robot-assistant.png" alt="AI" className="message-avatar" />
                                    )}
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    className="message bot"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <img src="/images/robot-assistant.png" alt="AI" className="message-avatar" />
                                    <div className="message-bubble typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            {quickActions.map((action, idx) => (
                                <motion.button
                                    key={idx}
                                    className="quick-action-btn"
                                    onClick={() => handleQuickAction(action.action)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="action-icon">{action.icon}</span>
                                    <span className="action-text">{action.text}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me anything..."
                                className="chat-input"
                            />
                            <motion.button
                                type="submit"
                                className="send-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={!inputValue.trim()}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIRobot;
