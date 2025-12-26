import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = ({ title, message, type = 'info', actions = [] }) => {
        setAlert({ title, message, type, actions });
    };

    const hideAlert = () => {
        setAlert(null);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'login': return '🔒';
            default: return 'ℹ️';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            case 'login': return '#8b5cf6';
            default: return '#3b82f6';
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}

            <AnimatePresence>
                {alert && (
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
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000
                        }}
                        onClick={hideAlert}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(10, 10, 20, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${getColor(alert.type)}40`,
                                borderRadius: '24px',
                                padding: '3rem',
                                maxWidth: '500px',
                                width: '90%',
                                textAlign: 'center',
                                boxShadow: `0 20px 60px ${getColor(alert.type)}40`
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 1.5rem',
                                    background: `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}dd 100%)`,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem'
                                }}
                            >
                                {getIcon(alert.type)}
                            </motion.div>

                            {alert.title && (
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
                                    {alert.title}
                                </h2>
                            )}

                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                {alert.message}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {alert.actions.length > 0 ? (
                                    alert.actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                action.onClick?.();
                                                hideAlert();
                                            }}
                                            style={{
                                                padding: '1rem 2rem',
                                                background: action.primary
                                                    ? `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}dd 100%)`
                                                    : 'transparent',
                                                color: action.primary ? 'white' : 'var(--text-secondary)',
                                                border: action.primary ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: action.primary ? `0 10px 30px ${getColor(alert.type)}40` : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (action.primary) {
                                                    e.target.style.transform = 'translateY(-3px)';
                                                    e.target.style.boxShadow = `0 15px 40px ${getColor(alert.type)}60`;
                                                } else {
                                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                                    e.target.style.color = 'white';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (action.primary) {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = `0 10px 30px ${getColor(alert.type)}40`;
                                                } else {
                                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                                    e.target.style.color = 'var(--text-secondary)';
                                                }
                                            }}
                                        >
                                            {action.label}
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        onClick={hideAlert}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}dd 100%)`,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: `0 10px 30px ${getColor(alert.type)}40`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-3px)';
                                            e.target.style.boxShadow = `0 15px 40px ${getColor(alert.type)}60`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = `0 10px 30px ${getColor(alert.type)}40`;
                                        }}
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};
