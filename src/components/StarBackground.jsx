import React, { useEffect, useRef } from 'react';

const StarBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Star properties
        const stars = [];
        const numStars = 250;

        // Initialize stars
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5, // Distinct circles
                alpha: Math.random() * 0.7 + 0.3,
                velocity: Math.random() * 0.4 + 0.1 // Consistent upward drift
            });
        }

        // Animation Loop
        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. PURE BLACK BACKGROUND
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Moving Circles (Stars)
            stars.forEach(star => {
                // Move star upwards
                star.y -= star.velocity;

                // Reset position if off screen (wrap around to bottom)
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }

                // Draw circle
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -50, // Far behind
                pointerEvents: 'none'
            }}
        />
    );
};

export default StarBackground;
