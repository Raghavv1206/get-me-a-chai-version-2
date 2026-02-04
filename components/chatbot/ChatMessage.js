// components/chatbot/ChatMessage.js
"use client"
import { formatDistanceToNow } from 'date-fns';

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';
    const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                    <span className="text-sm">{isUser ? '👤' : '🤖'}</span>
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-1">
                    <div className={`px-4 py-2 rounded-2xl ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-800 text-gray-100 rounded-tl-none'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <span className={`text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
                        {timeAgo}
                    </span>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
