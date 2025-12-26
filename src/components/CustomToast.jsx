import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            default: return '#3b82f6';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ x: 400, opacity: 0, scale: 0.8 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 400, opacity: 0, scale: 0.8 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25
                            }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: `1.5px solid ${getColor(toast.type)}60`,
                                borderRadius: '16px',
                                padding: '16px 20px',
                                minWidth: '320px',
                                maxWidth: '400px',
                                boxShadow: `
                                    0 10px 40px ${getColor(toast.type)}30,
                                    0 0 0 1px rgba(255, 255, 255, 0.05),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                                `,
                                position: 'relative',
                                overflow: 'hidden',
                                pointerEvents: 'auto'
                            }}
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                animate={{
                                    background: [
                                        `radial-gradient(circle at 20% 50%, ${getColor(toast.type)}10 0%, transparent 50%)`,
                                        `radial-gradient(circle at 80% 50%, ${getColor(toast.type)}10 0%, transparent 50%)`,
                                        `radial-gradient(circle at 20% 50%, ${getColor(toast.type)}10 0%, transparent 50%)`
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    pointerEvents: 'none'
                                }}
                            />

                            {/* Content */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1, type: 'spring' }}
                                    style={{
                                        fontSize: '24px',
                                        flexShrink: 0,
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `${getColor(toast.type)}20`,
                                        borderRadius: '8px'
                                    }}
                                >
                                    {getIcon(toast.type)}
                                </motion.div>

                                {/* Message */}
                                <div style={{
                                    flex: 1,
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    lineHeight: 1.5,
                                    fontWeight: 500
                                }}>
                                    {toast.message}
                                </div>

                                {/* Close button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeToast(toast.id)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '14px',
                                        flexShrink: 0,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                                    }}
                                >
                                    ✕
                                </motion.button>
                            </div>

                            {/* Progress bar */}
                            {toast.duration > 0 && (
                                <motion.div
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{
                                        duration: toast.duration / 1000,
                                        ease: 'linear'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${getColor(toast.type)} 0%, ${getColor(toast.type)}80 100%)`,
                                        transformOrigin: 'left',
                                        borderRadius: '0 0 16px 16px'
                                    }}
                                />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
