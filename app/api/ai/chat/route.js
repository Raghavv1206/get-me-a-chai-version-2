// app/api/ai/chat/route.js
import { NextResponse } from 'next/server';
import { generateWithHistory } from '@/lib/ai/openrouter';
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { messages, userContext } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            );
        }

        // Add user context to system prompt if available
        let systemPrompt = CHATBOT_SYSTEM_PROMPT;
        if (userContext) {
            systemPrompt += `\n\nUser Context:\n- Role: ${userContext.role || 'supporter'}\n- Has campaigns: ${userContext.hasCampaigns ? 'Yes' : 'No'}`;
        }

        const response = await generateWithHistory(messages, {
            temperature: 0.7,
            maxTokens: 500,
            systemPrompt,
        });

        return NextResponse.json({ message: response });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
