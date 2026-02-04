// lib/ai/claude.js - Claude API Integration
import Anthropic from '@anthropic-ai/sdk';

/**
 * Validates that the Anthropic API key is configured
 * @throws {Error} If API key is not configured
 */
function validateApiKey() {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
            'ANTHROPIC_API_KEY environment variable is not configured. ' +
            'Please add it to your .env.local file.'
        );
    }
}

// Initialize Claude client with validation
let anthropic = null;

/**
 * Get or initialize the Anthropic client
 * @returns {Anthropic} Initialized Anthropic client
 */
function getAnthropicClient() {
    if (!anthropic) {
        validateApiKey();
        anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }
    return anthropic;
}

/**
 * Validates input parameters for Claude API calls
 * @param {string} prompt - The prompt to validate
 * @param {object} options - Options to validate
 * @throws {Error} If validation fails
 */
function validateInput(prompt, options = {}) {
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
    }

    if (prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty or whitespace only');
    }

    if (prompt.length > 100000) {
        throw new Error('Prompt exceeds maximum length of 100,000 characters');
    }

    // Validate options
    const { temperature, maxTokens } = options;

    if (temperature !== undefined) {
        if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
            throw new Error('Temperature must be a number between 0 and 1');
        }
    }

    if (maxTokens !== undefined) {
        if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4096) {
            throw new Error('maxTokens must be an integer between 1 and 4096');
        }
    }
}

/**
 * Generate streaming response from Claude
 * 
 * Streams responses from Claude AI in real-time. Useful for chat interfaces
 * and long-form content generation where immediate feedback is desired.
 * 
 * @param {string} prompt - The prompt to send to Claude (required, non-empty string, max 100k chars)
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-1, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-4096)
 * @param {string} [options.systemPrompt] - System prompt to set AI behavior
 * @returns {AsyncGenerator<string>} - Streaming response chunks
 * @throws {Error} If validation fails or API call errors
 * 
 * @example
 * for await (const chunk of streamClaude('Write a campaign description')) {
 *   process.stdout.write(chunk);
 * }
 */
export async function* streamClaude(prompt, options = {}) {
    // Input validation
    validateInput(prompt, options);

    const {
        temperature = 0.7,
        maxTokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const client = getAnthropicClient();
    let stream = null;

    try {
        stream = await client.messages.stream({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            temperature: temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: prompt.trim(),
                },
            ],
        });

        for await (const chunk of stream) {
            if (
                chunk.type === 'content_block_delta' &&
                chunk.delta?.type === 'text_delta' &&
                chunk.delta?.text
            ) {
                yield chunk.delta.text;
            }
        }
    } catch (error) {
        // Enhanced error handling with specific error types
        console.error('[streamClaude] Error:', error);

        if (error.status === 401) {
            throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
        } else if (error.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 500 || error.status === 503) {
            throw new Error('Claude API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
        } else {
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    } finally {
        // Ensure stream is properly closed
        if (stream && typeof stream.abort === 'function') {
            try {
                stream.abort();
            } catch (abortError) {
                console.warn('[streamClaude] Error aborting stream:', abortError);
            }
        }
    }
}

/**
 * Generate non-streaming response from Claude
 * 
 * Generates a complete response from Claude AI. Use this when you need
 * the full response before processing (e.g., for structured data extraction).
 * 
 * @param {string} prompt - The prompt to send to Claude (required, non-empty string, max 100k chars)
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-1, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-4096)
 * @param {string} [options.systemPrompt] - System prompt to set AI behavior
 * @returns {Promise<string>} - Complete response text
 * @throws {Error} If validation fails or API call errors
 * 
 * @example
 * const description = await generateClaude('Write a campaign tagline');
 * console.log(description);
 */
export async function generateClaude(prompt, options = {}) {
    // Input validation
    validateInput(prompt, options);

    const {
        temperature = 0.7,
        maxTokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const client = getAnthropicClient();

    try {
        const message = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            temperature: temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: prompt.trim(),
                },
            ],
        });

        // Validate response structure
        if (!message?.content?.[0]?.text) {
            throw new Error('Invalid response structure from Claude API');
        }

        return message.content[0].text;
    } catch (error) {
        // Enhanced error handling
        console.error('[generateClaude] Error:', error);

        if (error.status === 401) {
            throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
        } else if (error.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 500 || error.status === 503) {
            throw new Error('Claude API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
        } else {
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}

/**
 * Generate with conversation history
 * 
 * Generates a response from Claude while maintaining conversation context.
 * Useful for multi-turn conversations and chatbots.
 * 
 * @param {Array<{role: string, content: string}>} messages - Array of message objects
 * @param {object} options - Additional options
 * @param {number} [options.temperature=0.7] - Randomness (0-1, lower = more focused)
 * @param {number} [options.maxTokens=2000] - Maximum tokens to generate (1-4096)
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
    // Validate messages array
    if (!Array.isArray(messages)) {
        throw new Error('Messages must be an array');
    }

    if (messages.length === 0) {
        throw new Error('Messages array cannot be empty');
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        if (!msg || typeof msg !== 'object') {
            throw new Error(`Message at index ${i} must be an object`);
        }

        if (!msg.role || typeof msg.role !== 'string') {
            throw new Error(`Message at index ${i} must have a valid role`);
        }

        if (!['user', 'assistant'].includes(msg.role)) {
            throw new Error(`Message at index ${i} has invalid role: ${msg.role}. Must be 'user' or 'assistant'`);
        }

        if (!msg.content || typeof msg.content !== 'string') {
            throw new Error(`Message at index ${i} must have valid content`);
        }

        if (msg.content.trim().length === 0) {
            throw new Error(`Message at index ${i} has empty content`);
        }
    }

    // Validate options
    const { temperature, maxTokens } = options;

    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
        throw new Error('Temperature must be a number between 0 and 1');
    }

    if (maxTokens !== undefined && (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4096)) {
        throw new Error('maxTokens must be an integer between 1 and 4096');
    }

    const {
        temperature: temp = 0.7,
        maxTokens: tokens = 2000,
        systemPrompt = "You are a helpful AI assistant for a crowdfunding platform called 'Get Me a Chai'.",
    } = options;

    const client = getAnthropicClient();

    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: tokens,
            temperature: temp,
            system: systemPrompt,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content.trim()
            })),
        });

        // Validate response structure
        if (!response?.content?.[0]?.text) {
            throw new Error('Invalid response structure from Claude API');
        }

        return response.content[0].text;
    } catch (error) {
        // Enhanced error handling
        console.error('[generateWithHistory] Error:', error);

        if (error.status === 401) {
            throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
        } else if (error.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 500 || error.status === 503) {
            throw new Error('Claude API is temporarily unavailable. Please try again later.');
        } else if (error.message?.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
        } else {
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}
