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
        <div className="h-screen w-full flex bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Left Side - Visual & Branding (Adapted for Register) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-dark to-primary opacity-90 z-10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 animate-float"></div>
                <div className="absolute bottom-12 right-12 w-80 h-80 bg-white/10 rounded-full blur-3xl z-0 animate-float-delayed"></div>

                {/* Content Overlay */}
                <div className="relative z-20 text-white max-w-lg">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                            <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">De-Novo</h1>
                    </div>
                    <h2 className="text-5xl font-black mb-6 leading-tight">Join the Community.</h2>
                    <p className="text-lg text-white/90 font-medium leading-relaxed mb-8">
                        Create an account to personalize your experience. Access tools designed for your specific needs.
                    </p>

                    {/* Feature List */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg"><span className="material-symbols-outlined text-white">accessibility_new</span></div>
                            <span className="font-bold text-lg">Customized Accessibility</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg"><span className="material-symbols-outlined text-white">sync_saved_locally</span></div>
                            <span className="font-bold text-lg">Save Your Preferences</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg"><span className="material-symbols-outlined text-white">group_add</span></div>
                            <span className="font-bold text-lg">Connect with Peers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Wizard */}
            <div className="w-full lg:w-1/2 flex flex-col relative bg-white dark:bg-gray-900 overflow-y-auto">
                {/* Top Navigation / Mobile Header */}
                <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-gray-800 lg:border-none">
                    <div className="lg:hidden flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        <span className="text-xl font-bold">De-Novo</span>
                    </div>
                    <div className="hidden lg:block"></div> {/* Spacer for desktop layout balance if needed */}
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm font-bold text-slate-500 hidden md:block">Already have an account?</span>
                        <Link to="/login" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-2xl mx-auto p-6 md:p-12 flex flex-col justify-center">
                    {/* Main Content (Wizard) */}
                    <main className="flex flex-col gap-6" id="main-content">
                        {/* Progress Indicator */}
                        <nav aria-label="Registration Progress" className="w-full mb-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">Step 2 of 4</p>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Disability Needs.</h2>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next: <span className="text-slate-900 dark:text-white font-bold">Accessibility Settings</span></p>
                                    </div>
                                </div>
                                {/* Progress Bar Visual */}
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-primary w-1/4"></div> {/* Step 1 */}
                                    <div className="h-full bg-primary w-1/4 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                    </div> {/* Step 2 (Active) */}
                                    <div className="h-full bg-transparent w-2/4"></div> {/* Remaining */}
                                </div>
                            </div>
                        </nav>

                        <div className="mb-6">
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                Help us customize De-Novo for you. Select all that apply so we can optimize the interface immediately.
                            </p>
                        </div>

                        {/* Selection Grid */}
                        <form aria-label="Disability Selection Form" className="grid grid-cols-1 gap-4" onSubmit={(e) => e.preventDefault()}>
                            {/* Reusable Option Card logic - Compact Layout */}
                            {[
                                { id: 'visual', icon: 'visibility', title: 'Visual Impairment', desc: 'Screen readers, high contrast, larger typography.', color: 'blue' },
                                { id: 'hearing', icon: 'hearing_disabled', title: 'Hearing Impairment', desc: 'Auto-captions, visual alerts, interpreter badges.', color: 'purple' },
                                { id: 'speech', icon: 'record_voice_over', title: 'Speech Impairment', desc: 'Text-to-speech tools, quick-response phrasing.', color: 'orange' },
                                { id: 'ally', icon: 'volunteer_activism', title: 'None / Ally', desc: 'I am here to support and connect.', color: 'emerald' }
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
                                    <div className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 relative overflow-hidden ${selected.includes(option.id)
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                                        }`}>
                                        <div className={`p-2 rounded-lg shrink-0 ${selected.includes(option.id) ? 'bg-white dark:bg-white/10 text-primary' : `bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-600 dark:text-${option.color}-400`
                                            }`}>
                                            <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{option.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-1 sm:line-clamp-none">{option.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${selected.includes(option.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {selected.includes(option.id) && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </form>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full md:w-auto px-6 h-12 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back
                            </button>
                            <button className="w-full md:w-auto md:ml-auto px-8 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                <span>Continue</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
