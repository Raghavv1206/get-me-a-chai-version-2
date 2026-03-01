"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: "vertical",
            gestureDirection: "vertical",
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            // Prevent Lenis from hijacking scroll on elements that manage their own scrolling.
            // Any element (or its ancestor) with [data-lenis-prevent] or overflow-y scrollable
            // will use native scroll instead of Lenis's smooth scroll.
            prevent: (node) => {
                // Check if this node or any ancestor has data-lenis-prevent attribute
                if (node.closest && node.closest('[data-lenis-prevent]')) {
                    return true;
                }

                // Check if the wheel target is inside an element with its own scrollbar
                let el = node;
                while (el && el !== document.body && el !== document.documentElement) {
                    const style = window.getComputedStyle(el);
                    const overflowY = style.overflowY;

                    if (overflowY === 'auto' || overflowY === 'scroll') {
                        // Only prevent if the element actually has scrollable content
                        if (el.scrollHeight > el.clientHeight) {
                            return true;
                        }
                    }

                    // Also check for fixed/absolute modals (overlays)
                    if (style.position === 'fixed' && el.classList.contains('report-modal-overlay')) {
                        return true;
                    }

                    el = el.parentElement;
                }

                return false;
            },
        });

        window.lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            window.lenis = null;
        };
    }, []);

    return null;
}
