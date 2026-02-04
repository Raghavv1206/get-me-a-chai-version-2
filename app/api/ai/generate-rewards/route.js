import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getRewardTiersPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { goal, category, brief } = await req.json();

        if (!goal || !category || !brief) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = getRewardTiersPrompt({ goal, category, brief });

        const response = await generateDeepSeek(prompt, {
            temperature: 0.8,
            maxTokens: 1500,
        });

        // Extract JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const rewards = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ rewards });
    } catch (error) {
        console.error('Rewards generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate rewards' },
            { status: 500 }
        );
    }
}
