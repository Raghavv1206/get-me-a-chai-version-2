import { NextResponse } from 'next/server';
import { generateDeepSeek } from '@/lib/ai/openrouter';
import { getFAQsPrompt } from '@/lib/ai/prompts';
import { createLogger } from '@/lib/logger';
import { validateNumber, validateString, ValidationError } from '@/lib/validation';

const logger = createLogger('API:GenerateFAQs');

export async function POST(req) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        logger.info('FAQs generation request received', {
            hasCategory: !!body.category,
            hasStory: !!body.story,
            hasGoal: !!body.goal
        });

        // Input validation
        let validatedData;
        try {
            // Story is optional - use title or brief as fallback
            const storyText = body.story || body.brief || body.title || '';

            validatedData = {
                category: validateString(body.category, {
                    fieldName: 'Category',
                    minLength: 2,
                    maxLength: 50
                }),
                story: storyText.length > 0
                    ? validateString(storyText, {
                        fieldName: 'Story',
                        minLength: 1,  // Changed from 50
                        maxLength: 10000,
                        allowEmpty: false
                    })
                    : `A ${body.category} crowdfunding campaign`,  // Fallback
                goal: body.goal ? validateNumber(body.goal, {
                    fieldName: 'Goal',
                    min: 1000,
                    max: 10000000
                }) : 0
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

        logger.info('Generating FAQs with AI');

        const prompt = getFAQsPrompt(validatedData);

        const response = await generateDeepSeek(prompt, {
            temperature: 0.7,
            maxTokens: 2000,
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

            const fallbackFAQs = generateFallbackFAQs(validatedData.category);
            logger.info('Using fallback FAQs');
            return NextResponse.json({ faqs: fallbackFAQs });
        }

        let faqs;
        try {
            faqs = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            logger.error('Failed to parse AI response', {
                error: parseError.message
            });

            const fallbackFAQs = generateFallbackFAQs(validatedData.category);
            return NextResponse.json({ faqs: fallbackFAQs });
        }

        const duration = Date.now() - startTime;
        logger.info('FAQs generated successfully', {
            count: faqs.length,
            duration
        });

        return NextResponse.json({ faqs });

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('FAQs generation failed', {
            error: error.message,
            stack: error.stack,
            duration
        });

        try {
            const body = await req.json();
            if (body.category) {
                const fallbackFAQs = generateFallbackFAQs(body.category);
                logger.info('Returning fallback FAQs due to error');
                return NextResponse.json({ faqs: fallbackFAQs });
            }
        } catch (fallbackError) {
            // Ignore
        }

        return NextResponse.json(
            { error: 'Failed to generate FAQs. Please try again or add them manually.' },
            { status: 500 }
        );
    }
}

function generateFallbackFAQs(category) {
    return [
        {
            question: 'How will the funds be used?',
            answer: `All funds raised will be used directly for the ${category} project. We will provide detailed updates on fund allocation and project progress throughout the campaign.`
        },
        {
            question: 'What is the timeline for this project?',
            answer: 'We will begin work immediately after the campaign ends. Detailed timeline and milestones will be shared with all supporters through regular updates.'
        },
        {
            question: 'What is your refund policy?',
            answer: 'Contributions are final once the campaign successfully reaches its funding goal. If the campaign does not meet its goal, all contributions will be automatically refunded.'
        },
        {
            question: 'How can I track the progress?',
            answer: 'We will post regular updates on the campaign page. All supporters will receive email notifications when new updates are posted.'
        },
        {
            question: 'What happens if you exceed your goal?',
            answer: 'Any additional funds will be used to enhance the project and deliver even better results. We may introduce stretch goals with additional features or rewards.'
        },
        {
            question: 'How can I contact you?',
            answer: 'You can reach us through the campaign page message system, or contact us directly via the email provided in our profile.'
        },
        {
            question: 'Are there any risks involved?',
            answer: 'As with any project, there are potential risks and challenges. We have carefully planned to mitigate these risks and will communicate transparently about any issues that arise.'
        },
        {
            question: 'When will rewards be delivered?',
            answer: 'Reward delivery timelines vary by tier and are specified in each reward description. We will keep you updated on the production and shipping status.'
        }
    ];
}
