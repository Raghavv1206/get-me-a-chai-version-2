import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getRewardTiersPrompt } from '@/lib/ai/prompts';
import { createLogger } from '@/lib/logger';
import { validateNumber, validateString, ValidationError } from '@/lib/validation';

const logger = createLogger('API:GenerateRewards');

export async function POST(req) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        logger.info('Rewards generation request received', {
            hasGoal: !!body.goal,
            hasCategory: !!body.category,
            hasBrief: !!body.brief
        });

        // Input validation
        let validatedData;
        try {
            // Brief is optional - use story or title as fallback
            const briefText = body.brief || body.story || body.title || '';

            validatedData = {
                goal: validateNumber(body.goal, {
                    fieldName: 'Goal',
                    min: 1000,
                    max: 10000000,
                    integer: true
                }),
                category: validateString(body.category, {
                    fieldName: 'Category',
                    minLength: 2,
                    maxLength: 50
                }),
                brief: briefText.length > 0 ? validateString(briefText, {
                    fieldName: 'Brief',
                    minLength: 1,
                    maxLength: 1000,
                    allowEmpty: false
                }) : `A ${body.category} campaign with a goal of ₹${body.goal}`
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation failed', {
                    field: error.field,
                    message: error.message
                });
                return NextResponse.json(
                    { error: error.message, field: error.field },
                    { status: 400 }
                );
            }
            throw error;
        }

        logger.info('Generating rewards with AI', validatedData);

        const prompt = getRewardTiersPrompt(validatedData);

        const response = await generateDeepSeek(prompt, {
            temperature: 0.8,
            maxTokens: 1500,
        });

        logger.debug('AI response received', {
            responseLength: response?.length || 0
        });

        // Extract JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            logger.error('Invalid AI response format', {
                response: response?.substring(0, 200)
            });

            const fallbackRewards = generateFallbackRewards(validatedData.goal);
            logger.info('Using fallback rewards');
            return NextResponse.json({ rewards: fallbackRewards });
        }

        let rewards;
        try {
            rewards = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            logger.error('Failed to parse AI response', {
                error: parseError.message
            });

            const fallbackRewards = generateFallbackRewards(validatedData.goal);
            return NextResponse.json({ rewards: fallbackRewards });
        }

        const duration = Date.now() - startTime;
        logger.info('Rewards generated successfully', {
            count: rewards.length,
            duration
        });

        return NextResponse.json({ rewards });

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Rewards generation failed', {
            error: error.message,
            stack: error.stack,
            duration
        });

        try {
            const body = await req.json();
            if (body.goal) {
                const fallbackRewards = generateFallbackRewards(body.goal);
                logger.info('Returning fallback rewards due to error');
                return NextResponse.json({ rewards: fallbackRewards });
            }
        } catch (fallbackError) {
            // Ignore
        }

        return NextResponse.json(
            { error: 'Failed to generate rewards. Please try again or add them manually.' },
            { status: 500 }
        );
    }
}

function generateFallbackRewards(goal) {
    return [
        {
            amount: 100,
            title: 'Early Bird Supporter',
            description: 'Get a special thank you message and your name listed as an early supporter',
            deliveryTime: 'Immediately after campaign ends',
            limited: false,
            quantity: null
        },
        {
            amount: 500,
            title: 'Bronze Supporter',
            description: 'Everything from previous tier plus exclusive project updates',
            deliveryTime: '1 month after campaign ends',
            limited: false,
            quantity: null
        },
        {
            amount: 1000,
            title: 'Silver Supporter',
            description: 'Everything from previous tiers plus special recognition in project materials',
            deliveryTime: '2 months after campaign ends',
            limited: false,
            quantity: null
        },
        {
            amount: 2500,
            title: 'Gold Supporter',
            description: 'Everything from previous tiers plus exclusive merchandise and early access',
            deliveryTime: '3 months after campaign ends',
            limited: true,
            quantity: 50
        },
        {
            amount: 5000,
            title: 'Platinum Supporter',
            description: 'Everything from previous tiers plus personal consultation and VIP access',
            deliveryTime: '3 months after campaign ends',
            limited: true,
            quantity: 10
        }
    ];
}
