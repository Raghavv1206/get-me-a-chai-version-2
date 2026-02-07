"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

        let isAnimating = false; // Lock to prevent rapid-fire triggers
        const checkpoints = [0.00, 0.10, 0.35, 0.60, 1.00];

        const getScrollProgress = () => {
            if (!containerRef.current) return 0;
            const container = containerRef.current;
            const { top, height } = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollableDistance = height - windowHeight;
            const scrolled = -top;
            return Math.max(0, Math.min(1, scrolled / scrollableDistance));
        };

        const handleScroll = () => {
            if (!containerRef.current) return;

            // This function now primarily handles FRAME RENDERING only.
            // The "Movement" is handled by handleWheel/Lenis.
            // But we still need to update frames based on where Lenis takes us.

            const progress = getScrollProgress();

            // Nonlinear mapping (Same as before)
            const getFrameProgress = (p) => {
                const points = [
                    { s: 0.00, f: 0.00 },
                    { s: 0.10, f: 0.10 },
                    { s: 0.35, f: 0.35 },
                    { s: 0.60, f: 0.60 },
                    { s: 1.00, f: 1.00 }
                ];
                // Linear interpolation between points
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    if (p >= p1.s && p <= p2.s) {
                        const rS = p2.s - p1.s;
                        const rF = p2.f - p1.f;
                        return p1.f + ((p - p1.s) / rS) * rF;
                    }
                }
                return p;
            };

            const animationProgress = getFrameProgress(progress);
            const targetIndex = Math.min(FRAME_COUNT - 1, Math.floor(animationProgress * FRAME_COUNT));

            if (targetIndex !== frameIndex) {
                setFrameIndex(targetIndex);
                requestRef.current = requestAnimationFrame(() => renderFrame(targetIndex));
            }
        };

        const handleWheel = (e) => {
            // Only intervene if we are WITHN the scrolly section
            // or entering it from top.
            // Actually, we are globally listening, so we MUST check bounds.
            if (!containerRef.current) return;
            const container = containerRef.current;
            const { top, bottom } = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Check if section is in view (partially or fully)
            // Or rather, is it the active interaction zone?
            const inView = top <= 0 && bottom >= windowHeight;

            // If not in the active sticky zone, let default scroll happen
            // (Unless we are just entering? Complexity high. 
            // Simplified: If Top > 0 (above viewport), default.
            // If Bottom < WindowHeight (scrolled past), default.
            if (top > 1 || bottom < windowHeight - 1) return;

            // We are IN the zone. Intercept.
            e.preventDefault();

            if (isAnimating) return; // Ignore while moving

            const currentProgress = getScrollProgress();

            // Determine Direction
            // Using e.deltaY. 
            const direction = Math.sign(e.deltaY);

            if (direction === 0) return;

            // Find current nearest checkpoint index
            // We use a small threshold to snap to "current"
            let currentIndex = 0;
            let minDiff = 100;
            checkpoints.forEach((cp, i) => {
                const diff = Math.abs(cp - currentProgress);
                if (diff < minDiff) {
                    minDiff = diff;
                    currentIndex = i;
                }
            });

            let targetIndex = currentIndex;

            if (direction > 0) {
                // Scroll Down -> Next Checkpoint
                if (currentProgress >= 0.99) {
                    // At end, allow escape downwards?
                    // We prevented default above. So we must manually scroll window?
                    // Or, we explicitly allow default if at boundary.
                    // IMPORTANT: To allow escape, we effectively need to NOT preventDefault.
                    // But we already did.
                    // Solution: Use Lenis to scroll out.
                    window.lenis?.scrollTo(window.scrollY + windowHeight / 2);
                    return;
                }
                // If we are "at" the current checkpoint (close enough), advance.
                // If we are "between" (rare with this logic), advance to next.
                // Actually, simply: Find first checkpoint GREATER than current + epsilon
                const nextCP = checkpoints.find(cp => cp > currentProgress + 0.01);
                if (nextCP !== undefined) {
                    targetIndex = checkpoints.indexOf(nextCP);
                } else {
                    targetIndex = checkpoints.length - 1;
                }
            } else {
                // Scroll Up -> Prev Checkpoint
                if (currentProgress <= 0.01) {
                    // At start, allow escape upwards
                    window.lenis?.scrollTo(window.scrollY - windowHeight / 2);
                    return;
                }
                // Find first checkpoint LESS than current - epsilon
                // reverse slice to find last one smaller
                const reversed = [...checkpoints].reverse();
                const prevCP = reversed.find(cp => cp < currentProgress - 0.01);
                if (prevCP !== undefined) {
                    targetIndex = checkpoints.indexOf(prevCP);
                } else {
                    targetIndex = 0;
                }
            }

            // Execute Move
            const targetProgress = checkpoints[targetIndex];
            const scrollableDistance = container.getBoundingClientRect().height - windowHeight;

            // Calculate absolute target position
            // We need absolute document Y.
            // Current ScrollY + (targetProgress * dist) - (currentProgress * dist) ? 
            // Simpler: container Top position relative to document + target offset.
            // container.getBoundingClientRect().top is relative to viewport.
            // Absolute Container Top = window.scrollY + container.getBoundingClientRect().top
            const containerTopAbsolute = window.scrollY + top;
            const targetPx = containerTopAbsolute + (targetProgress * scrollableDistance);

            if (window.lenis) {
                isAnimating = true;
                window.lenis.scrollTo(targetPx, {
                    duration: 1.2,
                    easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // Exponential ease out
                    lock: true, // Lock user input during scroll
                    onComplete: () => {
                        isAnimating = false;
                    }
                });
            } else {
                // Fallback (native behavior not supported for hijacked scroll well without Lenis)
                window.scrollTo({ top: targetPx, behavior: "smooth" });
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", () => renderFrame(frameIndex));
        // Active listener to intercept wheel
        window.addEventListener("wheel", handleWheel, { passive: false });

        // Initial render
        renderFrame(frameIndex);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", () => renderFrame(frameIndex));
            window.removeEventListener("wheel", handleWheel);
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
                // Set canvas internal resolution to match display size for sharpness
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                renderFrame(frameIndex);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [frameIndex, renderFrame]);


    // 5. Preloader Component
    if (!imagesLoaded && !showFallback) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
                <div className="text-6xl mb-8 animate-bounce">☕</div>
                <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                    />
                </div>
                <p className="text-gray-400 font-medium">
                    Brewing your experience... {loadingProgress}%
                </p>
            </div>
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

    // Calculate opacity/transform for text overlays based on progress
    // progress is derived from frameIndex for simplicity: frameIndex / FRAME_COUNT
    const progress = frameIndex / FRAME_COUNT;

    // Helper for opacity/transforms
    const getOpacity = (start, end, current) => {
        if (current < start || current > end) return 0;
        // Fade in first half, fade out second half
        const mid = (start + end) / 2;
        if (current <= mid) return (current - start) / (mid - start);
        return 1 - (current - mid) / (end - mid);
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

                {/* Cinematic Scrim - Improves text contrast */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

                {/* Overlay 0: Initial Hero Text (0-10%) */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 z-20"
                    style={{
                        opacity: progress < 0.1 ? 1 - (progress * 10) : 0,
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

                {/* Overlay 1: 0-15% - Center Fade */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 z-10"
                    style={{
                        opacity: currentPercent <= 20 ? getOpacity(0, 0.20, progress) : 0,
                        transform: `scale(${1 + progress * 0.2})`,
                        transition: 'opacity 0.3s ease-out'
                    }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        Your bank account said no.<br />
                        But your dreams said chai.
                    </h2>
                </div>

                {/* Overlay 2: 25-40% - Left Slide */}
                <div
                    className="absolute inset-0 flex items-center justify-start px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: (currentPercent >= 20 && currentPercent <= 45) ? getOpacity(0.20, 0.45, progress) : 0,
                        transform: `translateX(${currentPercent < 25 ? -50 : (currentPercent > 40 ? -50 : 0)}px)`,
                        transition: 'all 0.5s ease-out'
                    }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-left max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        We're not asking for investments.<br />
                        We're asking for vibes. ✨
                    </h2>
                </div>

                {/* Overlay 3: 50-65% - Right Slide */}
                <div
                    className="absolute inset-0 flex items-center justify-end px-6 md:px-20 pointer-events-none z-10"
                    style={{
                        opacity: (currentPercent >= 45 && currentPercent <= 70) ? getOpacity(0.45, 0.70, progress) : 0,
                        transform: `translateX(${currentPercent < 50 ? 50 : (currentPercent > 65 ? 50 : 0)}px)`,
                        transition: 'all 0.5s ease-out'
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

                {/* Overlay 4: 80-100% - Center with CTA */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-auto z-20"
                    style={{
                        opacity: currentPercent >= 75 ? Math.min(1, (progress - 0.75) * 4) : 0,
                        transform: `translateY(${currentPercent < 75 ? 20 : 0}px)`,
                        transition: 'all 0.5s ease-out',
                        pointerEvents: currentPercent >= 75 ? 'auto' : 'none'
                    }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                        Turn your 3 AM ideas<br />into reality.
                    </h1>
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
