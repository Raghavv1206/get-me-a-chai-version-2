import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getMilestonesPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { goal, category, duration } = await req.json();

        if (!goal || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = getMilestonesPrompt({
            goal,
            category,
            duration: duration || 30,
        });

        const response = await generateDeepSeek(prompt, {
            temperature: 0.7,
            maxTokens: 1500,
        });

        // Extract JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const milestones = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ milestones });
    } catch (error) {
        console.error('Milestones generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate milestones' },
            { status: 500 }
        );
    }
}
