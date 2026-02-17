import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getMilestonesPrompt } from '@/lib/ai/prompts';
import { createLogger } from '@/lib/logger';
import { validateNumber, validateString, ValidationError } from '@/lib/validation';

const logger = createLogger('API:GenerateMilestones');

export async function POST(req) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        logger.info('Milestones generation request received', {
            hasGoal: !!body.goal,
            hasCategory: !!body.category,
            hasDuration: !!body.duration
        });

        // Input validation
        let validatedData;
        try {
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
                duration: body.duration ? validateNumber(body.duration, {
                    fieldName: 'Duration',
                    min: 7,
                    max: 365,
                    integer: true
                }) : 30 // Default to 30 days
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

        logger.info('Generating milestones with AI', validatedData);

        // Generate prompt
        const prompt = getMilestonesPrompt(validatedData);

        // Call AI
        const response = await generateDeepSeek(prompt, {
            temperature: 0.7,
            maxTokens: 1500,
        });

        logger.debug('AI response received', {
            responseLength: response?.length || 0
        });

        // Extract JSON array from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            logger.error('Invalid AI response format', {
                response: response?.substring(0, 200)
            });

            // Return fallback milestones
            const fallbackMilestones = generateFallbackMilestones(validatedData.goal);
            logger.info('Using fallback milestones');
            return NextResponse.json({ milestones: fallbackMilestones });
        }

        // Parse milestones
        let milestones;
        try {
            milestones = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            logger.error('Failed to parse AI response', {
                error: parseError.message,
                jsonString: jsonMatch[0]?.substring(0, 200)
            });

            // Return fallback milestones
            const fallbackMilestones = generateFallbackMilestones(validatedData.goal);
            return NextResponse.json({ milestones: fallbackMilestones });
        }

        const duration = Date.now() - startTime;
        logger.info('Milestones generated successfully', {
            count: milestones.length,
            duration
        });

        return NextResponse.json({ milestones });

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Milestones generation failed', {
            error: error.message,
            stack: error.stack,
            duration
        });

        // Return fallback milestones instead of error
        try {
            const body = await req.json();
            if (body.goal) {
                const fallbackMilestones = generateFallbackMilestones(body.goal);
                logger.info('Returning fallback milestones due to error');
                return NextResponse.json({ milestones: fallbackMilestones });
            }
        } catch (fallbackError) {
            // Ignore fallback error
        }

        return NextResponse.json(
            { error: 'Failed to generate milestones. Please try again or add them manually.' },
            { status: 500 }
        );
    }
}

/**
 * Generate fallback milestones when AI fails
 */
function generateFallbackMilestones(goal) {
    return [
        {
            percentage: 25,
            amount: goal * 0.25,
            title: 'Initial Milestone',
            description: 'First quarter of funding goal reached',
            deliverable: 'Project kickoff and initial setup'
        },
        {
            percentage: 50,
            amount: goal * 0.5,
            title: 'Halfway There',
            description: 'Reached 50% of funding goal',
            deliverable: 'Core development and progress updates'
        },
        {
            percentage: 75,
            amount: goal * 0.75,
            title: 'Almost There',
            description: 'Three-quarters of funding goal achieved',
            deliverable: 'Advanced features and testing'
        },
        {
            percentage: 100,
            amount: goal,
            title: 'Goal Achieved',
            description: 'Full funding goal reached',
            deliverable: 'Complete project delivery and fulfillment'
        }
    ];
}
