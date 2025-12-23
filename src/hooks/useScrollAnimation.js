import { useEffect, useRef } from 'react';

const useScrollAnimation = (options = { threshold: 0.1 }) => {
    // We don't strictly need a ref for the observer if we just query the DOM,
    // but React-way is often to use refs. However, since we are targeting a class name globally
    // inside the component (legacy way), we'll keep the logic simple but wrapped.

    // Better approach: Return a ref to attach to specific elements, but here 
    // we want to support multiple elements.

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Stop observing once visible to save performance
                    // observer.unobserve(entry.target); 
                }
            });
        }, options);

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, []); // Empty dependency to run once on mount
};

export default useScrollAnimation;
