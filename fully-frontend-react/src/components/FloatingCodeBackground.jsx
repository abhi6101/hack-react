import React, { useEffect, useRef } from 'react';

const FloatingCodeBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Syntax snippets to float
        const snippets = [
            'const', 'let', 'var', '=>', '{}', '[]', '()',
            'return', 'if', 'else', 'import', 'from',
            '<div>', 'class', 'this', 'async', 'await',
            ';', '&&', '||', '!=', '==', '+=', '//',
            'react', 'npm', 'git', 'node'
        ];

        // Configuration
        const particleCount = 20; // Number of floating items
        const colors = [
            'rgba(0, 212, 255, 0.15)', // Cyan
            'rgba(168, 85, 247, 0.15)', // Purple
            'rgba(34, 197, 94, 0.15)'   // Green
        ];
        const font = '16px "Fira Code", monospace';

        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    text: snippets[Math.floor(Math.random() * snippets.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 14 + Math.random() * 14, // Random size
                    speedY: -0.2 - Math.random() * 0.5, // Float Upwards
                    speedX: (Math.random() - 0.5) * 0.4, // Slight horizontal drift
                    rotation: (Math.random() - 0.5) * 0.2
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Update Position
                p.y += p.speedY;
                p.x += p.speedX;

                // Wrap around screen
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.x < -50) p.x = canvas.width + 50;
                if (p.x > canvas.width + 50) p.x = -50;

                // Draw Text
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.font = `${p.size}px monospace`;
                ctx.fillStyle = p.color;
                ctx.fillText(p.text, 0, 0);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
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
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                // We don't set a background color here so it overlays whatever exists
            }}
        />
    );
};

export default FloatingCodeBackground;
