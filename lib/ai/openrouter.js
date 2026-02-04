// lib/ai/openrouter.js - OpenRouter DeepSeek API Integration

import { createLogger } from '@/lib/logger';
import { validateString, validateNumber, ValidationError } from '@/lib/validation';

const logger = createLogger('OpenRouter');

/**
 * Validates that the OpenRouter API key is configured
 * @throws {Error} If API key is not configured
 */
function validateApiKey() {
    if (!process.env.OPENROUTER_API_KEY) {
        logger.error('OpenRouter API key not configured');
        throw new Error(
            'OPENROUTER_API_KEY environment variable is not configured. ' +
            'Please add it to your .env.local file.'
        );
    }
    logger.debug('API key validation passed');
}

/**
 * Validates input parameters for OpenRouter API calls
 * @param {string} prompt - The prompt to validate
 * @param {object} options - Options to validate
 * @throws {ValidationError} If validation fails
 */
function validateInput(prompt, options = {}) {
    logger.debug('Validating input', {
        promptLength: prompt?.length,
        options: Object.keys(options)
    });

    try {
        // Validate prompt using centralized validation
        validateString(prompt, {
            fieldName: 'Prompt',
            minLength: 1,
            maxLength: 100000,
            trim: true,
            allowEmpty: false,
        });

        // Validate options
        const { temperature, maxTokens, systemPrompt } = options;

        if (temperature !== undefined) {
            validateNumber(temperature, {
                fieldName: 'Temperature',
                min: 0,
                max: 2,
            });
        }

        if (maxTokens !== undefined) {
            validateNumber(maxTokens, {
                fieldName: 'maxTokens',
                min: 1,
                max: 8192,
                integer: true,
            });
        }

        if (systemPrompt !== undefined) {
            validateString(systemPrompt, {
                fieldName: 'systemPrompt',
                minLength: 1,
                maxLength: 10000,
            });
        }

        logger.debug('Input validation passed');
    } catch (error) {
        logger.warn('Input validation failed', { error: error.message });
        throw error;
    }
}

/**
 * Generate streaming response from DeepSeek via OpenRouter
 * 
 * Streams responses from DeepSeek AI in real-time. Useful for chat interfaces
 * and long-form content generation where immediate feedback is desired.
 * 
 * @param {string} prompt - The prompt to send to DeepSeek (required, non-empty string, max 100k chars)
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-2, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-8192)
 * @param {string} [options.systemPrompt] - System prompt to set AI behavior
 * @returns {AsyncGenerator<string>} - Streaming response chunks
 * @throws {Error} If validation fails or API call errors
 * 
 * @example
 * for await (const chunk of streamDeepSeek('Write a campaign description')) {
 *   process.stdout.write(chunk);
 * }
 */
export async function* streamDeepSeek(prompt, options = {}) {
    const startTime = Date.now();
    logger.info('Starting streaming request', {
        promptLength: prompt?.length,
        options: { ...options, prompt: undefined }
    });

    // Input validation
    validateInput(prompt, options);
    validateApiKey();

    const {
        temperature = 0.7,
        maxTokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
                'X-Title': 'Get Me a Chai',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: prompt.trim(),
                    },
                ],
                temperature: temperature,
                max_tokens: maxTokens,
                stream: true,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            logger.error('API request failed', {
                status: response.status,
                error: errorText,
                duration: Date.now() - startTime
            });
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    if (!trimmedLine || trimmedLine === 'data: [DONE]') {
                        continue;
                    }

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix
                            const data = JSON.parse(jsonStr);

                            const content = data.choices?.[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch (parseError) {
                            logger.warn('Failed to parse SSE line', {
                                line: trimmedLine,
                                error: parseError.message
                            });
                            // Continue processing other lines
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
            const duration = Date.now() - startTime;
            logger.info('Streaming completed', { duration });
            logger.metric('stream_duration', duration, 'ms');
        }
    } catch (error) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Enhanced error handling with specific error types
        logger.error('Streaming request failed', {
            error: error.message,
            errorType: error.name,
            duration
        });

        if (error.name === 'AbortError') {
            logger.warn('Request timed out', { duration });
            throw new Error('Request timed out. Please try again.');
        } else if (error.message?.includes('401')) {
            logger.error('Invalid API key');
            throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY.');
        } else if (error.message?.includes('429')) {
            logger.warn('Rate limit exceeded');
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('500') || error.message?.includes('503')) {
            logger.error('API unavailable', { status: error.message });
            throw new Error('OpenRouter API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('fetch')) {
            logger.error('Network error', { error: error.message });
            throw new Error('Network error. Please check your connection.');
        } else {
            logger.error('Unknown error', { error: error.message });
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}

/**
 * Generate non-streaming response from DeepSeek via OpenRouter
 * 
 * Generates a complete response from DeepSeek AI. Use this when you need
 * the full response before processing (e.g., for structured data extraction).
 * 
 * @param {string} prompt - The prompt to send to DeepSeek (required, non-empty string, max 100k chars)
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-2, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-8192)
 * @param {string} [options.systemPrompt] - System prompt to set AI behavior
 * @returns {Promise<string>} - Complete response text
 * @throws {Error} If validation fails or API call errors
 * 
 * @example
 * const description = await generateDeepSeek('Write a campaign tagline');
 * console.log(description);
 */
export async function generateDeepSeek(prompt, options = {}) {
    const startTime = Date.now();
    logger.info('Starting non-streaming request', {
        promptLength: prompt?.length,
        options: { ...options, prompt: undefined }
    });

    // Input validation
    validateInput(prompt, options);
    validateApiKey();

    const {
        temperature = 0.7,
        maxTokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
                'X-Title': 'Get Me a Chai',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: prompt.trim(),
                    },
                ],
                temperature: temperature,
                max_tokens: maxTokens,
                stream: false,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Log the full response for debugging
        logger.debug('API response received', {
            hasChoices: !!data?.choices,
            choicesLength: data?.choices?.length,
            hasMessage: !!data?.choices?.[0]?.message,
            hasContent: !!data?.choices?.[0]?.message?.content,
            responseKeys: Object.keys(data || {})
        });

        // Validate response structure
        if (!data?.choices?.[0]?.message?.content) {
            logger.error('Invalid response structure', {
                response: JSON.stringify(data).substring(0, 500) // Log first 500 chars
            });
            throw new Error('Invalid response structure from OpenRouter API');
        }

        const duration = Date.now() - startTime;
        logger.info('Request completed successfully', { duration });

        return data.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Enhanced error handling
        logger.error('Request failed', {
            error: error.message,
            errorType: error.name,
            duration
        });

        if (error.name === 'AbortError') {
            logger.warn('Request timed out', { duration });
            throw new Error('Request timed out. Please try again.');
        } else if (error.message?.includes('401')) {
            logger.error('Invalid API key');
            throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY.');
        } else if (error.message?.includes('429')) {
            logger.warn('Rate limit exceeded');
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('500') || error.message?.includes('503')) {
            logger.error('API unavailable', { status: error.message });
            throw new Error('OpenRouter API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('fetch')) {
            logger.error('Network error', { error: error.message });
            throw new Error('Network error. Please check your connection.');
        } else {
            logger.error('Unknown error', { error: error.message });
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}

/**
 * Generate with conversation history
 * 
 * Generates a response from DeepSeek while maintaining conversation context.
 * Useful for multi-turn conversations and chatbots.
 * 
 * @param {Array<{role: string, content: string}>} messages - Array of message objects
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-2, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-8192)
 * @param {string} [options.systemPrompt] - System prompt to set AI behavior
 * @returns {Promise<string>} - Response text
 * @throws {Error} If validation fails or API call errors
 * 
 * @example
 * const messages = [
 *   { role: 'user', content: 'What is Get Me a Chai?' },
 *   { role: 'assistant', content: 'It is a crowdfunding platform...' },
 *   { role: 'user', content: 'How do I create a campaign?' }
 * ];
 * const response = await generateWithHistory(messages);
 */
export async function generateWithHistory(messages, options = {}) {
    const startTime = Date.now();
    logger.info('Starting conversation request', {
        messageCount: messages?.length,
        options: Object.keys(options)
    });

    // Validate messages array
    if (!Array.isArray(messages)) {
        logger.error('Invalid messages parameter', { type: typeof messages });
        throw new Error('Messages must be an array');
    }

    if (messages.length === 0) {
        logger.error('Empty messages array');
        throw new Error('Messages array cannot be empty');
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        if (!msg || typeof msg !== 'object') {
            logger.error('Invalid message at index', { index: i, type: typeof msg });
            throw new Error(`Message at index ${i} must be an object`);
        }

        if (!msg.role || typeof msg.role !== 'string') {
            logger.error('Invalid message role', { index: i, role: msg.role });
            throw new Error(`Message at index ${i} must have a valid role`);
        }

        if (!['user', 'assistant', 'system'].includes(msg.role)) {
            logger.error('Invalid role value', { index: i, role: msg.role });
            throw new Error(`Message at index ${i} has invalid role: ${msg.role}. Must be 'user', 'assistant', or 'system'`);
        }

        if (!msg.content || typeof msg.content !== 'string') {
            logger.error('Invalid message content', { index: i });
            throw new Error(`Message at index ${i} must have valid content`);
        }

        if (msg.content.trim().length === 0) {
            logger.error('Empty message content', { index: i });
            throw new Error(`Message at index ${i} has empty content`);
        }
    }

    // Validate options
    validateApiKey();
    const { temperature, maxTokens } = options;

    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
        logger.error('Invalid temperature', { temperature });
        throw new Error('Temperature must be a number between 0 and 2');
    }

    if (maxTokens !== undefined && (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 8192)) {
        logger.error('Invalid maxTokens', { maxTokens });
        throw new Error('maxTokens must be an integer between 1 and 8192');
    }

    const {
        temperature: temp = 0.7,
        maxTokens: tokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        // Prepare messages with system prompt if not already included
        const hasSystemMessage = messages.some(msg => msg.role === 'system');
        const apiMessages = hasSystemMessage
            ? messages.map(msg => ({ role: msg.role, content: msg.content.trim() }))
            : [
                { role: 'system', content: systemPrompt },
                ...messages.map(msg => ({ role: msg.role, content: msg.content.trim() }))
            ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
                'X-Title': 'Get Me a Chai',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: apiMessages,
                temperature: temp,
                max_tokens: tokens,
                stream: false,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response structure from OpenRouter API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Enhanced error handling
        logger.error('Conversation request failed', {
            error: error.message,
            errorType: error.name,
            duration,
            messageCount: messages?.length
        });

        if (error.name === 'AbortError') {
            logger.warn('Request timed out', { duration });
            throw new Error('Request timed out. Please try again.');
        } else if (error.message?.includes('401')) {
            logger.error('Invalid API key');
            throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY.');
        } else if (error.message?.includes('429')) {
            logger.warn('Rate limit exceeded');
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('500') || error.message?.includes('503')) {
            logger.error('API unavailable', { status: error.message });
            throw new Error('OpenRouter API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('fetch')) {
            logger.error('Network error', { error: error.message });
            throw new Error('Network error. Please check your connection.');
        } else {
            logger.error('Unknown error', { error: error.message });
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}
