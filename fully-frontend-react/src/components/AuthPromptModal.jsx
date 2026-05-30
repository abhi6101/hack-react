import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPromptModal = ({ 
    isOpen, 
    onClose, 
    title = "🔒 Login Required", 
    subtitle = "This service is available on our platform.", 
    description = "Please login or create an account to access this resource." 
}) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        style={{
                            width: '100%',
                            maxWidth: '480px',
                            background: 'rgba(22, 22, 34, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <i 
                            className="fas fa-times" 
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'color 0.2s'
                            }}
                        ></i>

                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(14, 165, 233, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(14, 165, 233, 0.2)'
                        }}>
                            <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                        </div>

                        <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem', color: '#fff' }}>
                            {title}
                        </h3>

                        <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                            {subtitle}
                        </p>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                            {description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: '#000',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Register Free
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthPromptModal;
