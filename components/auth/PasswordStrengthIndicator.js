// components/auth/PasswordStrengthIndicator.js
"use client"
import { useMemo } from 'react';

export default function PasswordStrengthIndicator({ password }) {
    const strength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        // Calculate score
        if (checks.length) score += 20;
        if (checks.lowercase) score += 20;
        if (checks.uppercase) score += 20;
        if (checks.number) score += 20;
        if (checks.special) score += 20;

        // Determine label and color
        let label, color, bgColor;
        if (score < 40) {
            label = 'Weak';
            color = 'text-red-400';
            bgColor = 'bg-red-500';
        } else if (score < 80) {
            label = 'Medium';
            color = 'text-yellow-400';
            bgColor = 'bg-yellow-500';
        } else {
            label = 'Strong';
            color = 'text-green-400';
            bgColor = 'bg-green-500';
        }

        return { score, label, color, bgColor, checks };
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-3 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${strength.bgColor} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                    />
                </div>
                <span className={`text-sm font-semibold ${strength.color}`}>
                    {strength.label}
                </span>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1">
                <RequirementItem met={strength.checks.length} text="At least 8 characters" />
                <RequirementItem met={strength.checks.lowercase} text="One lowercase letter" />
                <RequirementItem met={strength.checks.uppercase} text="One uppercase letter" />
                <RequirementItem met={strength.checks.number} text="One number" />
                <RequirementItem met={strength.checks.special} text="One special character" />
            </div>
        </div>
    );
}

function RequirementItem({ met, text }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                {met ? '✓' : '○'}
            </div>
            <span className={met ? 'text-gray-300' : 'text-gray-500'}>
                {text}
            </span>
        </div>
    );
}
