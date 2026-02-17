import { NextResponse } from 'next/server';
import { streamDeepSeek } from '@/lib/ai/openrouter';
import { getCampaignStoryPrompt } from '@/lib/ai/prompts';

export async function POST(req) {
    try {
        console.log('=== AI Campaign Generation Request Started ===');

        const { category, brief, goal, projectType } = await req.json();

        console.log('Request data:', { category, brief: brief?.substring(0, 50), goal, projectType });

        // Validation
        if (!category || !brief || !goal) {
            console.error('Validation failed - missing fields:', {
                hasCategory: !!category,
                hasBrief: !!brief,
                hasGoal: !!goal
            });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check API key
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY is not configured');
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        console.log('Generating prompt...');
        const prompt = getCampaignStoryPrompt({
            category,
            brief,
            goal,
            projectType: projectType || 'General',
        });

        console.log('Prompt generated, starting stream...');

        // Create a ReadableStream for streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    console.log('Stream started');
                    let chunkCount = 0;
                    for await (const chunk of streamDeepSeek(prompt, {
                        temperature: 0.8,
                        maxTokens: 2500,
                    })) {
                        chunkCount++;
                        controller.enqueue(encoder.encode(chunk));
                    }
                    console.log(`Stream completed successfully. Total chunks: ${chunkCount}`);
                    controller.close();
                } catch (error) {
                    console.error('Stream error:', error);
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
        console.error('=== Campaign generation error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Failed to generate campaign',
                details: error.message,
                type: error.name
            },
            { status: 500 }
        );
    }
}
