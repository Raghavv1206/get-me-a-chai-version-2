// app/api/auth/signup/route.js

/**
 * User Signup API Route
 * 
 * Handles new user registration with comprehensive validation,
 * security measures, and error handling.
 * 
 * Features:
 * - Input validation and sanitization
 * - Password strength requirements
 * - Unique username generation
 * - Secure password hashing with bcrypt
 * - Rate limiting awareness
 * - Comprehensive error handling
 */

import { NextResponse } from "next/server";
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;
const BCRYPT_ROUNDS = 12; // Higher = more secure but slower

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, message?: string}}
 */
function validatePassword(password) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`
    };
  }

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
      return username;
    }

    username = `${baseUsername}${counter}`;
    counter++;
  }

  // Fallback: use timestamp if we can't find a unique username
  return `${baseUsername}_${Date.now()}`;
}

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(req) {
  let dbConnected = false;

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[Signup] JSON parse error:', parseError);
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { name, email, password, accountType } = body;

    // ===== Input Validation =====

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > NAME_MAX_LENGTH) {
      return NextResponse.json(
        { message: `Name must not exceed ${NAME_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
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
      dbConnected = true;
    } catch (dbError) {
      console.error('[Signup] Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 } // 409 Conflict
      );
    }

    // Generate unique username
    const username = await generateUniqueUsername(email);

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    } catch (hashError) {
      console.error('[Signup] Password hashing error:', hashError);
      return NextResponse.json(
        { message: 'Error processing request. Please try again.' },
        { status: 500 }
      );
    }

    // Create user
    const user = await User.create({
      name: sanitizeName(name),
      email: email.toLowerCase().trim(),
      username,
      password: hashedPassword,
      role: sanitizedAccountType
    });

    // Log successful registration (without sensitive data)
    console.log(`[Signup] New user registered: ${user.email} (ID: ${user._id})`);

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
    // Log error with context
    console.error('[Signup] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
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
