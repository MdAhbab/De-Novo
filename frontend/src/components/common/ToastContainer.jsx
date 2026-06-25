import React, { useState, useEffect, useCallback } from 'react';
import { toastEmitter } from '../../utils/toast';

/**
 * Accessible Toast notification container.
 * UX-01: Replaces alert() and silent failures.
 * A11Y: Uses aria-live="polite" + role="status" so screen readers announce toasts.
 */
const ICONS = {
    success: 'check_circle',
    error:   'error',
    warning: 'warning',
    info:    'info',
};

const COLORS = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info:    'bg-primary text-white',
};

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full
                        animate-slide-in-right ${COLORS[toast.type] || COLORS.info}
                        pointer-events-auto`}
        >
            <span className="material-symbols-outlined text-xl flex-shrink-0" aria-hidden="true">
                {ICONS[toast.type] || ICONS.info}
            </span>
            <p className="text-sm font-semibold leading-snug flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
            >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toastData) => {
        setToasts(prev => [...prev, toastData]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        toastEmitter.register(addToast);
        return () => toastEmitter.unregister();
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-label="Notifications"
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        >
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
        </div>
    );
}
