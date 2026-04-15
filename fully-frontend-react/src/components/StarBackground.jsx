import React, { useEffect, useRef, useState } from 'react';

const StarBackground = () => {
    const canvasRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Set a 30-second timer to show the background
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 30000); // 30,000ms = 30 seconds

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isVisible) return;

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
                radius: Math.random() * 1.5,
                alpha: Math.random() * 0.7 + 0.3,
                velocity: Math.random() * 0.4 + 0.1
            });
        }

        // Code Particle properties
        const codeParticles = [];
        const numCodeParticles = 40;
        const symbols = ['{', '}', '</>', '&&', '||', '!=', ';', '[]', '()', '=>', '*'];

        // Initialize code particles
        for (let i = 0; i < numCodeParticles; i++) {
            codeParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                text: symbols[Math.floor(Math.random() * symbols.length)],
                size: Math.random() * 10 + 8,
                alpha: Math.random() * 0.3 + 0.1,
                velocity: Math.random() * 0.2 + 0.05
            });
        }

        // Animation Loop
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Black background (inside the canvas)
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Stars
            stars.forEach(star => {
                star.y -= star.velocity;
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            // Draw Floating Code Particles
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'center';
            codeParticles.forEach(p => {
                p.y -= p.velocity;
                if (p.y < 0) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                    p.text = symbols[Math.floor(Math.random() * symbols.length)];
                }

                ctx.fillStyle = `rgba(14, 165, 233, ${p.alpha})`;
                ctx.font = `${p.size}px monospace`;
                ctx.fillText(p.text, p.x, p.y);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fade-in"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -50,
                pointerEvents: 'none'
            }}
        />
    );
};

export default StarBackground;
