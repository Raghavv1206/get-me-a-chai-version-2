// lib/logger.js - Centralized Logging Utility

/**
 * Production-ready logging utility with different log levels,
 * structured logging, and environment-aware behavior.
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Environment-aware (verbose in dev, minimal in prod)
 * - Timestamp and component tracking
 * - Error serialization
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const LOG_LEVEL_NAMES = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARN',
    3: 'ERROR',
};

// Get current log level from environment (default: INFO in production, DEBUG in development)
const getCurrentLogLevel = () => {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
        return LOG_LEVELS[envLevel];
    }
    return process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
};

const CURRENT_LOG_LEVEL = getCurrentLogLevel();

/**
 * Format log entry with timestamp and metadata
 * @param {string} level - Log level
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {Object} Formatted log entry
 */
function formatLogEntry(level, component, message, meta = {}) {
    return {
        timestamp: new Date().toISOString(),
        level,
        component,
        message,
        ...meta,
        // Add environment info in development
        ...(process.env.NODE_ENV !== 'production' && {
            env: process.env.NODE_ENV,
        }),
    };
}

/**
 * Serialize error objects for logging
 * @param {Error} error - Error object
 * @returns {Object} Serialized error
 */
function serializeError(error) {
    if (!(error instanceof Error)) {
        return error;
    }

    return {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        code: error.code,
        status: error.status,
        // Include any custom properties
        ...Object.getOwnPropertyNames(error).reduce((acc, key) => {
            if (!['name', 'message', 'stack'].includes(key)) {
                acc[key] = error[key];
            }
            return acc;
        }, {}),
    };
}

/**
 * Core logging function
 * @param {number} level - Log level
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function log(level, component, message, meta = {}) {
    // Skip if below current log level
    if (level < CURRENT_LOG_LEVEL) {
        return;
    }

    // Serialize errors in metadata
    const serializedMeta = { ...meta };
    if (meta.error) {
        serializedMeta.error = serializeError(meta.error);
    }

    const logEntry = formatLogEntry(LOG_LEVEL_NAMES[level], component, message, serializedMeta);

    // In production, you might want to send to a logging service
    // For now, we use console with appropriate methods
    switch (level) {
        case LOG_LEVELS.DEBUG:
            console.debug(JSON.stringify(logEntry));
            break;
        case LOG_LEVELS.INFO:
            console.info(JSON.stringify(logEntry));
            break;
        case LOG_LEVELS.WARN:
            console.warn(JSON.stringify(logEntry));
            break;
        case LOG_LEVELS.ERROR:
            console.error(JSON.stringify(logEntry));
            break;
        default:
            console.log(JSON.stringify(logEntry));
    }
}

/**
 * Create a logger instance for a specific component
 * @param {string} component - Component name
 * @returns {Object} Logger instance with debug, info, warn, error methods
 */
export function createLogger(component) {
    if (!component || typeof component !== 'string') {
        throw new Error('Component name is required for logger');
    }

    return {
        /**
         * Log debug message
         * @param {string} message - Debug message
         * @param {Object} meta - Additional metadata
         */
        debug: (message, meta = {}) => {
            log(LOG_LEVELS.DEBUG, component, message, meta);
        },

        /**
         * Log info message
         * @param {string} message - Info message
         * @param {Object} meta - Additional metadata
         */
        info: (message, meta = {}) => {
            log(LOG_LEVELS.INFO, component, message, meta);
        },

        /**
         * Log warning message
         * @param {string} message - Warning message
         * @param {Object} meta - Additional metadata
         */
        warn: (message, meta = {}) => {
            log(LOG_LEVELS.WARN, component, message, meta);
        },

        /**
         * Log error message
         * @param {string} message - Error message
         * @param {Object} meta - Additional metadata
         */
        error: (message, meta = {}) => {
            log(LOG_LEVELS.ERROR, component, message, meta);
        },

        /**
         * Log API request
         * @param {string} method - HTTP method
         * @param {string} path - Request path
         * @param {Object} meta - Additional metadata
         */
        request: (method, path, meta = {}) => {
            log(LOG_LEVELS.INFO, component, `${method} ${path}`, {
                type: 'request',
                method,
                path,
                ...meta,
            });
        },

        /**
         * Log API response
         * @param {string} method - HTTP method
         * @param {string} path - Request path
         * @param {number} status - Response status code
         * @param {number} duration - Request duration in ms
         * @param {Object} meta - Additional metadata
         */
        response: (method, path, status, duration, meta = {}) => {
            const level = status >= 500 ? LOG_LEVELS.ERROR : status >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
            log(level, component, `${method} ${path} ${status} ${duration}ms`, {
                type: 'response',
                method,
                path,
                status,
                duration,
                ...meta,
            });
        },

        /**
         * Log database query
         * @param {string} operation - Database operation
         * @param {string} collection - Collection name
         * @param {number} duration - Query duration in ms
         * @param {Object} meta - Additional metadata
         */
        query: (operation, collection, duration, meta = {}) => {
            log(LOG_LEVELS.DEBUG, component, `DB ${operation} on ${collection} (${duration}ms)`, {
                type: 'database',
                operation,
                collection,
                duration,
                ...meta,
            });
        },

        /**
         * Log performance metric
         * @param {string} metric - Metric name
         * @param {number} value - Metric value
         * @param {string} unit - Unit of measurement
         * @param {Object} meta - Additional metadata
         */
        metric: (metric, value, unit = 'ms', meta = {}) => {
            log(LOG_LEVELS.INFO, component, `Metric: ${metric} = ${value}${unit}`, {
                type: 'metric',
                metric,
                value,
                unit,
                ...meta,
            });
        },
    };
}

/**
 * Default logger instance
 */
export const logger = createLogger('App');

export default createLogger;
