// components/chatbot/ChatWindow.js
"use client"
import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestedActions from './SuggestedActions';
import { ChatHistory } from './ChatHistory';

export default function ChatWindow({ onClose, onMinimize, userContext }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        const savedMessages = ChatHistory.load();
        if (savedMessages && savedMessages.length > 0) {
            setMessages(savedMessages);
        } else {
            setMessages([{
                role: 'assistant',
                content: `Hi ${userContext.name}! 👋 I'm your AI assistant. How can I help you today?`,
                timestamp: new Date(),
            }]);
        }
    }, [userContext.name]);

    // Save messages whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            ChatHistory.save(messages);
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (message) => {
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            // Prepare conversation history
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            conversationHistory.push({ role: 'user', content: message });

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: conversationHistory,
                    userContext,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: data.message,
                        timestamp: new Date(),
                    },
                ]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I'm sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestedAction = (action) => {
        handleSend(action);
    };

    const handleClearHistory = () => {
        if (confirm('Clear chat history?')) {
            const welcomeMessage = {
                role: 'assistant',
                content: `Hi ${userContext.name}! 👋 I'm your AI assistant. How can I help you today?`,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
            ChatHistory.clear();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs opacity-80">Always here to help</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleClearHistory}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Clear history"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        onClick={onMinimize}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Minimize"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">AI is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Actions */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <SuggestedActions onAction={handleSuggestedAction} />
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
                <ChatInput onSend={handleSend} disabled={loading} />
            </div>
        </div>
    );
}
