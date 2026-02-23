// components/chatbot/SuggestedActions.js
"use client"

import { Rocket, Wallet, HelpCircle, BarChart3 } from 'lucide-react';

const SUGGESTED_ACTIONS = [
    { icon: <Rocket className="w-5 h-5 text-blue-400" />, label: 'Create a campaign', message: 'How do I create a new campaign?' },
    { icon: <Wallet className="w-5 h-5 text-green-400" />, label: 'Payment help', message: 'I need help with payments' },
    { icon: <HelpCircle className="w-5 h-5 text-yellow-400" />, label: 'How it works', message: 'How does this platform work?' },
    { icon: <BarChart3 className="w-5 h-5 text-purple-400" />, label: 'View analytics', message: 'How can I see my campaign analytics?' },
];

export default function SuggestedActions({ onAction }) {
    return (
        <div>
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_ACTIONS.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => onAction(action.message)}
                        className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors text-left text-sm text-gray-300"
                    >
                        <span>{action.icon}</span>
                        <span className="text-xs">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
