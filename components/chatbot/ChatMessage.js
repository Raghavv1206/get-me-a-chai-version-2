// components/chatbot/ChatMessage.js
"use client"
import { formatDistanceToNow } from 'date-fns';

// Simple markdown parser
function parseMarkdown(text) {
  if (!text) return '';

  let html = text;

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code: `code`
  html = html.replace(/`(.+?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>');

  // Links: [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  // Parse markdown for AI messages
  const formattedContent = isUser ? message.content : parseMarkdown(message.content);

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
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div
                className="text-sm break-words prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            )}
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
                :global(.prose strong) {
                    color: #fff;
                    font-weight: 700;
                }
                :global(.prose em) {
                    color: #e5e7eb;
                    font-style: italic;
                }
                :global(.prose code) {
                    background-color: #374151;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                :global(.prose a) {
                    color: #60a5fa;
                    text-decoration: none;
                }
                :global(.prose a:hover) {
                    text-decoration: underline;
                }
            `}</style>
    </div>
  );
}
