import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = "Loading content...", fullScreen = false }) {
    const containerClass = fullScreen
        ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 space-y-4"
        : "flex flex-col items-center justify-center p-8 space-y-4";

    return (
        <div className={containerClass} role="status" aria-live="polite">
            <Loader2 className="animate-spin text-primary" size={48} />
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300 sr-only">{text}</span>
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300" aria-hidden="true">{text}</span>
        </div>
    );
}
