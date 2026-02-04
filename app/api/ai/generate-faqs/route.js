import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getFAQsPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { category, story, goal } = await req.json();

        if (!category || !story) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = getFAQsPrompt({ category, story, goal });

        const response = await generateDeepSeek(prompt, {
            temperature: 0.7,
            maxTokens: 2000,
        });

        // Extract JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const faqs = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ faqs });
    } catch (error) {
        console.error('FAQs generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate FAQs' },
            { status: 500 }
        );
    }
}
