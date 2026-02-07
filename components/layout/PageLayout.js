// components/layout/PageLayout.js
"use client"

/**
 * Modern Page Layout Component
 * 
 * Provides consistent dark theme styling across all pages
 * Features:
 * - Dark background with gradient
 * - Ambient blur effects
 * - Responsive padding
 * - Optional header section
 */

export default function PageLayout({
    children,
    title,
    description,
    className = '',
    showAmbientEffects = true
}) {
    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Main Content */}
            <main className={`pt-20 px-4 md:px-8 pb-8 min-h-screen relative ${className}`}>
                {/* Background Ambient Effects */}
                {showAmbientEffects && (
                    <>
                        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                        <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                    </>
                )}

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    {(title || description) && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                {title && (
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-gray-400 mt-1">{description}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Page Content */}
                    {children}
                </div>
            </main>
        </div>
    );
}
