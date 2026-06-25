import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Avatar from '../components/common/Avatar';
import { api } from '../utils/api';
import { toast } from '../utils/toast';

// FE-10: Time-of-day greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

// Format relative time
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
};

const MOODS = [
    { key: 'happy',   label: 'Happy',   emoji: '😄' },
    { key: 'calm',    label: 'Calm',    emoji: '😌' },
    { key: 'tired',   label: 'Tired',   emoji: '😴' },
    { key: 'anxious', label: 'Anxious', emoji: '😰' },
    { key: 'sad',     label: 'Sad',     emoji: '😢' },
    { key: 'excited', label: 'Excited', emoji: '🤩' },
];

const DashboardPage = () => {
    const { user, logout, getUserDisplayName } = useAuth();
    const { conversations, loading: chatLoading, setActiveConversation } = useChat();
    const navigate = useNavigate();

    const [selectedMood, setSelectedMood] = useState(null);
    const [moodLogging, setMoodLogging] = useState(false);

    // FE-01: Use getUserDisplayName helper instead of user.name
    const displayName = getUserDisplayName();
    const firstName = displayName.split(' ')[0] || 'there';

    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    }).format(today);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // FE-10: Wire mood logging to API
    const handleMoodSelect = useCallback(async (moodKey) => {
        setSelectedMood(moodKey);
        setMoodLogging(true);
        try {
            const res = await api.mood.logMood(moodKey);
            if (res.success) {
                toast.success(`Mood logged: ${moodKey}!`);
            }
        } catch {
            // Silent — mood is still visually selected
        } finally {
            setMoodLogging(false);
        }
    }, []);

    // FE-10: Click on conversation → set active + navigate to chat
    const handleConversationClick = (conv) => {
        setActiveConversation(conv);
        navigate('/chat');
    };

    const recentConversations = conversations.slice(0, 5);

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display min-h-screen flex flex-col overflow-x-hidden">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="px-6 lg:px-10 py-4 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity focus:rounded-lg p-1">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">hearing_disabled</span>
                            </div>
                            {/* A11Y-10: Only one h1 — brand uses span */}
                            <span className="text-2xl font-extrabold tracking-tight">De-Novo</span>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <label className="relative w-full group">
                            <span className="sr-only">Search contacts or messages</span>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500" aria-hidden="true">search</span>
                            </div>
                            <input
                                id="dashboard-search"
                                className="block w-full pl-10 pr-3 py-2.5 border-2 border-transparent bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-primary transition-colors"
                                placeholder="Search..."
                                type="search"
                                aria-label="Search contacts or messages"
                            />
                        </label>
                    </div>

                    {/* Nav actions */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
                            <Link to="/dashboard" className="text-sm font-bold text-primary flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" aria-current="page">
                                <span className="material-symbols-outlined icon-filled" aria-hidden="true">home</span>
                                <span>Home</span>
                            </Link>
                            <Link to="/chat" className="text-sm font-medium text-gray-600 dark:text-gray-500 flex flex-col items-center gap-1 p-2 rounded-lg hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined" aria-hidden="true">chat_bubble</span>
                                <span>Chats</span>
                            </Link>
                            <Link to="/mood-zone" className="text-sm font-medium text-gray-600 dark:text-gray-500 flex flex-col items-center gap-1 p-2 rounded-lg hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined" aria-hidden="true">sentiment_satisfied</span>
                                <span>Mood</span>
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button aria-label="Notifications" className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-2xl" aria-hidden="true">notifications</span>
                            </button>

                            {/* FE-01: Real user name + Avatar component */}
                            <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                                <Avatar
                                    src={user?.avatar}
                                    name={displayName}
                                    username={user?.username}
                                    userId={user?.id}
                                    size="size-9"
                                />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-primary truncate max-w-[120px]">
                                    {displayName || 'Profile'}
                                </span>
                                <span className="material-symbols-outlined text-gray-500 text-lg" aria-hidden="true">expand_more</span>
                            </Link>

                            <button
                                id="logout-btn"
                                onClick={handleLogout}
                                aria-label="Logout"
                                className="flex items-center gap-2 p-2 px-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold"
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">logout</span>
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <section aria-label="Welcome" className="mb-10 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                {/* FE-10: Time-of-day greeting + real first name */}
                                {getGreeting()}, {firstName} 👋
                            </h1>
                            <p className="text-lg text-primary dark:text-primary/80 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg" aria-hidden="true">calendar_today</span>
                                {formattedDate}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg" aria-hidden="true">info</span>
                            <span>Real-time chat is now active</span>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section aria-label="Quick Actions" className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined" aria-hidden="true">bolt</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Action 1 — FE-10: Wired with navigate */}
                        <button
                            id="quick-action-new-chat"
                            onClick={() => navigate('/chat')}
                            className="group flex flex-col items-start justify-between h-40 p-6 bg-primary text-white rounded-2xl hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-md"
                        >
                            <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">add_comment</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Start New Chat</span>
                        </button>

                        <button
                            id="quick-action-messages"
                            onClick={() => navigate('/chat')}
                            className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm"
                        >
                            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">mail</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">View Messages</span>
                        </button>

                        <button
                            id="quick-action-mood"
                            onClick={() => navigate('/mood-zone')}
                            className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm"
                        >
                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-3 rounded-xl group-hover:bg-amber-200 transition-colors">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">sentiment_satisfied</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Mood Zone</span>
                        </button>

                        <button
                            id="quick-action-accessibility"
                            onClick={() => navigate('/accessibility')}
                            className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm"
                        >
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-3 rounded-xl group-hover:bg-gray-200 transition-colors">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">settings_accessibility</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Accessibility</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Recent Conversations — FE-10: Real data */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined" aria-hidden="true">history</span> Recent Conversations
                            </h2>
                            <button
                                onClick={() => navigate('/chat')}
                                className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2 focus:outline-none rounded px-2"
                            >
                                View All
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {chatLoading && (
                                <div className="flex items-center justify-center py-10 text-gray-500">
                                    <span className="material-symbols-outlined animate-spin mr-2" aria-hidden="true">progress_activity</span>
                                    Loading conversations...
                                </div>
                            )}

                            {!chatLoading && recentConversations.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true">chat_bubble_outline</span>
                                    <p className="text-gray-500 dark:text-gray-500 font-medium">No conversations yet.</p>
                                    <button
                                        onClick={() => navigate('/chat')}
                                        className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors"
                                    >
                                        Start a Conversation
                                    </button>
                                </div>
                            )}

                            {recentConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    id={`conv-${conv.id}`}
                                    onClick={() => handleConversationClick(conv)}
                                    className="group relative flex items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left w-full"
                                    aria-label={`Chat with ${conv.name}: ${conv.lastMessage}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar
                                            src={conv.avatar}
                                            name={conv.name}
                                            username={conv.avatarUsername}
                                            userId={conv.participantId}
                                            size="size-14"
                                        />
                                        {conv.online && (
                                            <span
                                                aria-label="Online"
                                                className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"
                                            />
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                                {conv.name}
                                            </h3>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md flex-shrink-0 ml-2">
                                                {formatRelativeTime(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium">
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                    {conv.unread > 0 && (
                                        <span
                                            aria-label={`${conv.unread} unread`}
                                            className="size-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center ml-3 flex-shrink-0"
                                        >
                                            {conv.unread}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Mood + Contacts */}
                    <div className="flex flex-col gap-8">
                        {/* Mood Widget — FE-10: Wired to API */}
                        <div className="bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 rounded-3xl p-6 border border-primary/10 dark:border-primary/20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Mood</h2>
                                <button
                                    onClick={() => navigate('/mood-zone')}
                                    aria-label="View mood history"
                                    className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors"
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-500 mb-4">
                                How are you feeling right now?
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {MOODS.map(({ key, label, emoji }) => (
                                    <button
                                        key={key}
                                        id={`mood-${key}`}
                                        aria-pressed={selectedMood === key}
                                        onClick={() => handleMoodSelect(key)}
                                        disabled={moodLogging}
                                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl shadow-sm border-2 transition-all group text-xs font-bold
                                            ${selectedMood === key
                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                : 'border-transparent hover:border-primary/30 bg-white dark:bg-gray-800'}`}
                                    >
                                        <span className={`text-2xl ${selectedMood !== key ? 'grayscale group-hover:grayscale-0' : ''} transition-all`}>
                                            {emoji}
                                        </span>
                                        <span className={selectedMood === key ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}>
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Online Contacts */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="size-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                                    Online Now
                                </h2>
                                <Link
                                    to="/contacts"
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    All contacts
                                </Link>
                            </div>

                            {/* Show online contacts from conversations */}
                            {conversations.filter(c => c.online).length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
                                    No contacts online right now.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {conversations.filter(c => c.online).slice(0, 4).map(conv => (
                                        <li
                                            key={conv.id}
                                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-xl transition-colors"
                                        >
                                            <Avatar
                                                src={conv.avatar}
                                                name={conv.name}
                                                username={conv.avatarUsername}
                                                userId={conv.participantId}
                                                size="size-10"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{conv.name}</p>
                                                <p className="text-xs text-green-600 dark:text-green-400">Online</p>
                                            </div>
                                            <button
                                                onClick={() => handleConversationClick(conv)}
                                                aria-label={`Message ${conv.name}`}
                                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg" aria-hidden="true">chat</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Link
                                to="/contacts"
                                className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg" aria-hidden="true">person_add</span>
                                Add Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
