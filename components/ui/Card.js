// components/ui/Card.js
"use client"

/**
 * Modern Card Component
 * 
 * Provides consistent card styling with glassmorphism effect
 * Matches the dashboard design aesthetic
 */

export default function Card({
    children,
    className = '',
    hover = false,
    gradient = false,
    padding = 'default' // 'none', 'sm', 'default', 'lg'
}) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            className={`
        bg-gray-900/50 backdrop-blur-sm 
        border border-white/10 
        rounded-2xl 
        shadow-xl
        ${gradient ? 'bg-gradient-to-br from-gray-900/50 to-gray-800/50' : ''}
        ${hover ? 'hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

// Card Header Component
export function CardHeader({ children, className = '' }) {
    return (
        <div className={`border-b border-white/10 pb-4 mb-4 ${className}`}>
            {children}
        </div>
    );
}

// Card Title Component
export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-xl font-bold text-white ${className}`}>
            {children}
        </h3>
    );
}

// Card Description Component
export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-400 mt-1 ${className}`}>
            {children}
        </p>
    );
}

// Card Content Component
export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

// Card Footer Component
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`border-t border-white/10 pt-4 mt-4 ${className}`}>
            {children}
        </div>
    );
}
