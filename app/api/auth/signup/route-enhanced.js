// app/api/auth/signup/route.js

/**
 * User Signup API Route
 * 
 * Handles new user registration with comprehensive validation,
 * security measures, rate limiting, and error handling.
 * 
 * Features:
 * - Rate limiting (5 requests per 15 minutes)
 * - Structured logging
 * - Input validation and sanitization
 * - Password strength requirements
 * - Unique username generation
 * - Secure password hashing with bcrypt
 * - Comprehensive error handling
 */

import { NextResponse } from "next/server";
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createLogger } from '@/lib/logger';
import { rateLimiters } from '@/lib/rateLimit';
import { validateString, validateEmail, ValidationError } from '@/lib/validation';

const logger = createLogger('SignupAPI');

// Constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;
const BCRYPT_ROUNDS = 12; // Higher = more secure but slower

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, message?: string}}
 */
function validatePassword(password) {
    try {
        validateString(password, {
            fieldName: 'Password',
            minLength: PASSWORD_MIN_LENGTH,
            maxLength: PASSWORD_MAX_LENGTH,
            allowEmpty: false,
        });

        // Check for at least one number and one letter
        const hasNumber = /\d/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);

        if (!hasNumber || !hasLetter) {
            return {
                valid: false,
                message: 'Password must contain at least one letter and one number'
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            message: error.message
        };
    }
}

/**
 * Sanitize name input
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized name
 */
function sanitizeName(name) {
    return name
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .slice(0, NAME_MAX_LENGTH);
}

/**
 * Generate unique username from email
 * @param {string} email - User's email
 * @returns {Promise<string>} Unique username
 */
async function generateUniqueUsername(email) {
    logger.debug('Generating unique username', { email });

    // Extract base username from email
    let baseUsername = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') // Remove invalid characters
        .slice(0, 20); // Limit length

    // Ensure it's not empty after sanitization
    if (!baseUsername) {
        baseUsername = 'user';
    }

    let username = baseUsername;
    let counter = 1;
    const maxAttempts = 100; // Prevent infinite loops

    // Check uniqueness and append counter if needed
    while (counter < maxAttempts) {
        const existingUser = await User.findOne({ username }).lean();

        if (!existingUser) {
            logger.debug('Generated unique username', { username });
            return username;
        }

        username = `${baseUsername}${counter}`;
        counter++;
    }

    // Fallback: use timestamp if we can't find a unique username
    const fallbackUsername = `${baseUsername}_${Date.now()}`;
    logger.warn('Using timestamp fallback for username', { fallbackUsername });
    return fallbackUsername;
}

/**
 * POST /api/auth/signup
 * Create a new user account
 */
async function signupHandler(req) {
    const startTime = Date.now();
    logger.info('Signup request received');

    try {
        // Parse request body
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            logger.error('JSON parse error', { error: parseError.message });
            return NextResponse.json(
                { message: 'Invalid request format' },
                { status: 400 }
            );
        }

        const { name, email, password, accountType } = body;

        logger.debug('Processing signup', { email, accountType });

        // ===== Input Validation =====

        // Validate name
        try {
            validateString(name, {
                fieldName: 'Name',
                minLength: 1,
                maxLength: NAME_MAX_LENGTH,
                trim: true,
                allowEmpty: false,
            });
        } catch (error) {
            logger.warn('Name validation failed', { error: error.message });
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        // Validate email
        let validatedEmail;
        try {
            validatedEmail = validateEmail(email, 'Email');
        } catch (error) {
            logger.warn('Email validation failed', { error: error.message });
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            logger.warn('Password validation failed', { reason: passwordValidation.message });
            return NextResponse.json(
                { message: passwordValidation.message },
                { status: 400 }
            );
        }

        // Validate account type
        const validAccountTypes = ['creator', 'supporter', 'both'];
        const sanitizedAccountType = accountType && validAccountTypes.includes(accountType)
            ? accountType
            : 'creator';

        // ===== Database Operations =====

        // Connect to database
        try {
            await connectDb();
            logger.debug('Database connected');
        } catch (dbError) {
            logger.error('Database connection error', { error: dbError.message });
            return NextResponse.json(
                { message: 'Service temporarily unavailable. Please try again later.' },
                { status: 503 }
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: validatedEmail
        }).lean();

        if (existingUser) {
            logger.warn('Email already registered', { email: validatedEmail });
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 } // 409 Conflict
            );
        }

        // Generate unique username
        const username = await generateUniqueUsername(validatedEmail);

        // Hash password
        let hashedPassword;
        try {
            const hashStart = Date.now();
            hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
            logger.metric('password_hash_duration', Date.now() - hashStart, 'ms');
        } catch (hashError) {
            logger.error('Password hashing error', { error: hashError.message });
            return NextResponse.json(
                { message: 'Error processing request. Please try again.' },
                { status: 500 }
            );
        }

        // Create user
        const user = await User.create({
            name: sanitizeName(name),
            email: validatedEmail,
            username,
            password: hashedPassword,
            role: sanitizedAccountType
        });

        const duration = Date.now() - startTime;

        // Log successful registration (without sensitive data)
        logger.info('User registered successfully', {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            duration
        });

        logger.metric('signup_duration', duration, 'ms');

        // Return success response (exclude password)
        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    role: user.role
                }
            },
            { status: 201 }
        );
    } catch (error) {
        const duration = Date.now() - startTime;

        // Log error with context
        logger.error('Signup failed', {
            error: error.message,
            errorName: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            duration
        });

        // Handle specific error types
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const messages = Object.values(error.errors).map(err => err.message);
            logger.warn('Mongoose validation error', { messages });
            return NextResponse.json(
                { message: messages.join(', ') },
                { status: 400 }
            );
        }

        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            logger.warn('Duplicate key error', { field });
            return NextResponse.json(
                { message: `${field} already exists` },
                { status: 409 }
            );
        }

        // Generic error response (don't expose internal details)
        return NextResponse.json(
            { message: 'An error occurred during registration. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * Export POST handler with rate limiting
 */
export async function POST(req) {
    // Apply rate limiting
    return rateLimiters.auth(req, signupHandler);
}
