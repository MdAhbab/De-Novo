import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    // State to track selected options (for better interactive check/styling)
    const [selected, setSelected] = useState([]);

    const toggleSelection = (value) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(item => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display min-h-screen flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
            {/* Background Ambience (Consistent with Login) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] z-0"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] z-0"></div>
            </div>

            {/* Skip Link for Accessibility */}
            <a className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg" href="#main-content">Skip to content</a>

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-all duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white group">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-white/10 rounded-xl flex items-center justify-center text-primary dark:text-white border border-primary/20 transition-transform group-hover:scale-105">
                            <span className="material-symbols-outlined text-2xl">accessibility_new</span>
                        </div>
                        <Link to="/" className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">De-Novo</Link>
                    </div>
                    {/* Top Actions */}
                    <div className="flex items-center gap-3">
                        <button aria-label="Enable Voice Guidance" className="hidden md:flex group relative items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold transition-all">
                            <span className="material-symbols-outlined mr-2 text-xl">record_voice_over</span>
                            <span className="text-sm">Voice Guidance</span>
                        </button>
                        <button aria-label="Settings" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 gap-8 items-start relative z-10">
                {/* Main Content (Wizard) */}
                <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-6" id="main-content">
                    {/* Progress Indicator */}
                    <nav aria-label="Registration Progress" className="w-full mb-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">Step 2 of 4</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">Disability Needs.</h2>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Next: <span className="text-slate-900 dark:text-white font-bold">Accessibility Settings</span></p>
                                </div>
                            </div>
                            {/* Progress Bar Visual */}
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-primary w-1/4"></div> {/* Step 1 */}
                                <div className="h-full bg-primary w-1/4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                </div> {/* Step 2 (Active) */}
                                <div className="h-full bg-transparent w-2/4"></div> {/* Remaining */}
                            </div>
                        </div>
                    </nav>

                    {/* Card Container */}
                    <div className="bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 md:p-10 transition-colors duration-200">
                        <div className="mb-8">
                            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
                                Help us customize De-Novo for you. Select all that apply so we can optimize the interface immediately.
                            </p>
                        </div>

                        {/* Selection Grid */}
                        <form aria-label="Disability Selection Form" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Reusable Option Card logic */}
                            {[
                                { id: 'visual', icon: 'visibility', title: 'Visual Impairment', desc: 'Optimizes for screen readers, high contrast, and larger typography.', color: 'blue' },
                                { id: 'hearing', icon: 'hearing_disabled', title: 'Hearing Impairment', desc: 'Enables auto-captions, visual alerts, and sign language interpreter badges.', color: 'purple' },
                                { id: 'speech', icon: 'record_voice_over', title: 'Speech Impairment', desc: 'Prioritizes text-to-speech tools and quick-response phrasing banks.', color: 'orange' },
                                { id: 'ally', icon: 'volunteer_activism', title: 'None / Ally', desc: 'I am joining to support, connect, or assist the community.', color: 'emerald' }
                            ].map((option) => (
                                <label key={option.id} className="relative group cursor-pointer">
                                    <input
                                        className="peer sr-only"
                                        name="disability"
                                        type="checkbox"
                                        value={option.id}
                                        checked={selected.includes(option.id)}
                                        onChange={() => toggleSelection(option.id)}
                                    />
                                    <div className={`h-full p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-4 relative overflow-hidden ${selected.includes(option.id)
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                                        }`}>
                                        <div className="flex justify-between items-start z-10">
                                            <div className={`p-3 rounded-xl ${selected.includes(option.id) ? 'bg-white dark:bg-white/10 text-primary' : `bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-600 dark:text-${option.color}-400`
                                                }`}>
                                                <span className="material-symbols-outlined text-3xl">{option.icon}</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected.includes(option.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {selected.includes(option.id) && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                                            </div>
                                        </div>
                                        <div className="z-10">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{option.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{option.desc}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </form>

                        {/* Action Buttons */}
                        <div className="mt-10 flex flex-col-reverse md:flex-row gap-4 justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full md:w-auto px-8 h-14 rounded-xl font-bold text-base text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back
                            </button>
                            <button className="w-full md:w-auto px-10 h-14 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                <span>Continue</span>
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
                <aside className="hidden lg:block w-80 sticky top-28 self-start">
                    <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-soft border border-white/50 dark:border-slate-700/50 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined text-xl">accessibility</span>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Quick Access</h3>
                        </div>
                        <div className="flex flex-col gap-8">
                            {/* Text Size */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="font-size">Font Size</label>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">100%</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-slate-400 px-2">A</span>
                                    <input className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" aria-label="Adjust font size" id="font-size" max="200" min="100" step="10" type="range" defaultValue="100" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-white px-2">A</span>
                                </div>
                            </div>
                            {/* Contrast Toggle */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">High Contrast</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input className="sr-only peer" type="checkbox" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Increases distinction between light and dark colors.
                                </p>
                            </div>
                            {/* TTS Speed */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="tts-speed">TTS Speed</label>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">1.0x</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-slate-400 text-sm px-1">slow_motion_video</span>
                                    <input className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" aria-label="Adjust Text to Speech speed" id="tts-speed" max="2" min="0.5" step="0.25" type="range" defaultValue="1" />
                                    <span className="material-symbols-outlined text-slate-900 dark:text-white text-sm px-1">speed</span>
                                </div>
                            </div>
                        </div>
                        {/* Need Help? */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                                <span className="material-symbols-outlined text-lg">support_agent</span>
                                <span>Get live support</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default RegisterPage;
