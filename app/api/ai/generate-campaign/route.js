import { NextResponse } from 'next/server';
import { streamDeepSeek } from '@/lib/ai/openrouter';
import { getCampaignStoryPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        const { category, brief, goal, projectType } = await req.json();

        // Validation
        if (!category || !brief || !goal) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = getCampaignStoryPrompt({
            category,
            brief,
            goal,
            projectType: projectType || 'General',
        });

        // Create a ReadableStream for streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamDeepSeek(prompt, {
                        temperature: 0.8,
                        maxTokens: 2500,
                    })) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Campaign generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate campaign' },
            { status: 500 }
        );
    }
}
