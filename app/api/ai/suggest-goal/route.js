import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getGoalSuggestionPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { category, projectType, brief } = await req.json();

        if (!category || !brief) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = getGoalSuggestionPrompt({
            category,
            projectType: projectType || 'General',
            brief,
        });

        const response = await generateDeepSeek(prompt, {
            temperature: 0.5, // Lower temperature for more consistent numerical outputs
            maxTokens: 1000,
        });

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Goal suggestion error:', error);
        return NextResponse.json(
            { error: 'Failed to suggest goal' },
            { status: 500 }
        );
    }
}
