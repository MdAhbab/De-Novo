import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AccessibilityPage = () => {
    // Local state for demonstration of UI interactivity
    const [fontSize, setFontSize] = useState(18);
    const [theme, setTheme] = useState('system');
    const [highContrast, setHighContrast] = useState(false);
    const [colorFilter, setColorFilter] = useState('none');
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [voiceModel, setVoiceModel] = useState('Sarah (English US) - Natural');
    const [speed, setSpeed] = useState(1.0);
    const [pitch, setPitch] = useState(50); // Normalized 0-100
    const [volume, setVolume] = useState(80);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden transition-colors duration-300">
            {/* Side Navigation */}
            <aside className="hidden lg:flex flex-col w-72 h-full border-r border-[#e6f3f4] dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 z-20 transition-colors duration-300">
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-8">
                        {/* Profile Summary */}
                        <div className="flex gap-4 items-center p-3 rounded-xl bg-background-light dark:bg-gray-800/50">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm shrink-0 border-2 border-primary/20"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDc86v5lBouPLxXOoHo_s2p7JcbT9efcdT5AkDfMB7fwRxHa-txRuM1p9wagcq4SafC8sVmdG9qjwSs1okbWgKDpLu7o_nQgEP3Tp9sGhFlq8czLKgrsy8YnpD3SnD8ZvnLxan6msKZ5GNg81_Jzw2d1Uc25f4pjgsdtb6be9a11E9rIjHzhIJv0IPDYOObkgtQwT3lfPC2sxZ1QgwdhhwbEVux0238_D-vanQkngmxxUfUOqafph0xdtr-9pqxVQRh5s92lKWeLso")' }}
                            ></div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-text-main dark:text-white text-base font-bold leading-tight truncate">EchoReach User</h1>
                                <p className="text-primary text-xs font-semibold uppercase tracking-wider">Online</p>
                            </div>
                        </div>
                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-2">
                            <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-main dark:text-gray-300 hover:bg-background-light dark:hover:bg-gray-800 transition-colors group">
                                <span className="material-symbols-outlined text-[24px] text-gray-500 group-hover:text-primary transition-colors">home</span>
                                <span className="text-sm font-semibold">Home</span>
                            </Link>
                            <Link to="/chat" className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-main dark:text-gray-300 hover:bg-background-light dark:hover:bg-gray-800 transition-colors group">
                                <span className="material-symbols-outlined text-[24px] text-gray-500 group-hover:text-primary transition-colors">chat_bubble</span>
                                <span className="text-sm font-semibold">Messages</span>
                                <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                            </Link>
                            <Link to="#" className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-main dark:text-gray-300 hover:bg-background-light dark:hover:bg-gray-800 transition-colors group">
                                <span className="material-symbols-outlined text-[24px] text-gray-500 group-hover:text-primary transition-colors">groups</span>
                                <span className="text-sm font-semibold">Communities</span>
                            </Link>
                            {/* Active State */}
                            <Link to="/accessibility" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary dark:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[24px] fill-1">settings_accessibility</span>
                                <span className="text-sm font-bold">Accessibility</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-main dark:text-gray-300 hover:bg-background-light dark:hover:bg-gray-800 transition-colors group">
                                <span className="material-symbols-outlined text-[24px] text-gray-500 group-hover:text-primary transition-colors">person</span>
                                <span className="text-sm font-semibold">Profile</span>
                            </Link>
                        </nav>
                    </div>
                    <div className="px-2">
                        <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[#4596a1] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="flex-shrink-0 flex items-center justify-between border-b border-[#e6f3f4] dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-primary">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">accessibility_new</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main dark:text-white leading-tight">Accessibility Preferences</h2>
                                <p className="text-sm text-[#4596a1] hidden sm:block">Customize your experience for vision, hearing, and motor needs.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="hidden sm:flex h-10 px-6 items-center justify-center rounded-xl bg-background-light dark:bg-gray-800 text-text-main dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Reset Defaults
                        </button>
                        <button className="flex h-10 px-6 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-[#006c7a] transition-all active:scale-95">
                            Save Changes
                        </button>
                    </div>
                </header>

                {/* Scrollable Settings */}
                <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 lg:p-8 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                        {/* LEFT COLUMN: Settings Controls */}
                        <div className="xl:col-span-8 flex flex-col gap-8">

                            {/* VISUAL SETTINGS */}
                            <section className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary">visibility</span>
                                    <h3 className="text-lg font-bold text-text-main dark:text-white">Visual Experience</h3>
                                </div>
                                {/* Card: Typography & Theme */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#e6f3f4] dark:border-gray-800 shadow-sm transition-colors duration-300">
                                    {/* Font Size Slider */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-sm font-bold text-text-main dark:text-white">Base Font Size</label>
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{fontSize}px</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-medium text-gray-400">Aa</span>
                                            <input
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                max="32"
                                                min="14"
                                                type="range"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            />
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">Aa</span>
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-[#e6f3f4] dark:bg-gray-800 mb-6"></div>
                                    {/* Theme & Contrast Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Theme Selector */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Interface Theme</label>
                                            <div className="flex bg-background-light dark:bg-gray-800 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setTheme('light')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold text-primary dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    Light
                                                </button>
                                                <button
                                                    onClick={() => setTheme('dark')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold text-primary dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    Dark
                                                </button>
                                                <button
                                                    onClick={() => setTheme('system')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold text-primary dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    System
                                                </button>
                                            </div>
                                        </div>
                                        {/* High Contrast Toggle */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-[#e6f3f4] dark:border-gray-800 bg-background-light/50 dark:bg-gray-800/30">
                                            <div>
                                                <p className="text-sm font-bold text-text-main dark:text-white">High Contrast</p>
                                                <p className="text-xs text-[#4596a1] mt-0.5">Enhance borders & text</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={highContrast}
                                                    onChange={(e) => setHighContrast(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* Card: Color Blindness */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#e6f3f4] dark:border-gray-800 shadow-sm transition-colors duration-300">
                                    <label className="block text-sm font-bold text-text-main dark:text-white mb-4">Color Correction Filter</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {[
                                            { id: 'none', label: 'None', gradient: 'from-red-500 via-green-500 to-blue-500' },
                                            { id: 'protanopia', label: 'Protanopia', gradient: 'from-yellow-500 via-gray-400 to-blue-600' },
                                            { id: 'deuteranopia', label: 'Deuteranopia', gradient: 'from-orange-400 via-blue-200 to-blue-700' },
                                            { id: 'tritanopia', label: 'Tritanopia', gradient: 'from-red-400 via-cyan-200 to-cyan-600' },
                                            { id: 'grayscale', label: 'Grayscale', gradient: 'from-gray-400 via-gray-300 to-gray-600' },
                                        ].map((filter) => (
                                            <label key={filter.id} className="cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="color-filter"
                                                    className="peer sr-only"
                                                    checked={colorFilter === filter.id}
                                                    onChange={() => setColorFilter(filter.id)}
                                                />
                                                <div className="p-3 rounded-xl border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex flex-col items-center gap-2">
                                                    <div className={`size-8 rounded-full bg-gradient-to-br ${filter.gradient} shadow-sm`}></div>
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 peer-checked:text-primary">{filter.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* AUDIO SETTINGS */}
                            <section className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-2 pt-4">
                                    <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                    <h3 className="text-lg font-bold text-text-main dark:text-white">Text-to-Speech (TTS)</h3>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#e6f3f4] dark:border-gray-800 shadow-sm transition-colors duration-300">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Voice Selection */}
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Voice Model</label>
                                            <div className="relative">
                                                <select
                                                    value={voiceModel}
                                                    onChange={(e) => setVoiceModel(e.target.value)}
                                                    className="w-full h-12 rounded-xl border-[#e6f3f4] dark:border-gray-600 bg-background-light dark:bg-gray-800 text-text-main dark:text-white pl-4 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                                >
                                                    <option>Sarah (English US) - Natural</option>
                                                    <option>David (English UK) - Natural</option>
                                                    <option>Elena (Spanish) - Standard</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                            </div>
                                            <button className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors font-bold text-sm">
                                                <span className="material-symbols-outlined">play_circle</span>
                                                Play Test Sample
                                            </button>
                                        </div>
                                        {/* Sliders */}
                                        <div className="flex-1 flex flex-col gap-6">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold uppercase text-gray-500">Speed</label>
                                                    <span className="text-xs font-mono text-primary">{speed}x</span>
                                                </div>
                                                <input
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    type="range"
                                                    min="0.5" max="2.0" step="0.1"
                                                    value={speed}
                                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold uppercase text-gray-500">Pitch</label>
                                                    <span className="text-xs font-mono text-primary">{pitch > 50 ? 'High' : pitch < 50 ? 'Low' : 'Normal'}</span>
                                                </div>
                                                <input
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    type="range"
                                                    value={pitch}
                                                    onChange={(e) => setPitch(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold uppercase text-gray-500">Volume</label>
                                                    <span className="text-xs font-mono text-primary">{volume}%</span>
                                                </div>
                                                <input
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    type="range"
                                                    value={volume}
                                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="h-10"></div> {/* Bottom spacer */}
                        </div>

                        {/* RIGHT COLUMN: Sticky Preview Pane */}
                        <div className="hidden xl:block xl:col-span-4">
                            <div className="sticky top-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Live Preview</h4>
                                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">Read-only</span>
                                </div>
                                {/* Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-primary/20 p-6 shadow-lg relative overflow-hidden group transition-colors duration-300">
                                    {/* Sample Content */}
                                    <div className="relative z-10 flex flex-col gap-4 transition-all duration-300" style={{ fontSize: `${fontSize}px` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="space-y-1">
                                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        </div>
                                        <div className="p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                                            <p className="text-text-main dark:text-white font-display leading-relaxed">
                                                The quick brown fox jumps over the lazy dog.
                                            </p>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <div className="h-8 w-20 bg-primary rounded-lg opacity-90"></div>
                                            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        </div>
                                    </div>
                                    {/* Decorative overlay */}
                                    <div className="absolute -right-10 -bottom-10 size-40 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                                </div>
                                {/* Quick Actions Summary */}
                                <div className="bg-primary text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="material-symbols-outlined">auto_fix_high</span>
                                            <h4 className="font-bold text-lg">Quick Actions</h4>
                                        </div>
                                        <ul className="space-y-3 text-sm font-medium">
                                            <li className="flex items-center gap-3 opacity-90">
                                                <span className="material-symbols-outlined text-[20px]">text_increase</span>
                                                <span>Large Text {fontSize > 18 ? 'enabled' : 'disabled'}</span>
                                            </li>
                                            <li className="flex items-center gap-3 opacity-90">
                                                <span className="material-symbols-outlined text-[20px]">contrast</span>
                                                <span>High Contrast {highContrast ? 'on' : 'off'}</span>
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => {
                                                setFontSize(18);
                                                setHighContrast(false);
                                            }}
                                            className="mt-6 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Undo Last Change
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <span className="material-symbols-outlined text-9xl">accessibility</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccessibilityPage;
