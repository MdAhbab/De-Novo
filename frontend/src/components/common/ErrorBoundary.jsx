import React from 'react';

/**
 * Global Error Boundary (FE-04).
 * Catches render errors and shows an accessible fallback instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Use proper logging rather than console.error in prod
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ErrorBoundary]', error, info);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div
                role="alert"
                aria-live="assertive"
                className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-8"
            >
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-red-500 text-4xl" aria-hidden="true">
                            error_outline
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">
                            An unexpected error occurred. Your data is safe — please try again.
                        </p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors focus:outline-none focus:ring-4 focus:ring-primary/40"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }
}
