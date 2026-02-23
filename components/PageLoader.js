// components/PageLoader.js - Premium Page Loading Component
"use client"

export default function PageLoader({ message = "Loading..." }) {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] relative">
            {/* Ambient glow effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 rounded-full border-2 border-white/5" />
                    {/* Spinning gradient arc */}
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 border-r-blue-500 animate-spin" />
                    {/* Inner ring */}
                    <div className="absolute inset-2 w-12 h-12 rounded-full border border-white/5" />
                    {/* Inner spinning arc (slower, opposite) */}
                    <div
                        className="absolute inset-2 w-12 h-12 rounded-full border border-transparent border-b-purple-400/60 animate-spin"
                        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                    />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium tracking-wide">{message}</p>
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
