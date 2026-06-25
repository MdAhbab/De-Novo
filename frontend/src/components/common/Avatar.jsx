import React from 'react';

/**
 * Avatar component (UX-03).
 * Falls back to initials with a deterministic color based on user ID/name.
 * Replaces all hardcoded Google stock photo URLs.
 */

const COLORS = [
    '#008c9e', '#0f766e', '#0369a1', '#7c3aed', '#b45309',
    '#be123c', '#15803d', '#c2410c', '#1d4ed8', '#6d28d9',
];

function getColor(seed) {
    if (!seed) return COLORS[0];
    const str = String(seed);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name, username) {
    if (name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return (parts[0][0] || '?').toUpperCase();
    }
    if (username) return username[0].toUpperCase();
    return '?';
}

/**
 * @param {object} props
 * @param {string} [props.src]          - URL of avatar image (optional)
 * @param {string} [props.name]         - Full display name (for initials fallback)
 * @param {string} [props.username]     - Username (for initials + color seed)
 * @param {number|string} [props.userId] - User ID (for color seed)
 * @param {string} [props.size]         - Tailwind size class e.g. 'size-10' (default)
 * @param {string} [props.className]    - Extra classes
 * @param {string} [props.alt]          - Alt text override
 */
export default function Avatar({ src, name, username, userId, size = 'size-10', className = '', alt }) {
    const seed = userId ?? username ?? name;
    const bgColor = getColor(seed);
    const initials = getInitials(name, username);
    const altText = alt ?? (name ? `${name}'s avatar` : (username ? `${username}'s avatar` : 'User avatar'));

    if (src && !src.includes('lh3.googleusercontent.com/aida-public')) {
        return (
            <img
                src={src}
                alt={altText}
                className={`${size} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            role="img"
            aria-label={altText}
            className={`${size} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white select-none ${className}`}
            style={{ backgroundColor: bgColor }}
        >
            <span className="text-sm leading-none" aria-hidden="true">{initials}</span>
        </div>
    );
}
