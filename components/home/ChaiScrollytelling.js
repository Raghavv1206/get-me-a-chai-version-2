"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Coffee } from 'lucide-react';

/**
 * ChaiScrollytelling Component
 * 
 * Replaces the HeroSection with a high-performance canvas-based scrollytelling experience.
 * Renders a sequence of 200 JPG frames synchronized with scroll position.
 */
export default function ChaiScrollytelling() {
    const router = useRouter();

    // State
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [frameIndex, setFrameIndex] = useState(0);
    const [showFallback, setShowFallback] = useState(false);

    // Refs
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imagesRef = useRef([]);
    const requestRef = useRef(null);

    // Constants
    const FRAME_COUNT = 200;
    // Using the confirmed file pattern: ezgif-frame-001.jpg -> ezgif-frame-200.jpg
    const FRAME_PATH = "/frames/ezgif-frame-";
    const FRAME_EXT = ".jpg";
    const SCROLL_HEIGHT = "500vh"; // 500vh for smooth storytelling

    // 1. Frame Preloading Logic
    useEffect(() => {
        let isMounted = true;
        const preloadImages = async () => {
            let loadedCount = 0;
            const images = [];
            const isMobile = window.innerWidth < 768; // Simple check for mobile

            // Create a promise for each image load
            const loadPromises = Array.from({ length: FRAME_COUNT }, (_, i) => {
                // Mobile optimization: Skip every 2nd frame (odd indices)
                // We keep the array size 200 to maintain index alignment, but leave slots null
                if (isMobile && i % 2 !== 0) {
                    images[i] = null;
                    loadedCount++; // Count as "loaded" for progress bar purposes
                    setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                    return Promise.resolve(null);
                }

                return new Promise((resolve, reject) => {
                    const img = new Image();
                    const frameNum = (i + 1).toString().padStart(3, "0");
                    img.src = `${FRAME_PATH}${frameNum}${FRAME_EXT}`;

                    img.onload = () => {
                        if (!isMounted) return;
                        loadedCount++;
                        setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                        resolve(img);
                    };

                    img.onerror = () => {
                        console.error(`Failed to load frame ${i + 1}`);
                        // Resolve anyway to avoid blocking the whole app, but frame will be missing
                        // Could insert a placeholder or just skip
                        resolve(null);
                    };

                    // Store in array immediately to preserve order
                    images[i] = img;
                });
            });

            try {
                await Promise.all(loadPromises);
                if (isMounted) {
                    imagesRef.current = images;
                    setImagesLoaded(true);
                }
            } catch (error) {
                console.error("Error loading frames:", error);
                setShowFallback(true);
            }
        };

        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) {
            setShowFallback(true);
            setImagesLoaded(true); // Skip loading
        } else {
            preloadImages();
        }

        return () => {
            isMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // 2. Canvas Rendering Logic
    const renderFrame = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesRef.current.length) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use the image at the specific index
        let img = imagesRef.current[index];

        // Fallback for mobile skipped frames: try previous frame
        if (!img) {
            // Find the nearest previous loaded frame
            let prevIndex = index - 1;
            while (prevIndex >= 0 && !imagesRef.current[prevIndex]) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                img = imagesRef.current[prevIndex];
            }
        }

        if (!img) return; // Still no image? e.g. index 0 missing or everything failed

        // Check and update canvas dimensions to match display size with high DPI support
        const dpr = window.devicePixelRatio || 1;
        // We use clientWidth/Height which is the CSS size of the canvas container
        const rect = canvas.getBoundingClientRect();

        // If the internal resolution doesn't match the display size * DPR, update it
        // This fixes the "blurry first frame" issue by ensuring 1:1 pixel mapping
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Needed so regular CSS sizing works naturally
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        }

        // Canvas dimensions logic (Object-cover equivalent)
        const { width, height } = canvas;
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image: scale image by width
            drawWidth = width;
            drawHeight = width / imgRatio;
            offsetX = 0;
            offsetY = (height - drawHeight) / 2;
        } else {
            // Canvas is taller than image: scale image by height
            drawHeight = height;
            drawWidth = height * imgRatio;
            offsetX = (width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }, []);

    // 3. Scroll Handler & Step-Based Navigation
    // ─────────────────────────────────────────────────────────────────────────
    // CHECKPOINT DESIGN:
    //   Each checkpoint is placed at the EXACT scroll progress where a text
    //   overlay reaches 100% opacity. The scroll snaps ONLY to these points.
    //
    //   Overlay 0 (Hero "Get Me a Chai")          → peak at 0.00
    //   Overlay 1 ("bank account said no…")       → peak at 0.17  (midpoint of 0.10–0.24)
    //   Overlay 2 ("asking for vibes")            → peak at 0.35  (midpoint of 0.26–0.44)
    //   Overlay 3 ("₹5Cr+ raised…")              → peak at 0.575 (midpoint of 0.46–0.69)
    //   Overlay 4 (CTA "Turn your 3 AM ideas…")  → peak at 0.87  (fully opaque from ~0.82)
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!imagesLoaded || showFallback) return;

        let isAnimating = false;
        let rafPending = false;

        // Checkpoints aligned to 100%-opacity moments of each text overlay
        const checkpoints = [0.00, 0.17, 0.35, 0.575, 0.87];

        // ── Geometry cache ──────────────────────────────────────────────────
        // We cache the container's absolute top offset and height so that the
        // scroll handler never calls getBoundingClientRect (which forces reflow).
        let containerTop = 0;     // absolute offset from document top
        let containerHeight = 0;
        let windowHeight = window.innerHeight;

        const updateGeometryCache = () => {
            if (!containerRef.current) return;
            // offsetTop relative to offsetParent — walk up the tree
            let el = containerRef.current;
            let top = 0;
            while (el) {
                top += el.offsetTop;
                el = el.offsetParent;
            }
            containerTop = top;
            containerHeight = containerRef.current.offsetHeight;
            windowHeight = window.innerHeight;
        };

        // Compute once on mount
        updateGeometryCache();

        const getScrollProgress = () => {
            const scrollableDistance = containerHeight - windowHeight;
            if (scrollableDistance <= 0) return 0;
            const scrolled = window.scrollY - containerTop;
            return Math.max(0, Math.min(1, scrolled / scrollableDistance));
        };

        // ── Shared: find target checkpoint for a given direction ────────────
        // Returns the index of the next checkpoint to snap to, or -1 if the
        // user should EXIT the section (already at the last/first checkpoint).
        const findTargetCheckpoint = (currentProgress, direction) => {
            if (direction > 0) {
                // Moving down → find FIRST checkpoint meaningfully ahead
                for (let i = 0; i < checkpoints.length; i++) {
                    if (checkpoints[i] > currentProgress + 0.01) return i;
                }
                // No checkpoint ahead → signal exit
                return -1;
            } else {
                // Moving up → find LAST checkpoint meaningfully behind
                for (let i = checkpoints.length - 1; i >= 0; i--) {
                    if (checkpoints[i] < currentProgress - 0.01) return i;
                }
                // No checkpoint behind → signal exit
                return -1;
            }
        };

        // ── Shared: smoothly animate scroll to a target pixel position ──────
        // Uses requestAnimationFrame for buttery-smooth animation that works
        // reliably on both desktop and mobile (unlike window.scrollTo behavior
        // which can be janky or interrupted by touch events on mobile).
        let snapAnimationId = null;

        const smoothScrollTo = (targetPx, duration = 800, onDone) => {
            // Cancel any in-progress snap animation
            if (snapAnimationId) {
                cancelAnimationFrame(snapAnimationId);
                snapAnimationId = null;
            }

            const startPx = window.scrollY;
            const distance = targetPx - startPx;

            // If already at the target (or extremely close), skip animation
            if (Math.abs(distance) < 1) {
                if (onDone) onDone();
                return;
            }

            const startTime = performance.now();

            // Expo ease-out for a premium feel
            const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

            const step = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(1, elapsed / duration);
                const eased = easeOutExpo(t);

                window.scrollTo(0, startPx + distance * eased);

                if (t < 1) {
                    snapAnimationId = requestAnimationFrame(step);
                } else {
                    snapAnimationId = null;
                    if (onDone) onDone();
                }
            };

            snapAnimationId = requestAnimationFrame(step);
        };

        // ── Shared: animate to checkpoint (used by both wheel and touch) ────
        const animateToCheckpoint = (targetCPIndex) => {
            const targetProgress = checkpoints[targetCPIndex];
            const scrollableDistance = containerHeight - windowHeight;
            const targetPx = containerTop + targetProgress * scrollableDistance;

            isAnimating = true;

            if (window.lenis) {
                window.lenis.scrollTo(targetPx, {
                    duration: 1.2,
                    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                    lock: true,
                    onComplete: () => {
                        isAnimating = false;
                        updateGeometryCache();
                    },
                });
            } else {
                smoothScrollTo(targetPx, 800, () => {
                    isAnimating = false;
                    updateGeometryCache();
                });
            }
        };

        // ── Shared: exit the section boundary ───────────────────────────────
        const exitSection = (direction) => {
            const scrollTop = window.scrollY;
            const exitPx = direction > 0
                ? scrollTop + windowHeight * 0.6
                : Math.max(0, scrollTop - windowHeight * 0.6);

            if (window.lenis) {
                window.lenis.scrollTo(exitPx);
            } else {
                smoothScrollTo(exitPx, 500);
            }
        };

        // ── Check if viewport is inside the scrollytelling section ──────────
        const isInsideSection = () => {
            const scrollTop = window.scrollY;
            return !(
                scrollTop + windowHeight < containerTop + 1 ||
                scrollTop > containerTop + containerHeight - windowHeight - 1
            );
        };

        // ── Process scroll → update frame ───────────────────────────────────
        const processScroll = () => {
            rafPending = false;
            if (!containerRef.current) return;

            const progress = getScrollProgress();

            // Linear frame mapping (1:1 progress-to-frame)
            const targetIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(progress * FRAME_COUNT)
            );

            if (targetIndex !== frameIndex) {
                setFrameIndex(targetIndex);
                requestRef.current = requestAnimationFrame(() =>
                    renderFrame(targetIndex)
                );
            }
        };

        // rAF-throttled scroll handler
        const handleScroll = () => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(processScroll);
        };

        // ── Wheel handler: snap to nearest checkpoint ───────────────────────
        const handleWheel = (e) => {
            if (!containerRef.current) return;
            if (!isInsideSection()) return;

            e.preventDefault();
            if (isAnimating) return;

            const currentProgress = getScrollProgress();
            const direction = Math.sign(e.deltaY);
            if (direction === 0) return;

            const targetIdx = findTargetCheckpoint(currentProgress, direction);

            // -1 means no more checkpoints in this direction → exit section
            if (targetIdx === -1) {
                exitSection(direction);
                return;
            }

            animateToCheckpoint(targetIdx);
        };

        // ══════════════════════════════════════════════════════════════════════
        // ── TOUCH HANDLER: snap scrolling for touchscreen devices ────────────
        // ══════════════════════════════════════════════════════════════════════
        //
        // Strategy:
        //   1. On touchstart, record the initial position and timestamp.
        //   2. On touchmove, prevent default scroll to freeze the page, but
        //      manually update the scroll position for visual feedback. Track
        //      velocity from the last N samples for accurate direction detection.
        //   3. On touchend, calculate swipe direction from velocity (or fallback
        //      to net displacement), then snap to the next/previous checkpoint.
        //
        // Edge cases handled:
        //   - Multi-finger gestures (ignored; only single-finger swipes snap)
        //   - Tiny/accidental touches (minimum displacement threshold)
        //   - Rapid successive swipes (animation guard)
        //   - Touch outside section boundaries (native scroll passthrough)
        //   - Section exit at first/last checkpoint
        //   - Orientation change mid-touch (geometry refresh)
        //   - iOS overscroll/rubber-band prevention
        // ──────────────────────────────────────────────────────────────────────

        let touchStartY = 0;
        let touchStartX = 0;
        let touchStartTime = 0;
        let touchStartScrollY = 0;
        let touchActive = false;
        let touchInsideSection = false;

        // Velocity tracking: keep the last few move samples
        const velocitySamples = [];
        const MAX_VELOCITY_SAMPLES = 5;

        // Thresholds
        const MIN_SWIPE_DISTANCE = 20;   // px — ignore accidental micro-touches
        const HORIZONTAL_REJECT_RATIO = 1.5; // if horizontal distance > vertical * ratio, ignore

        const handleTouchStart = (e) => {
            if (!containerRef.current) return;

            // Only handle single-finger touches
            if (e.touches.length !== 1) {
                touchActive = false;
                return;
            }

            // ── Allow taps on interactive elements (links, buttons) ──────────
            // If the user taps on a CTA button or link, let native behavior
            // handle it instead of intercepting for scroll snapping.
            const target = e.touches[0].target;
            if (target && target.closest && target.closest('a, button, [role="button"], input, select, textarea')) {
                touchActive = false;
                return;
            }

            // Refresh geometry in case layout shifted (keyboard, orientation, etc.)
            updateGeometryCache();

            touchInsideSection = isInsideSection();
            if (!touchInsideSection) return;

            // Cancel any in-flight snap animation from a previous swipe
            if (snapAnimationId) {
                cancelAnimationFrame(snapAnimationId);
                snapAnimationId = null;
                isAnimating = false;
            }

            const touch = e.touches[0];
            touchStartY = touch.clientY;
            touchStartX = touch.clientX;
            touchStartTime = performance.now();
            touchStartScrollY = window.scrollY;
            touchActive = true;

            // Reset velocity samples
            velocitySamples.length = 0;
            velocitySamples.push({ y: touch.clientY, t: touchStartTime });
        };

        const handleTouchMove = (e) => {
            if (!touchActive || !touchInsideSection) return;
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const deltaY = touchStartY - touch.clientY; // positive = swiping up = scroll down
            const deltaX = touchStartX - touch.clientX;

            // If the gesture is more horizontal than vertical, release control
            if (Math.abs(deltaX) > Math.abs(deltaY) * HORIZONTAL_REJECT_RATIO && Math.abs(deltaY) < 30) {
                return;
            }

            // Prevent native scroll + iOS rubber-banding
            e.preventDefault();

            // Record velocity sample
            const now = performance.now();
            velocitySamples.push({ y: touch.clientY, t: now });
            if (velocitySamples.length > MAX_VELOCITY_SAMPLES) {
                velocitySamples.shift();
            }

            // ── Visual feedback: Let the user "drag" the scroll ─────────────
            // This makes the touch feel responsive rather than frozen.
            // Apply a damping factor so the user can't freely scroll past
            // checkpoints — the page resists but still moves slightly.
            const damping = 0.35;
            const newScrollY = touchStartScrollY + deltaY * damping;

            // Clamp to section bounds so we don't overshoot
            const minScroll = containerTop;
            const maxScroll = containerTop + containerHeight - windowHeight;
            const clamped = Math.max(minScroll, Math.min(maxScroll, newScrollY));

            window.scrollTo(0, clamped);
        };

        const handleTouchEnd = (e) => {
            if (!touchActive || !touchInsideSection) {
                touchActive = false;
                return;
            }
            touchActive = false;

            if (isAnimating) return;

            // ── Calculate swipe velocity from recent samples ─────────────────
            let velocity = 0;
            if (velocitySamples.length >= 2) {
                const newest = velocitySamples[velocitySamples.length - 1];
                // Use the sample ~80ms ago for stable velocity (not the very first)
                let oldest = velocitySamples[0];
                for (let i = velocitySamples.length - 2; i >= 0; i--) {
                    if (newest.t - velocitySamples[i].t >= 60) {
                        oldest = velocitySamples[i];
                        break;
                    }
                }
                const dt = newest.t - oldest.t;
                if (dt > 0) {
                    // velocity in px/ms; negative = finger moved up = swiping up = scroll down
                    velocity = (oldest.y - newest.y) / dt;
                }
            }

            // ── Determine direction ─────────────────────────────────────────
            const netDisplacement = touchStartY - (velocitySamples.length > 0
                ? velocitySamples[velocitySamples.length - 1].y
                : touchStartY);
            const absDisplacement = Math.abs(netDisplacement);

            // If the swipe was too small, snap to the NEAREST checkpoint (no direction bias)
            if (absDisplacement < MIN_SWIPE_DISTANCE && Math.abs(velocity) < 0.05) {
                const currentProgress = getScrollProgress();
                // Find nearest checkpoint
                let nearestIdx = 0;
                let nearestDist = Infinity;
                for (let i = 0; i < checkpoints.length; i++) {
                    const d = Math.abs(checkpoints[i] - currentProgress);
                    if (d < nearestDist) {
                        nearestDist = d;
                        nearestIdx = i;
                    }
                }
                animateToCheckpoint(nearestIdx);
                return;
            }

            // Primary: use velocity for direction (more reliable than displacement)
            // Fallback: use net displacement if velocity is too small
            const direction = Math.abs(velocity) > 0.03
                ? Math.sign(velocity)
                : Math.sign(netDisplacement);

            if (direction === 0) return;

            const currentProgress = getScrollProgress();

            // ── Find target checkpoint or exit ──────────────────────────────
            const targetIdx = findTargetCheckpoint(currentProgress, direction);

            // -1 means no more checkpoints in this direction → exit section
            if (targetIdx === -1) {
                exitSection(direction);
                return;
            }

            animateToCheckpoint(targetIdx);
        };

        const handleTouchCancel = () => {
            // Touch was interrupted (e.g., system gesture, notification)
            // Snap to nearest checkpoint to avoid leaving user stranded
            if (!touchActive || !touchInsideSection) {
                touchActive = false;
                return;
            }
            touchActive = false;

            if (isAnimating) return;

            const currentProgress = getScrollProgress();
            let nearestIdx = 0;
            let nearestDist = Infinity;
            for (let i = 0; i < checkpoints.length; i++) {
                const d = Math.abs(checkpoints[i] - currentProgress);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestIdx = i;
                }
            }
            animateToCheckpoint(nearestIdx);
        };

        // ── Resize / Orientation handler ────────────────────────────────────
        const handleResize = () => {
            updateGeometryCache();
            renderFrame(frameIndex);
        };

        // ── Event listener registration ─────────────────────────────────────
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Touch events are attached to the container element (not window) so
        // they only fire when touching inside the scrollytelling section.
        // { passive: false } is required to call preventDefault() in touchmove.
        const container = containerRef.current;
        if (container) {
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
            container.addEventListener('touchend', handleTouchEnd, { passive: true });
            container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
        }

        // Also listen for orientationchange (some older mobile browsers)
        window.addEventListener('orientationchange', () => {
            // Orientation change takes time to settle; update after a delay
            setTimeout(updateGeometryCache, 300);
        });

        // Initial render
        renderFrame(frameIndex);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('wheel', handleWheel);
            if (container) {
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
                container.removeEventListener('touchend', handleTouchEnd);
                container.removeEventListener('touchcancel', handleTouchCancel);
            }
            if (snapAnimationId) cancelAnimationFrame(snapAnimationId);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [imagesLoaded, showFallback, frameIndex, renderFrame]);

    // 4. Canvas Sizing
    useEffect(() => {
        if (!canvasRef.current) return;

        const handleResize = () => {
            const canvas = canvasRef.current;
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                renderFrame(frameIndex);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [frameIndex, renderFrame]);


    // Loading skeleton
    if (!imagesLoaded && !showFallback) {
        return (
            <section
                className="relative bg-gray-950 flex items-center justify-center"
                style={{ height: SCROLL_HEIGHT }}
            >
                <div className="sticky top-0 w-full flex flex-col items-center justify-center gap-6" style={{ height: '100dvh' }}>
                    <div className="animate-bounce">
                        <Coffee className="w-16 h-16 text-amber-400 mx-auto" aria-hidden="true" />
                    </div>
                    <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                    <p className="text-gray-400 font-medium" aria-live="polite">
                        Brewing your experience... {loadingProgress}%
                    </p>
                </div>
            </section>
        );
    }

    // Fallback for reduced motion or error
    if (showFallback) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 px-6 py-20">
                <div className="text-center max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-8">
                        Turn your 3 AM ideas into reality.
                    </h1>
                    <p className="text-xl text-gray-300 mb-12">
                        Get Me a Chai is where dreams get funded by pure vibes (and money).
                    </p>
                    <Link
                        href="/start-campaign"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                    >
                        Start Your Campaign
                    </Link>
                </div>
            </section>
        );
    }

    // ─── Opacity / Transform helpers for text overlays ───────────────────────
    // progress is derived from frameIndex: frameIndex / FRAME_COUNT
    const progress = frameIndex / FRAME_COUNT;

    /**
     * Compute overlay opacity with configurable peak point.
     * @param {number} start  - progress value where fade-in begins
     * @param {number} peak   - progress value where opacity = 1 (100% visible)
     * @param {number} end    - progress value where fade-out completes
     * @param {number} current - current scroll progress
     */
    const getOverlayOpacity = (start, peak, end, current) => {
        if (current < start || current > end) return 0;
        if (current <= peak) {
            // Fade in: start → peak
            if (peak === start) return 1;
            return Math.min(1, (current - start) / (peak - start));
        }
        // Fade out: peak → end
        if (end === peak) return 0;
        return Math.max(0, 1 - (current - peak) / (end - peak));
    };

    const currentPercent = progress * 100;

    return (
        <section
            ref={containerRef}
            className="relative bg-gray-950 overflow-hidden"
            style={{
                height: SCROLL_HEIGHT,
                overscrollBehavior: 'none',  // Prevent iOS rubber-band bounce
                touchAction: 'pan-x',        // We handle vertical pan; allow horizontal
            }}
        >
            {/* 100dvh accounts for mobile browser chrome; 100vh is the fallback */}
            <div
                className="sticky top-0 w-full overflow-hidden"
                style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
            >
                {/* Canvas Layer */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                    style={{ willChange: "transform" }}
                    aria-label="Animation showing a chai cup filling with liquid, steam rising, and particles exploding"
                    role="img"
                />

                {/* Cinematic Scrim */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

                {/* ── Overlay 0: Hero "Get Me a Chai" ────────────────────────── */}
                {/* Fully visible 0–5%, fades out by 9% (well before Overlay 1 fades in) */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 z-20"
                    style={{
                        opacity: progress <= 0.05
                            ? 1
                            : progress <= 0.09
                                ? Math.max(0, 1 - (progress - 0.05) / 0.04)
                                : 0,
                        transform: `scale(${1 + progress * 0.5}) translateY(${progress * -50}px)`,
                        transition: 'opacity 0.1s ease-out',
                        willChange: 'opacity, transform',
                    }}
                >
                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-center mb-4 md:mb-6 tracking-tight drop-shadow-2xl">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            Get Me a Chai
                        </span>
                    </h1>
                    <p className="text-sm sm:text-xl md:text-4xl font-normal text-white tracking-wider md:tracking-widest uppercase border-y border-white/20 py-2 md:py-4 backdrop-blur-md bg-black/40 px-4 sm:px-6 md:px-8 rounded-full shadow-2xl drop-shadow-lg mx-4 text-center">
                        Fund Dreams. Build Community.
                    </p>
                </div>

                {/* ── Overlay 1: "Your bank account said no…" ─────────────────── */}
                {/* Range 0.10 → 0.24, peak at 0.17 (checkpoint snaps here) */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 z-10"
                    style={{
                        opacity: getOverlayOpacity(0.10, 0.17, 0.24, progress),
                        transform: `scale(${1 + progress * 0.2})`,
                        transition: 'opacity 0.15s ease-out',
                    }}
                >
                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] px-2">
                        Your bank account said no.<br />
                        But your dreams said chai.
                    </h2>
                </div>

                {/* ── Overlay 2: "We're asking for vibes" ─────────────────────── */}
                {/* Range 0.26 → 0.44, peak at 0.35 (checkpoint snaps here) */}
                <div
                    className="absolute inset-0 flex items-center justify-start px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: getOverlayOpacity(0.26, 0.35, 0.44, progress),
                        transform: `translateX(${progress < 0.26 ? -50 : progress > 0.42 ? -50 : 0}px)`,
                        transition: 'all 0.5s ease-out',
                    }}
                >
                    <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-left max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        We&apos;re not asking for investments.<br />
                        We&apos;re asking for vibes. <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400 inline-block" />
                    </h2>
                </div>

                {/* ── Overlay 3: "₹5Cr+ raised…" ─────────────────────────────── */}
                {/* Range 0.46 → 0.69, peak at 0.575 (checkpoint snaps here) */}
                <div
                    className="absolute inset-0 flex items-center justify-end px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: getOverlayOpacity(0.46, 0.575, 0.69, progress),
                        transform: `translateX(${progress < 0.48 ? 50 : progress > 0.67 ? 50 : 0}px)`,
                        transition: 'all 0.5s ease-out',
                    }}
                >
                    <div className="text-right max-w-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        <h2 className="text-xl sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2 md:mb-4">
                            ₹5Cr+ raised by people who believed in
                        </h2>
                        <p className="text-lg sm:text-2xl md:text-4xl text-white italic">
                            &quot;delulu is the solulu&quot; 💭
                        </p>
                    </div>
                </div>

                {/* ── Overlay 4: CTA "Turn your 3 AM ideas…" ──────────────────── */}
                {/* Fades in from 0.75, fully opaque by 0.87 (checkpoint snaps here) */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-auto z-20"
                    style={{
                        opacity: progress >= 0.75
                            ? Math.min(1, (progress - 0.75) / 0.12) // fully opaque at 0.87
                            : 0,
                        transform: `translateY(${progress < 0.75 ? 20 : 0}px)`,
                        transition: 'all 0.5s ease-out',
                        pointerEvents: progress >= 0.75 ? 'auto' : 'none',
                    }}
                >
                    <p className="text-3xl sm:text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-6 md:mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] px-2">
                        Turn your 3 AM ideas<br />into reality.
                    </p>
                    <Link
                        href="/start-campaign"
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    >
                        Start Your Campaign
                        <svg
                            className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
