// components/chatbot/ChatbotWidget.js
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ChatWindow from './ChatWindow';
import { MessageCircle } from 'lucide-react';

export default function ChatbotWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size for responsive behavior
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close chat on Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Don't show chatbot if not logged in
    if (!session) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed z-50 transition-all duration-300 ${isMobile
                            ? 'inset-0'
                            : 'bottom-5 right-5'
                        }`}
                    style={
                        !isMobile
                            ? {
                                width: '380px',
                                maxWidth: 'calc(100vw - 40px)',
                                height: 'min(600px, calc(100vh - 100px))',
                                maxHeight: 'calc(100vh - 100px)',
                            }
                            : undefined
                    }
                >
                    <ChatWindow
                        onClose={() => setIsOpen(false)}
                        onMinimize={() => setIsOpen(false)}
                        userContext={{
                            role: session.user.role,
                            name: session.user.name,
                        }}
                    />
                </div>
            )}

            {/* Floating Button - smaller on mobile, doesn't take layout space */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed z-50 group bottom-3 right-3 sm:bottom-5 sm:right-5"
                    aria-label="Open AI chat assistant"
                    type="button"
                >
                    <div className="relative">
                        {/* Main Button - 44px on mobile, 56px on sm, 64px on md+ */}
                        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                        </div>

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}

                        {/* Pulse Animation */}
                        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-0 group-hover:opacity-20 group-hover:scale-125 transition-all duration-300 pointer-events-none" />
                    </div>

                    {/* Tooltip - hidden on mobile/touch devices */}
                    <div className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Need help? Chat with AI
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                </button>
            )}
        </>
    );
}
