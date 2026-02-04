// lib/validation.js - Input Validation Utilities

/**
 * Comprehensive input validation utilities for production use.
 * 
 * Features:
 * - Type validation
 * - Format validation (email, URL, etc.)
 * - Range validation
 * - Sanitization
 * - Custom validators
 * - Detailed error messages
 */

import { createLogger } from './logger';

const logger = createLogger('Validation');

/**
 * Validation error class
 */
export class ValidationError extends Error {
    constructor(message, field = null, value = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
}

/**
 * Validate that value is not null or undefined
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {*} The value if valid
 * @throws {ValidationError} If value is null or undefined
 */
export function required(value, fieldName = 'Field') {
    if (value === null || value === undefined) {
        throw new ValidationError(`${fieldName} is required`, fieldName, value);
    }
    return value;
}

/**
 * Validate string type and optionally check length
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {string} The validated string
 * @throws {ValidationError} If validation fails
 */
export function validateString(value, options = {}) {
    const {
        fieldName = 'Field',
        minLength = 0,
        maxLength = Infinity,
        pattern = null,
        trim = true,
        allowEmpty = false,
    } = options;

    // Check type
    if (typeof value !== 'string') {
        throw new ValidationError(
            `${fieldName} must be a string`,
            fieldName,
            value
        );
    }

    // Trim if requested
    const processedValue = trim ? value.trim() : value;

    // Check if empty
    if (!allowEmpty && processedValue.length === 0) {
        throw new ValidationError(
            `${fieldName} cannot be empty`,
            fieldName,
            value
        );
    }

    // Check length
    if (processedValue.length < minLength) {
        throw new ValidationError(
            `${fieldName} must be at least ${minLength} characters`,
            fieldName,
            value
        );
    }

    if (processedValue.length > maxLength) {
        throw new ValidationError(
            `${fieldName} must not exceed ${maxLength} characters`,
            fieldName,
            value
        );
    }

    // Check pattern
    if (pattern && !pattern.test(processedValue)) {
        throw new ValidationError(
            `${fieldName} has invalid format`,
            fieldName,
            value
        );
    }

    return processedValue;
}

/**
 * Validate number type and optionally check range
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {number} The validated number
 * @throws {ValidationError} If validation fails
 */
export function validateNumber(value, options = {}) {
    const {
        fieldName = 'Field',
        min = -Infinity,
        max = Infinity,
        integer = false,
    } = options;

    // Convert to number if string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check type
    if (typeof numValue !== 'number' || isNaN(numValue)) {
        throw new ValidationError(
            `${fieldName} must be a valid number`,
            fieldName,
            value
        );
    }

    // Check if integer required
    if (integer && !Number.isInteger(numValue)) {
        throw new ValidationError(
            `${fieldName} must be an integer`,
            fieldName,
            value
        );
    }

    // Check range
    if (numValue < min) {
        throw new ValidationError(
            `${fieldName} must be at least ${min}`,
            fieldName,
            value
        );
    }

    if (numValue > max) {
        throw new ValidationError(
            `${fieldName} must not exceed ${max}`,
            fieldName,
            value
        );
    }

    return numValue;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string} Normalized email (lowercase, trimmed)
 * @throws {ValidationError} If email is invalid
 */
export function validateEmail(email, fieldName = 'Email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const processedEmail = validateString(email, {
        fieldName,
        maxLength: 254, // RFC 5321
        trim: true,
    });

    if (!emailRegex.test(processedEmail)) {
        throw new ValidationError(
            `${fieldName} must be a valid email address`,
            fieldName,
            email
        );
    }

    return processedEmail.toLowerCase();
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {string} The validated URL
 * @throws {ValidationError} If URL is invalid
 */
export function validateUrl(url, options = {}) {
    const {
        fieldName = 'URL',
        protocols = ['http', 'https'],
        requireProtocol = true,
    } = options;

    const processedUrl = validateString(url, {
        fieldName,
        maxLength: 2048,
        trim: true,
    });

    try {
        const urlObj = new URL(processedUrl);

        if (requireProtocol && !protocols.includes(urlObj.protocol.replace(':', ''))) {
            throw new ValidationError(
                `${fieldName} must use one of these protocols: ${protocols.join(', ')}`,
                fieldName,
                url
            );
        }

        return processedUrl;
    } catch (error) {
        throw new ValidationError(
            `${fieldName} must be a valid URL`,
            fieldName,
            url
        );
    }
}

/**
 * Validate array and optionally validate items
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Array} The validated array
 * @throws {ValidationError} If validation fails
 */
export function validateArray(value, options = {}) {
    const {
        fieldName = 'Field',
        minLength = 0,
        maxLength = Infinity,
        itemValidator = null,
    } = options;

    if (!Array.isArray(value)) {
        throw new ValidationError(
            `${fieldName} must be an array`,
            fieldName,
            value
        );
    }

    if (value.length < minLength) {
        throw new ValidationError(
            `${fieldName} must have at least ${minLength} items`,
            fieldName,
            value
        );
    }

    if (value.length > maxLength) {
        throw new ValidationError(
            `${fieldName} must not exceed ${maxLength} items`,
            fieldName,
            value
        );
    }

    // Validate items if validator provided
    if (itemValidator) {
        return value.map((item, index) => {
            try {
                return itemValidator(item, index);
            } catch (error) {
                throw new ValidationError(
                    `${fieldName}[${index}]: ${error.message}`,
                    `${fieldName}[${index}]`,
                    item
                );
            }
        });
    }

    return value;
}

/**
 * Validate object and optionally validate properties
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} The validated object
 * @throws {ValidationError} If validation fails
 */
export function validateObject(value, options = {}) {
    const {
        fieldName = 'Field',
        schema = null,
        allowExtra = true,
    } = options;

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ValidationError(
            `${fieldName} must be an object`,
            fieldName,
            value
        );
    }

    // Validate against schema if provided
    if (schema) {
        const validated = {};
        const errors = [];

        // Validate required fields
        for (const [key, validator] of Object.entries(schema)) {
            try {
                validated[key] = validator(value[key], key);
            } catch (error) {
                errors.push(error.message);
            }
        }

        // Check for extra fields
        if (!allowExtra) {
            const extraKeys = Object.keys(value).filter(key => !schema[key]);
            if (extraKeys.length > 0) {
                errors.push(`Unexpected fields: ${extraKeys.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(
                `${fieldName} validation failed: ${errors.join('; ')}`,
                fieldName,
                value
            );
        }

        return validated;
    }

    return value;
}

/**
 * Validate enum value
 * @param {*} value - Value to validate
 * @param {Array} allowedValues - Allowed values
 * @param {string} fieldName - Field name for error message
 * @returns {*} The validated value
 * @throws {ValidationError} If value not in allowed values
 */
export function validateEnum(value, allowedValues, fieldName = 'Field') {
    if (!allowedValues.includes(value)) {
        throw new ValidationError(
            `${fieldName} must be one of: ${allowedValues.join(', ')}`,
            fieldName,
            value
        );
    }
    return value;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
    if (typeof html !== 'string') {
        return '';
    }

    // Basic sanitization - for production, use a library like DOMPurify
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated and sanitized data
 * @throws {ValidationError} If validation fails
 */
export function validateInput(data, schema) {
    logger.debug('Validating input', {
        fields: Object.keys(schema),
        dataKeys: Object.keys(data || {})
    });

    try {
        const validated = validateObject(data, {
            fieldName: 'Input',
            schema,
            allowExtra: false,
        });

        logger.debug('Input validation successful');
        return validated;
    } catch (error) {
        logger.warn('Input validation failed', {
            error: error.message,
            field: error.field
        });
        throw error;
    }
}

export default {
    required,
    validateString,
    validateNumber,
    validateEmail,
    validateUrl,
    validateArray,
    validateObject,
    validateEnum,
    sanitizeHtml,
    validateInput,
    ValidationError,
};
