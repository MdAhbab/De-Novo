import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
    // State for toggles
    const [peepToggle, setPeepToggle] = useState(true);
    const [blurToggle, setBlurToggle] = useState(false);

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display transition-colors duration-200">
            <div className="flex h-screen w-full overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="hidden md:flex flex-col w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark overflow-y-auto z-20">
                    {/* Brand */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <Link to="/" className="flex items-center gap-3 text-primary">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">De-Novo</h2>
                        </Link>
                    </div>
                    {/* User Profile Snippet */}
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-700">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm"
                                data-alt="Profile picture of Jane Doe"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAgZXrpGpf1rfCRN8jzLGRKkuq64dZXcue47ts0kc0vzBOerj1nMZ4KKFJQ35_7du3CaJ7ofRy0YFzCZ1xRaaa-afaXWz-rYneXCTKbQujqmVQGg26Ycsg8n65Fk4knBlcTrdz4R0eqjfDKBzVHsO1mXH_38NmzelKAYV54bqtPSfypzKAUE5bmUPbz3t7cYtVEa5BJW0121POXVEjK2a8X6AqZoM9eo_n3zkdcH_o8z8xfs8bCIVswXd1aqvvMpLK41luen9wb2XE')" }}
                            ></div>
                            <div className="flex flex-col overflow-hidden">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Jane Doe</h3>
                                <p className="text-primary text-xs font-medium truncate">ID: #8821 • Online</p>
                            </div>
                        </div>
                    </div>
                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 pb-4 space-y-2">
                        <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" href="#">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">account_circle</span>
                            <span className="font-bold text-sm">Account</span>
                        </a>
                        {/* Active Link */}
                        <a aria-current="page" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary transition-colors" href="#">
                            <span className="material-symbols-outlined text-2xl fill-current">shield_lock</span>
                            <span className="font-bold text-sm">Privacy & Security</span>
                        </a>
                        <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" href="#">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">notifications</span>
                            <span className="font-bold text-sm">Notifications</span>
                        </a>
                        <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" href="#">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">database</span>
                            <span className="font-bold text-sm">Data & Storage</span>
                        </a>
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                            <a className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" href="#">
                                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">help</span>
                                <span className="font-bold text-sm">Help & About</span>
                            </a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Mobile Header (Visible only on small screens) */}
                    <header className="md:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
                            <span className="font-bold text-lg">De-Novo</span>
                        </div>
                        <button className="p-2 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Breadcrumbs & Heading */}
                            <div className="space-y-4">
                                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <Link to="/settings" className="hover:text-primary transition-colors">Settings</Link>
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                    <span aria-current="page" className="text-primary">Privacy & Security</span>
                                </nav>
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Privacy & Security
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                                        Manage your digital safety tools, encryption keys, and blocking preferences.
                                    </p>
                                </div>
                            </div>

                            {/* E2E Encryption Banner */}
                            <section aria-label="Encryption Status" className="rounded-xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#00606e] opacity-90"></div>
                                <div
                                    className="bg-cover bg-center absolute inset-0 opacity-20 mix-blend-overlay"
                                    data-alt="Abstract secure network pattern"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB273mVlPn3G19thJ-3O4VW_RKlR6jt_06jqNxKZ9RSA-FPXpkq9-gZS_FIqL8kGJRYUVB4SVC60OqDoLNzJ2W64NtnwMRVJaLnzo0qfK3nnPitmswP9n7jKRfXkxDYgyEuIo_FJ49Prqt6J8AhBYKMmGMuljjhmJObDw3dK0FPaswml--vjuRU3ofF97H5euh_hgHaMU0-VnmOs7MF-8bM2AJRtz7E0rSdhTjt5EiGJ1GQmVLQH44HZSeCXgCZUWxZmDZE2vQkDtk')" }}
                                ></div>
                                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shrink-0">
                                            <span className="material-symbols-outlined text-white text-3xl">lock</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-white text-xl font-bold">End-to-End Encryption is Active</h3>
                                            <p className="text-white/90 text-sm md:text-base max-w-lg">
                                                Your messages and calls are secured. Only you and the recipient can read or listen to them. De-Novo cannot intercept your communications.
                                            </p>
                                        </div>
                                    </div>
                                    <button className="shrink-0 px-5 py-2.5 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-gray-50 focus:ring-4 focus:ring-white/30 transition-all text-sm">
                                        Verify Keys
                                    </button>
                                </div>
                            </section>

                            {/* Safety Tools Section */}
                            <section aria-labelledby="safety-tools-heading">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" id="safety-tools-heading">
                                    <span className="material-symbols-outlined text-primary">policy</span>
                                    Safety Tools
                                </h2>
                                <div className="grid gap-4">
                                    {/* Peeping Tom Detection */}
                                    <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="hidden sm:flex size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center text-orange-600 dark:text-orange-400">
                                                    <span className="material-symbols-outlined text-2xl">visibility_off</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Peeping Tom Detection</h3>
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">Beta</span>
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                                                        Uses your front camera to detect if someone is looking over your shoulder. If detected, the screen will automatically blur to protect your privacy.
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Toggle Switch */}
                                            <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input
                                                    checked={peepToggle}
                                                    onChange={() => setPeepToggle(!peepToggle)}
                                                    className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30"
                                                    id="peep-toggle"
                                                    name="peep-toggle"
                                                    type="checkbox"
                                                />
                                                <label
                                                    className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer ${peepToggle ? 'bg-primary' : 'bg-gray-300'}`}
                                                    htmlFor="peep-toggle"
                                                ></label>
                                            </div>
                                            <style>{`
                                                .toggle-checkbox:checked {
                                                    right: 0;
                                                    border-color: #008c9e;
                                                }
                                                .toggle-checkbox:not(:checked) {
                                                    right: 1.75rem; /* 7 * 0.25rem = 1.75rem approx, need to adjust based on w-14 (3.5rem) - w-7 (1.75rem) */
                                                    right: calc(100% - 1.75rem);
                                                }
                                                /* Adjusting standard toggle behavior simulation */
                                                #peep-toggle:checked {
                                                    right: 0;
                                                    border-color: #008c9e;
                                                }
                                                #peep-toggle {
                                                    right: auto;
                                                    left: 0;
                                                }
                                                #peep-toggle:checked {
                                                    left: auto;
                                                    right: 0;
                                                }
                                            `}</style>
                                        </div>
                                    </div>
                                    {/* Blur Sensitive Content */}
                                    <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="hidden sm:flex size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <span className="material-symbols-outlined text-2xl">blur_on</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Blur Sensitive Content</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                                                        Automatically blurs images and videos that may contain flashing lights or explicit content until you choose to view them.
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Toggle Switch */}
                                            <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input
                                                    checked={blurToggle}
                                                    onChange={() => setBlurToggle(!blurToggle)}
                                                    className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30"
                                                    id="blur-toggle"
                                                    name="blur-toggle"
                                                    type="checkbox"
                                                />
                                                <label
                                                    className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer ${blurToggle ? 'bg-primary' : 'bg-gray-300'}`}
                                                    htmlFor="blur-toggle"
                                                ></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Account Security Section */}
                            <section aria-labelledby="account-security-heading">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" id="account-security-heading">
                                    <span className="material-symbols-outlined text-primary">key</span>
                                    Account Security
                                </h2>
                                <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    {/* 2FA Item */}
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">
                                            Enable 2FA
                                        </button>
                                    </div>
                                    {/* Active Sessions Item */}
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Active Sessions</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">You are logged in on 2 other devices.</p>
                                        </div>
                                        <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                            Manage Devices
                                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                                        </button>
                                    </div>
                                    {/* Blocked Users Item */}
                                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                                                <span className="material-symbols-outlined">block</span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-primary transition-colors">Blocked Users</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">14 contacts blocked</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>
                            </section>

                            {/* Support Footer */}
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-4 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Need help with these settings?</p>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-primary hover:text-primary dark:hover:text-primary dark:text-gray-300 transition-all font-bold text-sm bg-transparent">
                                    <span className="material-symbols-outlined text-lg">support_agent</span>
                                    Contact Accessibility Support
                                </button>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">De-Novo Version 2.4.1 (Build 8821)</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
