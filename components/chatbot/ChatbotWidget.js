// components/chatbot/ChatbotWidget.js
"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ChatWindow from './ChatWindow';

export default function ChatbotWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [position, setPosition] = useState({ bottom: 20, right: 20 });

    // Don't show chatbot if not logged in
    if (!session) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed z-50 transition-all duration-300"
                    style={{
                        bottom: `${position.bottom}px`,
                        right: `${position.right}px`,
                        width: '380px',
                        maxWidth: 'calc(100vw - 40px)',
                        height: 'min(600px, calc(100vh - 100px))',
                        maxHeight: 'calc(100vh - 100px)',
                    }}
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

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed z-50 group"
                    style={{
                        bottom: `${position.bottom}px`,
                        right: `${position.right}px`,
                    }}
                >
                    <div className="relative">
                        {/* Main Button */}
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                            <span className="text-3xl">💬</span>
                        </div>

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                {unreadCount}
                            </div>
                        )}

                        {/* Pulse Animation */}
                        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-0 group-hover:opacity-20 group-hover:scale-125 transition-all duration-300" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Need help? Chat with AI
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                </button>
            )}
        </>
    );
}
