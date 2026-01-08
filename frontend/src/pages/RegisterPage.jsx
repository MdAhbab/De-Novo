import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col selection:bg-primary/30">
            {/* Skip Link for Accessibility */}
            <a className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg" href="#main-content">Skip to content</a>

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-glow">
                            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>accessibility_new</span>
                        </div>
                        <Link to="/" className="text-xl font-bold tracking-tight">De-Novo</Link>
                    </div>
                    {/* Top Actions */}
                    <div className="flex items-center gap-3">
                        <button aria-label="Enable Voice Guidance" className="hidden md:flex group relative items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-primary hover:bg-primary-dark transition-all text-white font-bold shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            <span className="material-symbols-outlined mr-2 group-hover:animate-pulse">record_voice_over</span>
                            <span className="truncate">Voice Guidance</span>
                        </button>
                        <button aria-label="Settings" className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 gap-8 items-start relative">
                {/* Main Content (Wizard) */}
                <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-6" id="main-content">
                    {/* Progress Indicator */}
                    <nav aria-label="Registration Progress" className="w-full">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Step 2 of 4</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">Disability Needs</h2>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Next: Accessibility Settings</p>
                                </div>
                            </div>
                            {/* Progress Bar Visual */}
                            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                <div className="h-full bg-primary w-1/4"></div> {/* Step 1 */}
                                <div className="h-full bg-primary w-1/4 animate-pulse"></div> {/* Step 2 (Active) */}
                                <div className="h-full bg-transparent w-2/4"></div> {/* Remaining */}
                            </div>
                        </div>
                    </nav>

                    {/* Card Container */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 p-6 md:p-10 transition-colors duration-200">
                        <div className="mb-8">
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Help us customize De-Novo for you. Select all that apply so we can optimize the interface immediately.
                            </p>
                        </div>

                        {/* Selection Grid */}
                        <form aria-label="Disability Selection Form" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Option 1: Visual */}
                            <label className="relative group cursor-pointer">
                                <input className="peer sr-only" name="disability" type="checkbox" value="visual" />
                                <div className="h-full p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <span className="material-symbols-outlined text-3xl">visibility</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:group-[]:bg-primary peer-checked:group-[]:border-primary flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:group-[]:opacity-100">check</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Visual Impairment</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Optimizes for screen readers, high contrast, and larger typography.</p>
                                    </div>
                                </div>
                                {/* Custom check indicator overlay */}
                                <div className="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-transparent peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                </div>
                            </label>

                            {/* Option 2: Hearing */}
                            <label className="relative group cursor-pointer">
                                <input className="peer sr-only" name="disability" type="checkbox" value="hearing" />
                                <div className="h-full p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                            <span className="material-symbols-outlined text-3xl">hearing_disabled</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Hearing Impairment</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Enables auto-captions, visual alerts, and sign language interpreter badges.</p>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-transparent peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                </div>
                            </label>

                            {/* Option 3: Speech */}
                            <label className="relative group cursor-pointer">
                                <input className="peer sr-only" name="disability" type="checkbox" value="speech" />
                                <div className="h-full p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                            <span className="material-symbols-outlined text-3xl">record_voice_over</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Speech Impairment</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Prioritizes text-to-speech tools and quick-response phrasing banks.</p>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-transparent peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                </div>
                            </label>

                            {/* Option 4: None/Ally */}
                            <label className="relative group cursor-pointer">
                                <input className="peer sr-only" name="disability" type="checkbox" value="ally" />
                                <div className="h-full p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                            <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">None / Ally</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">I am joining to support, connect, or assist the community.</p>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-transparent peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                </div>
                            </label>
                        </form>

                        {/* Action Buttons */}
                        <div className="mt-10 flex flex-col-reverse md:flex-row gap-4 justify-between items-center">
                            <button className="w-full md:w-auto px-8 h-14 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all">
                                Back
                            </button>
                            <button className="w-full md:w-auto px-10 h-14 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg hover:shadow-xl focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2">
                                <span>Continue to Settings</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Contextual Help (Screen Reader) */}
                    <div aria-live="polite" className="sr-only" role="status">
                        Currently on step 2 of 4: Disability Needs Selection. Please select one or more options.
                    </div>
                </main>

                {/* Persistent Accessibility Sidebar (Desktop) */}
                <aside className="hidden lg:block w-72 sticky top-28 self-start bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                        <span className="material-symbols-outlined">accessibility</span>
                        <h3 className="font-bold text-sm uppercase tracking-wider">Quick Access</h3>
                    </div>
                    <div className="flex flex-col gap-8">
                        {/* Text Size */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="font-size">Font Size</label>
                                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">100%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400">A</span>
                                <input aria-label="Adjust font size" id="font-size" max="200" min="100" step="10" type="range" defaultValue="100" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">A</span>
                            </div>
                        </div>
                        {/* Contrast Toggle */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">High Contrast</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input className="sr-only peer" type="checkbox" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Increases the contrast between text and background colors for easier reading.
                            </p>
                        </div>
                        {/* TTS Speed */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="tts-speed">TTS Speed</label>
                                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">1x</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-sm">tornado</span>
                                <input aria-label="Adjust Text to Speech speed" id="tts-speed" max="2" min="0.5" step="0.25" type="range" defaultValue="1" />
                                <span className="material-symbols-outlined text-slate-900 dark:text-white text-sm">hive</span>
                            </div>
                        </div>
                    </div>
                    {/* Need Help? */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">help</span>
                            <span>Need assistance?</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default RegisterPage;
