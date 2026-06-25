import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { toast } from '../utils/toast';
import Avatar from '../components/common/Avatar';

const ProfilePage = () => {
    const { user, getUserDisplayName, updateProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // FE-12: Form state mirrors real user data
    const displayName = getUserDisplayName();
    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name:  user?.last_name  || '',
        bio:        user?.bio        || '',
        phone_number: user?.phone_number || '',
    });
    const [bioLength, setBioLength] = useState((user?.bio || '').length);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isOnline, setIsOnline] = useState(user?.is_online ?? true);

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'bio') setBioLength(value.length);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateProfile(form);
            if (result.success) {
                toast.success('Profile saved successfully!');
            } else {
                toast.error(result.error || 'Failed to save profile');
            }
        } catch {
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    // FE-12: Avatar upload wired to API
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Avatar must be under 5MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await api.users.uploadAvatar(formData);
            if (res.success) {
                await refreshProfile();
                toast.success('Avatar updated!');
            } else {
                toast.error('Failed to upload avatar');
            }
        } catch {
            toast.error('Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleOnlineToggle = async (v) => {
        setIsOnline(v);
        try {
            await api.users.setOnlineStatus(v);
        } catch {
            setIsOnline(!v);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-12">
                            <Link to="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
                                <span className="material-symbols-outlined text-4xl" aria-hidden="true">hearing_disabled</span>
                                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">De-Novo</span>
                            </Link>
                            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                                <Link to="/profile" aria-current="page" className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-primary pb-0.5">Profile</Link>
                                <Link to="/chat" className="text-sm font-medium text-slate-500 dark:text-slate-500 hover:text-primary transition-colors">Messages</Link>
                                <Link to="/contacts" className="text-sm font-medium text-slate-500 dark:text-slate-500 hover:text-primary transition-colors">Contacts</Link>
                                <Link to="/settings" className="text-sm font-medium text-slate-500 dark:text-slate-500 hover:text-primary transition-colors">Settings</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* FE-12: Real user avatar in header */}
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <Avatar
                                    src={user?.avatar}
                                    name={displayName}
                                    username={user?.username}
                                    userId={user?.id}
                                    size="size-10"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Page Heading */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-primary text-lg font-medium max-w-2xl">
                            Manage your identity, accessibility preferences, and how others connect with you.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            id="save-profile-btn"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors shadow-md disabled:opacity-60"
                        >
                            {saving ? (
                                <span className="material-symbols-outlined text-[20px] animate-spin" aria-hidden="true">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">save</span>
                            )}
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Profile Card (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Profile Card */}
                        <section
                            className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                            aria-label="Profile information"
                        >
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                {/* Avatar Section — FE-12: Real avatar + upload */}
                                <div className="flex-shrink-0 relative group/avatar mx-auto md:mx-0">
                                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg relative">
                                        {uploadingAvatar ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                <span className="material-symbols-outlined animate-spin text-primary text-4xl" aria-hidden="true">progress_activity</span>
                                            </div>
                                        ) : user?.avatar ? (
                                            <img
                                                alt={`${displayName}'s profile picture`}
                                                className="w-full h-full object-cover"
                                                src={user.avatar}
                                            />
                                        ) : (
                                            <div className="w-full h-full">
                                                <Avatar
                                                    name={displayName}
                                                    username={user?.username}
                                                    userId={user?.id}
                                                    size="size-full"
                                                    className="rounded-none text-4xl"
                                                />
                                            </div>
                                        )}
                                        <button
                                            aria-label="Change profile photo"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity focus:opacity-100 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-white text-4xl" aria-hidden="true">photo_camera</span>
                                        </button>
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute bottom-2 right-2 md:right-4">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                            title={isOnline ? 'Online' : 'Offline'}
                                        >
                                            <span className="sr-only">Status: {isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleAvatarUpload}
                                        aria-label="Upload profile photo"
                                    />
                                </div>

                                {/* Info Section — FE-12: Real data */}
                                <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-4">
                                        <div className="w-full">
                                            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                                <div className="flex-1">
                                                    <label htmlFor="first_name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1 block">First Name</label>
                                                    <input
                                                        id="first_name"
                                                        name="first_name"
                                                        type="text"
                                                        value={form.first_name}
                                                        onChange={handleFieldChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none text-base font-bold"
                                                        placeholder="First name"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="last_name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1 block">Last Name</label>
                                                    <input
                                                        id="last_name"
                                                        name="last_name"
                                                        type="text"
                                                        value={form.last_name}
                                                        onChange={handleFieldChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none text-base font-bold"
                                                        placeholder="Last name"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-500 text-sm">@{user?.username}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
                                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>

                                    {/* Bio Input */}
                                    <div className="relative group/bio mb-6">
                                        <label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1 block">Bio</label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            aria-label="Edit Bio"
                                            maxLength={200}
                                            value={form.bio}
                                            onChange={handleFieldChange}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-300 resize-none focus:ring-2 focus:ring-primary focus:outline-none text-base leading-relaxed min-h-[120px]"
                                            placeholder="Tell others about yourself and your communication preferences..."
                                        />
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/bio:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-slate-500">{bioLength}/200</span>
                                        </div>
                                    </div>

                                    {/* Accessibility badges */}
                                    {user?.disability_type && user.disability_type !== 'none' && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-3">Accessibility & Preferences</p>
                                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">accessibility</span>
                                                    <span className="font-bold text-sm capitalize">{user.disability_type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Activity Status */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">schedule</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Status</h2>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Show others when you are available for real-time chat.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isOnline}
                                    onChange={e => handleOnlineToggle(e.target.checked)}
                                    aria-label="Show online status"
                                />
                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-primary" />
                                <span className="ml-3 text-sm font-bold text-slate-900 dark:text-white peer-checked:text-primary">
                                    {isOnline ? 'Visible' : 'Hidden'}
                                </span>
                            </label>
                        </section>
                    </div>

                    {/* Right Column: Contact Info (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Share Profile */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Share Profile</h2>
                            <p className="text-slate-500 dark:text-slate-500 text-sm mb-6">Share your username to let others find you.</p>
                            <div className="bg-primary/10 text-primary px-6 py-4 rounded-2xl text-2xl font-bold mb-6 w-full text-center">
                                @{user?.username}
                            </div>
                            <button
                                onClick={() => copyToClipboard(user?.username || '')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">content_copy</span>
                                Copy Username
                            </button>
                        </div>

                        {/* Contact Info — FE-12: Real data */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500" aria-hidden="true">contact_page</span>
                                Contact Info
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                                        <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase">Email</p>
                                        {/* FE-12: Real email — not hardcoded "alex.m@example.com" */}
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.email || '—'}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(user?.email || '')}
                                        aria-label="Copy email address"
                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-primary transition-opacity"
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
                                    </button>
                                </li>
                                <li className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                                        <span className="material-symbols-outlined" aria-hidden="true">alternate_email</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase">Username</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">@{user?.username || '—'}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`@${user?.username || ''}`)}
                                        aria-label="Copy username"
                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-primary transition-opacity"
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-4">Account Actions</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/settings"
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-blue-50 hover:border-blue-100 dark:hover:bg-blue-900/10 dark:hover:border-blue-900/30 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-500 transition-colors" aria-hidden="true">shield_lock</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Privacy & Security</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-400 text-sm" aria-hidden="true">arrow_forward_ios</span>
                                </Link>
                                <Link
                                    to="/accessibility"
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-primary/5 hover:border-primary/10 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors" aria-hidden="true">settings_accessibility</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary">Accessibility Settings</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm" aria-hidden="true">arrow_forward_ios</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer — UX-06: Updated © year */}
            <footer className="mt-auto py-8 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-600 text-sm font-medium">© 2026 De-Novo. Designing for everyone.</p>
            </footer>
        </div>
    );
};

export default ProfilePage;
