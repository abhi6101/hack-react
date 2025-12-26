import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/cursor.css'; // We'll create this for media query hiding

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            // Detect hoverable elements
            const target = e.target;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('clickable') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovered(!!isClickable);
        };

        const handleMouseEnter = () => setIsHidden(false);
        const handleMouseLeave = () => setIsHidden(true);

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);
        document.body.addEventListener('mouseenter', handleMouseEnter);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Don't render on empty initial state to prevent jump to 0,0
    if (mousePosition.x === 0 && mousePosition.y === 0) return null;
    if (isHidden) return null;

    const ringVariants = {
        default: {
            x: mousePosition.x - 20, // Center 40px circle
            y: mousePosition.y - 20,
            scale: 1,
            backgroundColor: "transparent",
            borderColor: "rgba(255, 255, 255, 0.3)"
        },
        hover: {
            x: mousePosition.x - 20,
            y: mousePosition.y - 20,
            scale: 1.5,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "transparent"
        }
    };

    const dotVariants = {
        default: {
            x: mousePosition.x - 4, // Center 8px dot
            y: mousePosition.y - 4,
            scale: 1
        },
        hover: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            scale: 0 // Hide dot on hover for cleaner look
        }
    };

    return (
        <div className="custom-cursor-container">
            {/* The Smooth Follower Ring */}
            <motion.div
                className="cursor-ring"
                variants={ringVariants}
                animate={isHovered ? "hover" : "default"}
                transition={{
                    type: "spring",
                    stiffness: 250,  /* Increased stiffness for tighter magnetic control */
                    damping: 20,     /* Adjusted damping for smooth settling */
                    mass: 0.5        /* Slight mass for momentum */
                }}
            />
        </div>
    );
}
