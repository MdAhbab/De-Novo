import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & Nav */}
                        <div className="flex items-center gap-12">
                            <Link to="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
                                <span className="material-symbols-outlined text-4xl">hearing_disabled</span>
                                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">EchoReach</span>
                            </Link>
                            <nav className="hidden md:flex items-center gap-8">
                                <Link to="/profile" className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-primary pb-0.5">Profile</Link>
                                <Link to="/chat" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Messages</Link>
                                <Link to="/" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Community</Link>
                                <Link to="/settings" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Settings</Link>
                            </nav>
                        </div>
                        {/* Search & Profile */}
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex items-center bg-background-light dark:bg-slate-800 rounded-xl px-4 py-2.5 w-64 border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                <span className="material-symbols-outlined text-primary">search</span>
                                <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-white placeholder-slate-400 ml-2" placeholder="Find people..." type="text" />
                            </div>
                            <button className="relative group">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors"
                                    data-alt="User profile thumbnail showing a smiling woman"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA07sfPhxrtl3JXxr10_qtChlBy9nu_vFqTpVgj5wAIcqg9MkUa62gFsoL7yoamOW6Mu40guTrkq4dt7Td_EPoJwu0tvc4idefWS3gor06C4CAH04YHVRbwj0UP5RyD8hgyxXbcSvhozaTeIwf0-Uq7Da0KLKqeKDDv1a58w5vbv_9gEYSDZvdyvkgEnWpUqt96fuhb2Mg6Zawy086d5ZHjKSVPazffmaW5oGeuGwOgspAGLyCPjhpTDMkWp1VIclTMvNYQ9jc_YDs')" }}
                                ></div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Page Heading */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-primary text-lg font-medium max-w-2xl">Manage your identity, accessibility badges, and how others connect with you.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                            <span>View Public</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Primary Info & Bio (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Profile Card */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                            {/* Decorative Background Blob */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                {/* Avatar Section */}
                                <div className="flex-shrink-0 relative group/avatar mx-auto md:mx-0">
                                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg relative">
                                        <img
                                            alt="Profile picture of Alex M. looking confident"
                                            className="w-full h-full object-cover"
                                            data-alt="Profile picture of Alex M."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJUDvwpvoEQnVNywuYCSbL_bhFVoCdLnmAFnKvjJ2bVr4sPEvSvqLU0q3vYtGy6IsRNhClq9X7K6vMksm_8p_F1yeVDamwC3YgEl_r8s9TURP45jB4UgvO44vM-40_oEsykfKUdjDeM3qePUPG_aHy1ljJZQyvZt6XTMxw-JgpXRuAWMUF3fMx67-iFH5RpZSQDxMsTSVC9H-2KRrFUMKNAtUK4hFhDYVt9FNZk4vu3I_KGhfFY-iQLW6fcZhGO2nlQn6gcMcdVmc"
                                        />
                                        {/* Edit Overlay */}
                                        <button aria-label="Change profile photo" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity focus:opacity-100 cursor-pointer">
                                            <span className="material-symbols-outlined text-white text-4xl">photo_camera</span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 right-2 md:right-4">
                                        <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 flex items-center justify-center" title="Online">
                                            <span className="sr-only">Status: Online</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Alex M.</h2>
                                                <button aria-label="Edit name" className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">@alex_inclusive_design</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                                            <span className="material-symbols-outlined text-lg fill-current">check_circle</span>
                                            <span>Online</span>
                                        </div>
                                    </div>

                                    {/* Bio Input */}
                                    <div className="relative group/bio mb-6">
                                        <textarea
                                            aria-label="Edit Bio"
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl p-4 text-slate-700 dark:text-slate-300 resize-none focus:ring-2 focus:ring-primary text-base leading-relaxed min-h-[120px]"
                                            defaultValue="Graphic designer passionate about inclusive tech. I prefer text-based communication and use screen readers occasionally, so please describe images when possible."
                                        />
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/bio:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-slate-400">145/200</span>
                                        </div>
                                    </div>

                                    {/* Accessibility Badges */}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Accessibility & Preferences</p>
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default">
                                                <span className="material-symbols-outlined text-[20px]">sign_language</span>
                                                <span className="font-bold text-sm">ASL Fluent</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default">
                                                <span className="material-symbols-outlined text-[20px]">keyboard</span>
                                                <span className="font-bold text-sm">Text Preferred</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default">
                                                <span className="material-symbols-outlined text-[20px]">contrast</span>
                                                <span className="font-bold text-sm">High Contrast</span>
                                            </div>
                                            <button aria-label="Add badge" className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Activity Status Control */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-2xl">schedule</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Status</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Show others when you are available for real-time chat.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked className="sr-only peer" type="checkbox" />
                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-primary"></div>
                                <span className="ml-3 text-sm font-bold text-slate-900 dark:text-white peer-checked:text-primary">Visible</span>
                            </label>
                        </section>

                        {/* Languages */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">translate</span>
                                    Languages Spoken
                                </h3>
                                <button className="text-sm font-bold text-primary hover:underline">Edit</button>
                            </div>
                            <div className="flex gap-4 text-slate-700 dark:text-slate-300">
                                <div className="flex flex-col">
                                    <span className="font-bold">English</span>
                                    <span className="text-sm text-slate-500">Native (Written)</span>
                                </div>
                                <div className="w-px bg-slate-200 dark:bg-slate-700 h-10"></div>
                                <div className="flex flex-col">
                                    <span className="font-bold">ASL</span>
                                    <span className="text-sm text-slate-500">Fluent</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Contact & Actions (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* QR Code Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect Instantly</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Let friends scan this to find you.</p>
                            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6">
                                <img
                                    alt="QR Code linking to Alex M's profile"
                                    className="w-40 h-40 mix-blend-multiply opacity-90"
                                    data-alt="Black and white QR code pattern"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9W_t8kh0SlwsGMI6YyyB22MLFlHpCGWBfjxESzqNdfGLi2CAm2Sw-KP_oCkEbFL8BPgHLtKfs_6exgMfv5lSBzVlyspQMVM4ZG0TBv0Hi_it9shxigUMZxW5vKDm4J7wQzGinM9xrZmHdK_QcdaxBTm4N8OO3Fe9-ilRzgzpzvdkO8A9b83xVRZyK2isZPgNHDtMyOAQ2hbmTD6V0-RkrCAG8QnFhT04J24am9RRHUTAVDAD243dSsOaI7ixX1WyPIj13PiiysT4"
                                />
                            </div>
                            <div className="flex gap-3 w-full">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                    Share
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">contact_page</span>
                                Contact Info
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <span className="material-symbols-outlined">mail</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">alex.m@example.com</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary">
                                        <span className="material-symbols-outlined">content_copy</span>
                                    </button>
                                </li>
                                <li className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <span className="material-symbols-outlined">alternate_email</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Social</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">@alex_m_design</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary">
                                        <span className="material-symbols-outlined">open_in_new</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Danger / Account Actions */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Account Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-900/10 dark:hover:border-red-900/30 group transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">block</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400">Block User</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-red-400 text-sm">arrow_forward_ios</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-amber-50 hover:border-amber-100 dark:hover:bg-amber-900/10 dark:hover:border-amber-900/30 group transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-500 transition-colors">flag</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Report Profile</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-amber-400 text-sm">arrow_forward_ios</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="mt-auto py-8 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">© 2023 EchoReach. Designing for everyone.</p>
            </footer>
        </div>
    );
};

export default ProfilePage;
