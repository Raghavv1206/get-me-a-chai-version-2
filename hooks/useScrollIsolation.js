// hooks/useScrollIsolation.js
"use client"
import { useEffect, useRef } from 'react';

/**
 * Custom hook to isolate scroll events within a container
 * Prevents scroll propagation to parent elements
 */
export function useScrollIsolation() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            // Prevent propagation if we're scrolling within bounds
            if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
                e.stopPropagation();
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    return containerRef;
}
