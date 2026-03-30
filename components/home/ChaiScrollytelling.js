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
    useEffect(() => {
        if (!imagesLoaded || showFallback) return;

        let isAnimating = false;
        let rafPending = false;

        // ─── CHECKPOINTS ───────────────────────────────────────────────
        // Each checkpoint is where a text overlay is at **100% opacity**.
        // The scroll will ONLY stop at these positions — never in between.
        //
        // CP 0  (0.00) → Overlay 0  "Get Me a Chai"        (full at 0–5%)
        // CP 1  (0.20) → Overlay 1  "Your bank account…"   (peak at 20%)
        // CP 2  (0.40) → Overlay 2  "We're not asking…"    (peak at 40%)
        // CP 3  (0.60) → Overlay 3  "₹5Cr+ raised…"       (peak at 60%)
        // CP 4  (1.00) → Overlay 4  CTA                    (full at 100%)
        // ────────────────────────────────────────────────────────────────
        const checkpoints = [0.00, 0.20, 0.40, 0.60, 1.00];

        // How close to a checkpoint to count as "arrived"
        const SNAP_EPSILON = 0.02;

        // Container geometry cache
        let containerTop = 0;
        let containerHeight = 0;
        let windowHeight = window.innerHeight;

        const updateGeometry = () => {
            if (!containerRef.current) return;
            const el = containerRef.current;
            let top = 0;
            let node = el;
            while (node) {
                top += node.offsetTop;
                node = node.offsetParent;
            }
            containerTop = top;
            containerHeight = el.offsetHeight;
            windowHeight = window.innerHeight;
        };

        updateGeometry();

        const getScrollProgress = () => {
            const scrollableDistance = containerHeight - windowHeight;
            if (scrollableDistance <= 0) return 0;
            const scrolled = window.scrollY - containerTop;
            return Math.max(0, Math.min(1, scrolled / scrollableDistance));
        };

        // Find the nearest checkpoint to a given progress value
        const findNearestCheckpoint = (progress) => {
            let bestIdx = 0;
            let bestDist = Math.abs(checkpoints[0] - progress);
            for (let i = 1; i < checkpoints.length; i++) {
                const dist = Math.abs(checkpoints[i] - progress);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
            return bestIdx;
        };


        const processScroll = () => {
            rafPending = false;
            if (!containerRef.current) return;

            const progress = getScrollProgress();

            // Linear frame mapping (1:1 scroll-to-animation)
            const targetIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));

            if (targetIndex !== frameIndex) {
                setFrameIndex(targetIndex);
                requestRef.current = requestAnimationFrame(() => renderFrame(targetIndex));
            }
        };

        // rAF-throttled scroll handler
        const handleScroll = () => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(processScroll);
        };

        // Smooth-scroll to a checkpoint
        const scrollToCheckpoint = (targetProgress) => {
            const scrollableDistance = containerHeight - windowHeight;
            if (scrollableDistance <= 0) return;

            const targetPx = containerTop + (targetProgress * scrollableDistance);

            isAnimating = true;

            if (window.lenis) {
                window.lenis.scrollTo(targetPx, {
                    duration: 0.9,
                    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                    lock: true,
                    onComplete: () => { isAnimating = false; }
                });
            } else {
                window.scrollTo({ top: targetPx, behavior: 'smooth' });
                setTimeout(() => { isAnimating = false; }, 900);
            }
        };

        // ─── SHARED HELPERS ────────────────────────────────────────────
        const isInsideScrollytelling = () => {
            const scrollTop = window.scrollY;
            const containerBottom = containerTop + containerHeight;
            const viewportBottom = scrollTop + windowHeight;
            return scrollTop >= containerTop - 5 && viewportBottom <= containerBottom + 5;
        };

        const exitSection = (dir) => {
            isAnimating = true;
            let exitTarget;

            if (dir === 'down') {
                // Land exactly at the top of the next section.
                // containerTop + containerHeight is where the next DOM
                // element begins, so placing scrollTop there puts the
                // viewport right at the LiveStatsBar (no black gap).
                exitTarget = containerTop + containerHeight;
            } else {
                exitTarget = Math.max(0, containerTop - windowHeight * 0.6);
            }

            if (window.lenis) {
                window.lenis.scrollTo(exitTarget, {
                    duration: 0.8,
                    onComplete: () => { isAnimating = false; }
                });
            } else {
                window.scrollTo({ top: exitTarget, behavior: 'smooth' });
                setTimeout(() => { isAnimating = false; }, 700);
            }
        };

        const snapToNearest = (progress) => {
            const nearestIdx = findNearestCheckpoint(progress);
            const nearestCP = checkpoints[nearestIdx];
            if (Math.abs(nearestCP - progress) > SNAP_EPSILON) {
                scrollToCheckpoint(nearestCP);
            }
        };

        const navigateCheckpoint = (dir) => {
            const currentProgress = getScrollProgress();
            if (dir > 0) {
                if (currentProgress >= 1 - SNAP_EPSILON) { exitSection('down'); return; }
                const nextCP = checkpoints.find(cp => cp > currentProgress + SNAP_EPSILON);
                scrollToCheckpoint(nextCP !== undefined ? nextCP : 1.0);
            } else {
                if (currentProgress <= SNAP_EPSILON) { exitSection('up'); return; }
                const prevCP = [...checkpoints].reverse().find(cp => cp < currentProgress - SNAP_EPSILON);
                scrollToCheckpoint(prevCP !== undefined ? prevCP : 0.0);
            }
        };

        // ─── WHEEL HANDLER ─────────────────────────────────────────────
        let wheelAccum = 0;
        let wheelTimer = null;
        const WHEEL_COMMIT_DELAY = 120;

        const commitWheel = () => {
            wheelTimer = null;
            if (isAnimating) { wheelAccum = 0; return; }
            const direction = Math.sign(wheelAccum);
            wheelAccum = 0;
            if (direction === 0) return;
            navigateCheckpoint(direction);
        };

        const handleWheel = (e) => {
            if (!containerRef.current) return;
            if (!isInsideScrollytelling()) return;
            e.preventDefault();
            if (isAnimating) return;
            wheelAccum += e.deltaY;
            if (wheelTimer) clearTimeout(wheelTimer);
            wheelTimer = setTimeout(commitWheel, WHEEL_COMMIT_DELAY);
        };

        // ─── TOUCH HANDLER ─────────────────────────────────────────────
        let touchStartY = 0;
        let touchStartTime = 0;
        let touchStartProgress = 0;
        let touchLastY = 0;
        let touchLastTime = 0;
        let touchActive = false;
        let touchHijacked = false;
        let snapTimer = null;
        let scrollSettleTimer = null;
        let scrollSettleRafId = null;

        const TOUCH_SWIPE_THRESHOLD = 30;
        const TOUCH_VELOCITY_THRESHOLD = 0.4;
        const TOUCH_FLICK_MAX_DURATION = 300;

        const waitForScrollSettle = (callback) => {
            if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
            if (scrollSettleRafId) cancelAnimationFrame(scrollSettleRafId);
            let lastScrollY = window.scrollY;
            let stableFrames = 0;
            const FRAMES_TO_SETTLE = 5;
            const check = () => {
                const currentScrollY = window.scrollY;
                if (Math.abs(currentScrollY - lastScrollY) < 1) { stableFrames++; }
                else { stableFrames = 0; }
                lastScrollY = currentScrollY;
                if (stableFrames >= FRAMES_TO_SETTLE) { callback(); return; }
                scrollSettleRafId = requestAnimationFrame(check);
            };
            scrollSettleRafId = requestAnimationFrame(check);
            scrollSettleTimer = setTimeout(() => {
                if (scrollSettleRafId) cancelAnimationFrame(scrollSettleRafId);
                callback();
            }, 1500);
        };

        const handleTouchStart = (e) => {
            if (!containerRef.current) return;
            if (e.touches.length > 1) { touchActive = false; return; }
            if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
            if (scrollSettleTimer) { clearTimeout(scrollSettleTimer); scrollSettleTimer = null; }
            if (scrollSettleRafId) { cancelAnimationFrame(scrollSettleRafId); scrollSettleRafId = null; }
            const now = Date.now();
            touchStartY = e.touches[0].clientY;
            touchLastY = touchStartY;
            touchStartTime = now;
            touchLastTime = now;
            touchStartProgress = getScrollProgress();
            touchActive = true;
            touchHijacked = isInsideScrollytelling();
        };

        const handleTouchMove = (e) => {
            if (!touchActive || !containerRef.current) return;
            if (e.touches.length > 1) { touchActive = false; touchHijacked = false; return; }
            const currentY = e.touches[0].clientY;
            const deltaY = touchStartY - currentY;
            const now = Date.now();
            touchLastY = currentY;
            touchLastTime = now;
            const progress = getScrollProgress();

            if (touchHijacked) {
                if (progress <= 0 && deltaY < -TOUCH_SWIPE_THRESHOLD) { touchHijacked = false; return; }
                if (progress >= 1 && deltaY > TOUCH_SWIPE_THRESHOLD) { touchHijacked = false; return; }
                e.preventDefault();
            } else {
                if (isInsideScrollytelling() && Math.abs(deltaY) > 10) {
                    touchHijacked = true;
                    touchStartProgress = progress;
                }
            }
        };

        const handleTouchEnd = () => {
            if (!touchActive) return;
            touchActive = false;
            const endTime = Date.now();
            const totalDeltaY = touchStartY - touchLastY;
            const totalDuration = endTime - touchStartTime;
            const velocity = totalDuration > 0 ? Math.abs(totalDeltaY) / totalDuration : 0;
            const currentProgress = getScrollProgress();
            const direction = Math.sign(totalDeltaY);

            if (touchHijacked && !isAnimating) {
                const isFlick = Math.abs(totalDeltaY) > TOUCH_SWIPE_THRESHOLD
                    && velocity > TOUCH_VELOCITY_THRESHOLD
                    && totalDuration < TOUCH_FLICK_MAX_DURATION;
                const isDeliberateSwipe = Math.abs(totalDeltaY) > TOUCH_SWIPE_THRESHOLD;
                if ((isFlick || isDeliberateSwipe) && direction !== 0) {
                    navigateCheckpoint(direction);
                } else {
                    snapToNearest(currentProgress);
                }
            } else if (!touchHijacked) {
                waitForScrollSettle(() => {
                    if (isInsideScrollytelling() && !isAnimating) {
                        snapToNearest(getScrollProgress());
                    }
                });
            }
            touchHijacked = false;
        };

        const handleTouchCancel = () => {
            touchActive = false;
            touchHijacked = false;
            if (snapTimer) clearTimeout(snapTimer);
            snapTimer = setTimeout(() => {
                if (isAnimating) return;
                if (isInsideScrollytelling()) { snapToNearest(getScrollProgress()); }
            }, 300);
        };

        // ─── SCROLL-IDLE SNAP (SAFETY NET) ─────────────────────────────
        // After ALL scroll events stop firing for 150ms, if we're inside
        // the section and NOT at a checkpoint, snap to nearest.
        // This catches keyboard scroll, section entry, Find-on-page, etc.
        // ────────────────────────────────────────────────────────────────
        let scrollIdleTimer = null;
        const SCROLL_IDLE_DELAY = 150;

        const handleScrollIdle = () => {
            if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
            scrollIdleTimer = setTimeout(() => {
                if (isAnimating) return;
                if (!isInsideScrollytelling()) return;
                const progress = getScrollProgress();
                const nearestIdx = findNearestCheckpoint(progress);
                const nearestCP = checkpoints[nearestIdx];
                if (Math.abs(nearestCP - progress) > SNAP_EPSILON) {
                    scrollToCheckpoint(nearestCP);
                }
            }, SCROLL_IDLE_DELAY);
        };

        // ─── RESIZE / GEOMETRY ─────────────────────────────────────────
        const handleResize = () => {
            updateGeometry();
            renderFrame(frameIndex);
        };

        let geometryUpdateTimer = null;
        const handleScrollGeometry = () => {
            if (geometryUpdateTimer) return;
            geometryUpdateTimer = setTimeout(() => {
                updateGeometry();
                geometryUpdateTimer = null;
            }, 200);
        };

        // ─── EVENT BINDING ─────────────────────────────────────────────
        // touchmove MUST be non-passive to allow preventDefault.
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scroll', handleScrollGeometry, { passive: true });
        window.addEventListener('scroll', handleScrollIdle, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

        // Initial render
        renderFrame(frameIndex);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScrollGeometry);
            window.removeEventListener('scroll', handleScrollIdle);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchCancel);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (snapTimer) clearTimeout(snapTimer);
            if (geometryUpdateTimer) clearTimeout(geometryUpdateTimer);
            if (wheelTimer) clearTimeout(wheelTimer);
            if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
            if (scrollSettleRafId) cancelAnimationFrame(scrollSettleRafId);
            if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
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


    // ─── LOADING STATE ─────────────────────────────────────────────
    if (!imagesLoaded && !showFallback) {
        return (
            <section
                className="relative bg-gray-950 flex items-center justify-center"
                style={{ height: SCROLL_HEIGHT }}
            >
                <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center gap-6">
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

    // ─── FALLBACK ──────────────────────────────────────────────────
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

    // ─── OVERLAY VISIBILITY ────────────────────────────────────────
    // progress is derived from frameIndex for smooth animation coupling
    const progress = frameIndex / FRAME_COUNT;

    // Opacity helper: ramps up from `start` to `peak`, holds at 1.0 at `peak`,
    // then ramps down from `peak` to `end`. Guarantees 100% at the checkpoint.
    const getOverlayOpacity = (start, peak, end, current) => {
        if (current < start || current > end) return 0;
        if (current <= peak) {
            if (peak === start) return 1;
            return Math.min(1, (current - start) / (peak - start));
        }
        if (end === peak) return 0;
        return Math.max(0, 1 - (current - peak) / (end - peak));
    };

    const currentPercent = progress * 100;

    return (
        <section
            ref={containerRef}
            className="relative bg-gray-950"
            style={{ height: SCROLL_HEIGHT }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
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

                {/* ── Overlay 0: "Get Me a Chai" ── CP 0.00 ──
                     100% at 0–5%, fades out completely by 12% */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 z-20"
                    style={{
                        opacity: progress <= 0.05
                            ? 1
                            : progress <= 0.12
                                ? Math.max(0, 1 - ((progress - 0.05) / 0.07))
                                : 0,
                        transform: `scale(${1 + progress * 0.5}) translateY(${progress * -50}px)`,
                        transition: 'opacity 0.1s ease-out',
                        willChange: 'opacity, transform'
                    }}
                >
                    <h1 className="text-7xl md:text-9xl font-black text-center mb-6 tracking-tight drop-shadow-2xl">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            Get Me a Chai
                        </span>
                    </h1>
                    <p className="text-2xl md:text-4xl font-normal text-white tracking-widest uppercase border-y border-white/20 py-4 backdrop-blur-md bg-black/40 px-8 rounded-full shadow-2xl drop-shadow-lg">
                        Fund Dreams. Build Community.
                    </p>
                </div>

                {/* ── Overlay 1: "Your bank account…" ── CP 0.20 ──
                     Fades in 12→20%, 100% AT 20%, fades out 20→32% */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 z-10"
                    style={{
                        opacity: getOverlayOpacity(0.12, 0.20, 0.32, progress),
                        transform: `scale(${1 + progress * 0.2})`,
                        transition: 'opacity 0.15s ease-out'
                    }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        Your bank account said no.<br />
                        But your dreams said chai.
                    </h2>
                </div>

                {/* ── Overlay 2: "We're not asking…" ── CP 0.40 ──
                     Fades in 30→40%, 100% AT 40%, fades out 40→52% */}
                <div
                    className="absolute inset-0 flex items-center justify-start px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: getOverlayOpacity(0.30, 0.40, 0.52, progress),
                        transform: `translateX(${currentPercent < 32 ? -50 : (currentPercent > 50 ? -50 : 0)}px)`,
                        transition: 'all 0.4s ease-out'
                    }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-left max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        We're not asking for investments.<br />
                        We're asking for vibes. <Sparkles className="w-8 h-8 text-purple-400 inline-block" />
                    </h2>
                </div>

                {/* ── Overlay 3: "₹5Cr+ raised…" ── CP 0.60 ──
                     Fades in 50→60%, 100% AT 60%, fades out 60→72% */}
                <div
                    className="absolute inset-0 flex items-center justify-end px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: getOverlayOpacity(0.50, 0.60, 0.72, progress),
                        transform: `translateX(${currentPercent < 52 ? 50 : (currentPercent > 70 ? 50 : 0)}px)`,
                        transition: 'all 0.4s ease-out'
                    }}
                >
                    <div className="text-right max-w-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                            ₹5Cr+ raised by people who believed in
                        </h2>
                        <p className="text-2xl md:text-4xl text-white italic">
                            "delulu is the solulu" 💭
                        </p>
                    </div>
                </div>

                {/* ── Overlay 4: CTA ── CP 1.00 ──
                     Fades in 75→90%, 100% AT 90%+ */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-auto z-20"
                    style={{
                        opacity: currentPercent >= 75 ? Math.min(1, (progress - 0.75) / 0.15) : 0,
                        transform: `translateY(${currentPercent < 75 ? 20 : 0}px)`,
                        transition: 'all 0.4s ease-out',
                        pointerEvents: currentPercent >= 80 ? 'auto' : 'none'
                    }}
                >
                    <p className="text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
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