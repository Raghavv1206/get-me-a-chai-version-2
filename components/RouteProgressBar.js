// components/RouteProgressBar.js - Global route change progress indicator
"use client"

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    const completeTimerRef = useRef(null);

    const startProgress = useCallback(() => {
        // Clear any existing timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);

        setProgress(0);
        setVisible(true);

        // Quickly jump to ~30%, then slow down
        let currentProgress = 0;
        timerRef.current = setInterval(() => {
            currentProgress += Math.random() * 10;
            if (currentProgress > 90) {
                currentProgress = 90;
                clearInterval(timerRef.current);
            }
            setProgress(currentProgress);
        }, 200);
    }, []);

    const completeProgress = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        setProgress(100);
        completeTimerRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 400);
    }, []);

    // Listen for route changes
    useEffect(() => {
        completeProgress();
    }, [pathname, searchParams, completeProgress]);

    // Intercept link clicks to start the progress bar
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip external links, hash links, and same-page links
            if (
                href.startsWith('http') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                anchor.target === '_blank'
            ) return;

            // Skip if modifier keys are pressed
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            // Only start if navigating to a different page
            if (href !== pathname) {
                startProgress();
            }
        };

        // Also intercept form submissions and programmatic navigation
        const handleSubmit = () => {
            startProgress();
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('submit', handleSubmit);
            if (timerRef.current) clearInterval(timerRef.current);
            if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        };
    }, [pathname, startProgress]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            {/* Background track */}
            <div className="h-[3px] w-full bg-transparent">
                {/* Progress bar */}
                <div
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-400 transition-all ease-out shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_30px_rgba(139,92,246,0.2)]"
                    style={{
                        width: `${progress}%`,
                        transitionDuration: progress === 100 ? '200ms' : '400ms',
                    }}
                />
            </div>
            {/* Glow pulse at the leading edge */}
            {progress < 100 && (
                <div
                    className="absolute top-0 h-[3px] w-20 bg-gradient-to-r from-transparent to-white/40 animate-pulse"
                    style={{
                        left: `calc(${progress}% - 80px)`,
                        transitionDuration: '400ms',
                    }}
                />
            )}
        </div>
    );
}
