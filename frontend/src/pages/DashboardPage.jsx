import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Dynamic Date Formatting
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }).format(today);

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111827] dark:text-gray-100 font-display min-h-screen flex flex-col overflow-x-hidden">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="px-6 lg:px-10 py-4 flex items-center justify-between gap-6">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3 text-primary dark:text-primary hover:opacity-80 transition-opacity focus:rounded-lg p-1">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">hearing_disabled</span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">De-Novo</h1>
                        </Link>
                    </div>
                    {/* Search Bar (Hidden on mobile, visible on tablet+) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <label className="relative w-full group">
                            <span className="sr-only">Search contacts or messages</span>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                            </div>
                            <input className="block w-full pl-10 pr-3 py-2.5 border-2 border-transparent bg-gray-100 dark:bg-gray-800 rounded-xl leading-5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-0 sm:text-sm transition-colors" placeholder="Search..." type="text" />
                        </label>
                    </div>
                    {/* Navigation Actions */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <nav className="hidden lg:flex items-center gap-6">
                            <Link to="/dashboard" className="text-sm font-bold text-primary flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined icon-filled">home</span>
                                <span>Home</span>
                            </Link>
                            <Link to="/chat" className="text-sm font-medium text-gray-600 dark:text-gray-400 flex flex-col items-center gap-1 p-2 rounded-lg hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined">chat_bubble</span>
                                <span>Chats</span>
                            </Link>
                            <Link to="/mood-zone" className="text-sm font-medium text-gray-600 dark:text-gray-400 flex flex-col items-center gap-1 p-2 rounded-lg hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined">sentiment_satisfied</span>
                                <span>Mood</span>
                            </Link>
                        </nav>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>
                        <div className="flex items-center gap-3">
                            <button aria-label="Notifications: 3 unread" className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800">
                                <span className="material-symbols-outlined text-2xl">notifications</span>
                                <span className="absolute top-2 right-2 size-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                            </button>
                            <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                                <div
                                    className="size-9 rounded-full bg-cover bg-center border border-gray-200"
                                    data-alt="Profile picture of Alex, smiling man with glasses"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCcw2TNdlOvJSoWCyuiusnj9v0LZPLjqgwsmM8Q3YjCJrDu5Eq6Bbdyric2bJmdsbKIs9Ov_8ZedrWScxrjMjxmfKfv5iuuvFfvGz4YusYwROzWzMDNQOeqc9K58XYQAb4ILopn383HVu1VpgVoGVDwf_oJ6dgoLwv5MRcuYc-QqvPQuCBwiQs1I0feOKbDmIaKnBuHAi3ZrYRXGGHG8cGalhKvS2a7McL70OGUVETRDz8r6ApW7BJSgC7jiBsQ3GWY4qA1gIl1f9Q')" }}
                                ></div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-primary">{user?.name || 'User'}</span>
                                <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                aria-label="Logout"
                                className="flex items-center gap-2 p-2 px-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors font-bold"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
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
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Good Morning, {user?.name?.split(' ')[0] || 'User'}
                            </h2>
                            <p className="text-lg text-primary dark:text-primary/80 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                                {formattedDate}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">info</span>
                            <span>System Update: High Contrast Mode Improved</span>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section aria-label="Quick Actions" className="mb-12">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined">bolt</span> Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Action 1 */}
                        <button className="group flex flex-col items-start justify-between h-40 p-6 bg-primary text-white rounded-2xl hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-md">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                <span className="material-symbols-outlined text-3xl">add_comment</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Start New Chat</span>
                        </button>
                        {/* Action 2 */}
                        <button className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm">
                            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-3 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                <span className="material-symbols-outlined text-3xl">mail</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">View Messages</span>
                        </button>
                        {/* Action 3 */}
                        <button className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm">
                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-3 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                                <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Mood Zone</span>
                        </button>
                        {/* Action 4 */}
                        <button className="group flex flex-col items-start justify-between h-40 p-6 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left shadow-sm">
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-3 rounded-xl group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                <span className="material-symbols-outlined text-3xl">settings_accessibility</span>
                            </div>
                            <span className="text-lg font-bold tracking-wide">Settings</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Recent Conversations */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined">history</span> Recent Conversations
                            </h3>
                            <button className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2 focus:outline-none focus:bg-yellow-200 dark:focus:bg-yellow-900 focus:text-black dark:focus:text-white rounded px-2">View All</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Chat Card 1 */}
                            <button className="group relative flex items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left w-full">
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="size-16 rounded-full bg-cover bg-center border-2 border-gray-100 dark:border-gray-600"
                                        data-alt="Profile picture of Sarah"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBiG2oUqPWOLbKy5j6azXBriBqVflIABKyiv19n-YEAFLoQamprcOcMjV4MtcFtBF2XU8uT9-xhiYTZD60MFHJWyqrSOrmUs_Lwyh4xZfBi8BHv-rIYHujwZnm_C9rGiYRRzqL70Pk1SXAWulWDO8WPV2crBLgdCXkUENtdtpa7FSV7vL-eetPSxffC7j2gl2ail4rnqDzXE4zEac0vmry8R61yBUAjFb5w5aYj6na6PltxkJWsvW4-hE3UDmOIUYXMcP8b7ByzSn0')" }}
                                    ></div>
                                    <span aria-label="Online" className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
                                </div>
                                <div className="ml-5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">Sarah Jenkins</h4>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">10:42 AM</span>
                                    </div>
                                    <p className="text-base text-gray-600 dark:text-gray-300 truncate font-medium">
                                        <span className="text-primary font-bold">You:</span> Did you see the new accessibility update?
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 ml-4 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                            {/* Chat Card 2 */}
                            <button className="group relative flex items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left w-full">
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="size-16 rounded-full bg-cover bg-center border-2 border-gray-100 dark:border-gray-600"
                                        data-alt="Profile picture of Michael"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBheAuQ-tH2yPQshWjsJXqEPkWaWVL2dwieZSYi0gIAIJ9Q_oNsQq3yKrK8YbUrJYnGSB_QT3KHgxKy9ojRuAKjpssdu5_Rg0YWkCDIR0rNTYtjDKeCSEx7hG48hPWmHFwK7zo8brDSC8ZNza0dZ-TIaGJZtUmWSIRaCB0X7LJm9fg_j3oDUF4VRkEHuZ5eA3fnG7UvKNxudawBuSHq06rK4zYgwHmJMSK-3BL63dUB6V2HQX05c4MjRMfRJMKNQy3wWEJpQc3ks7Q')" }}
                                    ></div>
                                    <span aria-label="Offline" className="absolute bottom-0 right-0 size-4 bg-gray-400 border-2 border-white dark:border-surface-dark rounded-full"></span>
                                </div>
                                <div className="ml-5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">Michael Chen</h4>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Yesterday</span>
                                    </div>
                                    <p className="text-base text-gray-900 dark:text-white font-bold truncate">
                                        Looking forward to the meeting on Friday!
                                    </p>
                                </div>
                                <div className="size-3 bg-primary rounded-full ml-4"></div>
                            </button>
                            {/* Chat Card 3 */}
                            <button className="group relative flex items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all focus:ring-4 focus:ring-primary/40 focus:outline-none text-left w-full">
                                <div className="relative flex-shrink-0">
                                    <div aria-label="Group Chat Icon" className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/10">
                                        <span className="material-symbols-outlined text-3xl">groups</span>
                                    </div>
                                </div>
                                <div className="ml-5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">Design Team</h4>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Mon</span>
                                    </div>
                                    <p className="text-base text-gray-600 dark:text-gray-300 truncate font-medium">
                                        <span className="font-bold text-gray-900 dark:text-white">Emma:</span> Please review the latest mockups.
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 ml-4 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    {/* Right Column: Mood & Friends */}
                    <div className="flex flex-col gap-8">
                        {/* Mood Widget */}
                        <div className="bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 rounded-3xl p-6 border border-primary/10 dark:border-primary/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Mood</h3>
                                <button aria-label="Edit Mood Settings" className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">How are you feeling right now?</p>
                            <div className="grid grid-cols-3 gap-3">
                                <button aria-label="Set mood to Happy" className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-transparent hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all group">
                                    <span className="text-3xl grayscale group-hover:grayscale-0 group-focus:grayscale-0 transition-all">😄</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Happy</span>
                                </button>
                                <button aria-label="Current mood: Calm" aria-pressed="true" className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-primary ring-2 ring-primary/20 transition-all group">
                                    <span className="text-3xl">😌</span>
                                    <span className="text-xs font-bold text-primary">Calm</span>
                                </button>
                                <button aria-label="Set mood to Tired" className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-transparent hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all group">
                                    <span className="text-3xl grayscale group-hover:grayscale-0 group-focus:grayscale-0 transition-all">😴</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tired</span>
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-center font-medium text-gray-600 dark:text-gray-300">
                                    Your status is visible to <span className="text-primary font-bold">Friends Only</span>
                                </p>
                            </div>
                        </div>
                        {/* Online Friends */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="size-3 bg-green-500 rounded-full animate-pulse"></span> Online Friends
                                </h3>
                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-600 dark:text-gray-400">4 Active</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-xl transition-colors" tabIndex="0">
                                    <div
                                        className="size-12 rounded-full bg-cover bg-center"
                                        data-alt="Portrait of Anita"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAgoh3sGXT46uXHachlw9saDoAQPDmhPRUJFNH_hXUMuHW8SpFO1Fwt_pJdafX8H_BbB71rXJ6_D6bEbGC7DV4AG0uTlfcBneAcqJ7LKvuIaoNCKXFjD2ODMWg4pWC4FLLX0qiNb4_AzKBucJcVEYSGP3hy6RNRf2uJgbv-26L_4U8tIJlRzPHcYJ0GTTuWt--PvwhA4F8Yd3vDKydygyDBWmxFx1P5iFpXtBPeVy07j-A6zbgFpBYSraeav9m2FuY_QEILqZnL6To')" }}
                                    ></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary">Anita Roy</p>
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">volume_off</span> Muted Mode
                                        </p>
                                    </div>
                                    <button aria-label="Message Anita" className="p-2 text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-700 rounded-full">
                                        <span className="material-symbols-outlined">chat</span>
                                    </button>
                                </li>
                                {/* ... Other friends ... */}
                                <li className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-xl transition-colors" tabIndex="0">
                                    <div
                                        className="size-12 rounded-full bg-cover bg-center"
                                        data-alt="Portrait of David"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAl-8f5IJqkGdko8NOBseYQD35X0kZ1WKJqqFhsHTl2OaLXpaL-DpcyDTd6oGNEXSQBvjeW6GswvT1-z1adYfb8wDLnLjigoX-iNfG6mFPQijGsRrsRvycxOzsUN2StSEpogS-jbL6IJKQ1ftXfiNj6syBAgPTbGZnxXWT8NbZrRsEhK1G6oY6ONkqx2KHdl6ACWgsQ_ghASTqI-6x-_gc6CnjBfuOUEq_VV3Rj5gfB2VcbgFT5rSXmRPSODMlKBnBzhxPXnP9wzRU')" }}
                                    ></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary">David Kim</p>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Typing...</p>
                                    </div>
                                    <button aria-label="Message David" className="p-2 text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-700 rounded-full">
                                        <span className="material-symbols-outlined">chat</span>
                                    </button>
                                </li>
                            </ul>
                            <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">person_add</span> Invite Friend
                            </button>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default DashboardPage;
