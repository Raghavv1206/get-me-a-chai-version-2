import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getQualityScoringPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const campaign = await req.json();

        if (!campaign.title || !campaign.category) {
            return NextResponse.json(
                { error: 'Missing required campaign data' },
                { status: 400 }
            );
        }

        const prompt = getQualityScoringPrompt(campaign);

        const response = await generateDeepSeek(prompt, {
            temperature: 0.3, // Low temperature for consistent scoring
            maxTokens: 1500,
        });

        // Extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const scoreData = JSON.parse(jsonMatch[0]);

        return NextResponse.json(scoreData);
    } catch (error) {
        console.error('Campaign scoring error:', error);
        return NextResponse.json(
            { error: 'Failed to score campaign' },
            { status: 500 }
        );
    }
}
