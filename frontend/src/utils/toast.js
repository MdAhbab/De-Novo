/**
 * Toast notification system.
 * Accessible: uses aria-live="polite" and role="status".
 * Usage: import { toast } from '../utils/toast'; toast.success('Saved!')
 */

let _showToast = null;

export const toastEmitter = {
    register: (fn) => { _showToast = fn; },
    unregister: () => { _showToast = null; },
};

const show = (message, type = 'info', duration = 4000) => {
    if (_showToast) {
        _showToast({ message, type, duration, id: Date.now() });
    } else {
        // Fallback during SSR or before mount
        console.info(`[Toast ${type}]`, message);
    }
};

export const toast = {
    success: (msg, duration) => show(msg, 'success', duration),
    error:   (msg, duration) => show(msg, 'error',   duration ?? 6000),
    info:    (msg, duration) => show(msg, 'info',    duration),
    warning: (msg, duration) => show(msg, 'warning', duration),
};
