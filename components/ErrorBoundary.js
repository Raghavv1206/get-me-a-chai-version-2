// components/ErrorBoundary.js - React Error Boundary

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * Features:
 * - Catches rendering errors
 * - Logs errors with context
 * - Displays user-friendly fallback UI
 * - Reset functionality
 * - Development vs production modes
 */

'use client';

import React from 'react';
import { createLogger } from '@/lib/logger';
import { AlertTriangle } from 'lucide-react';

const logger = createLogger('ErrorBoundary');

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error with full context
        logger.error('Component error caught', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
            component: this.props.componentName || 'Unknown',
        });

        // Update state with error details
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1,
        }));

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        logger.info('Error boundary reset', {
            component: this.props.componentName || 'Unknown',
        });

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        // Call custom reset handler if provided
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    reset: this.handleReset,
                });
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-gray-900 border border-red-500/50 rounded-xl p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-12 h-12 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Oops! Something went wrong
                                </h2>

                                <p className="text-gray-400 mb-4">
                                    We encountered an unexpected error. Don't worry, our team has been notified.
                                </p>

                                {/* Show error details in development */}
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                                        <p className="text-red-400 font-mono text-sm mb-2">
                                            <strong>Error:</strong> {this.state.error.message}
                                        </p>
                                        {this.state.error.stack && (
                                            <details className="mt-2">
                                                <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                                                    Stack Trace
                                                </summary>
                                                <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-64">
                                                    {this.state.error.stack}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={this.handleReset}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Try Again
                                    </button>

                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Go Home
                                    </button>
                                </div>

                                {this.state.errorCount > 1 && (
                                    <p className="text-yellow-500 text-sm mt-4">
                                        <AlertTriangle className="w-4 h-4 inline-block mr-1" /> This error has occurred {this.state.errorCount} times.
                                        If it persists, please contact support.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.defaultProps = {
    componentName: 'Unknown',
};

export default ErrorBoundary;

/**
 * Hook to use error boundary programmatically
 * @returns {Function} Function to trigger error boundary
 */
export function useErrorHandler() {
    const [, setError] = React.useState();

    return React.useCallback((error) => {
        logger.error('Error thrown from hook', { error });
        setError(() => {
            throw error;
        });
    }, []);
}
