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
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(15px)',
                            WebkitBackdropFilter: 'blur(15px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                            padding: '1rem'
                        }}
                        onClick={hideAlert}
                    >
                        <motion.div
                            initial={{ scale: 0.7, y: 100, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.7, y: 100, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 20,
                                stiffness: 300
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%)',
                                backdropFilter: 'blur(30px)',
                                WebkitBackdropFilter: 'blur(30px)',
                                border: `2px solid ${getColor(alert.type)}60`,
                                borderRadius: '28px',
                                padding: '3.5rem 3rem',
                                maxWidth: '550px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: `
                                    0 30px 90px ${getColor(alert.type)}30,
                                    0 0 0 1px rgba(255, 255, 255, 0.05),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                                `,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                animate={{
                                    background: [
                                        `radial-gradient(circle at 20% 50%, ${getColor(alert.type)}15 0%, transparent 50%)`,
                                        `radial-gradient(circle at 80% 50%, ${getColor(alert.type)}15 0%, transparent 50%)`,
                                        `radial-gradient(circle at 20% 50%, ${getColor(alert.type)}15 0%, transparent 50%)`
                                    ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    pointerEvents: 'none'
                                }}
                            />

                            {/* Icon with glow */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    delay: 0.2,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15
                                }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    margin: '0 auto 2rem',
                                    background: `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}cc 100%)`,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    boxShadow: `
                                        0 10px 40px ${getColor(alert.type)}50,
                                        0 0 0 8px ${getColor(alert.type)}20,
                                        inset 0 2px 0 rgba(255, 255, 255, 0.3)
                                    `,
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    {getIcon(alert.type)}
                                </motion.div>

                                {/* Pulse ring */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 0, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        border: `3px solid ${getColor(alert.type)}`,
                                        borderRadius: '50%'
                                    }}
                                />
                            </motion.div>

                            {/* Title */}
                            {alert.title && (
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{
                                        fontSize: '2.2rem',
                                        marginBottom: '1.2rem',
                                        color: 'white',
                                        fontWeight: 700,
                                        letterSpacing: '-0.02em',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {alert.title}
                                </motion.h2>
                            )}

                            {/* Message */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{
                                    fontSize: '1.15rem',
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    marginBottom: '2.5rem',
                                    lineHeight: 1.7,
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                {alert.message}
                            </motion.p>

                            {/* Action buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                {alert.actions.length > 0 ? (
                                    alert.actions.map((action, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                action.onClick?.();
                                                hideAlert();
                                            }}
                                            style={{
                                                padding: '1.1rem 2.5rem',
                                                background: action.primary
                                                    ? `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}dd 100%)`
                                                    : 'rgba(255, 255, 255, 0.05)',
                                                color: action.primary ? 'white' : 'rgba(255, 255, 255, 0.9)',
                                                border: action.primary ? 'none' : '1.5px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '1.05rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: action.primary
                                                    ? `0 10px 30px ${getColor(alert.type)}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                                                    : 'none',
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)',
                                                letterSpacing: '0.02em'
                                            }}
                                        >
                                            {action.label}
                                        </motion.button>
                                    ))
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={hideAlert}
                                        style={{
                                            padding: '1.1rem 2.5rem',
                                            background: `linear-gradient(135deg, ${getColor(alert.type)} 0%, ${getColor(alert.type)}dd 100%)`,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '1.05rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: `0 10px 30px ${getColor(alert.type)}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                            letterSpacing: '0.02em'
                                        }}
                                    >
                                        OK
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};
