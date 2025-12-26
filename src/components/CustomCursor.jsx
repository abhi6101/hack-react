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
            x: mousePosition.x - 16, // 32px ring
            y: mousePosition.y - 16,
            height: 32,
            width: 32,
            scale: 1,
            backgroundColor: "transparent",
            border: "1.5px solid var(--primary)", // Electric Cyan
            opacity: 0.7
        },
        hover: {
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            height: 48,
            width: 48,
            scale: 1,
            backgroundColor: "rgba(14, 165, 233, 0.15)", // Cyan tint
            border: "1.5px solid var(--primary)",
            opacity: 1
        }
    };

    const dotVariants = {
        default: {
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
            height: 6,
            width: 6,
            backgroundColor: "#FFFFFF"
        },
        hover: {
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
            height: 6,
            width: 6,
            scale: 0, // Disappear on hover effect
            backgroundColor: "var(--primary)"
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
                    stiffness: 100,  /* Softer stiffness for more "float" */
                    damping: 20,     /* Higher damping for smooth drag */
                    mass: 0.8        /* Heavier feel */
                }}
            />
            {/* The Precision Dot */}
            <motion.div
                className="cursor-dot"
                variants={dotVariants}
                animate={isHovered ? "hover" : "default"}
                transition={{ duration: 0.1 }}
            />
        </div>
    );
}
