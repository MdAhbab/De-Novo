import React from 'react';
import { Link } from 'react-router-dom';

const MoodZonePage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">psychology_alt</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">De-Novo <span className="text-primary font-normal text-sm ml-1">Mood Zone</span></h1>
                        </Link>
                        <nav className="hidden md:flex gap-8">
                            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Home</Link>
                            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Community</Link>
                            <Link to="/mood-zone" className="text-sm font-medium text-primary font-bold">Mood Zone</Link>
                            <Link to="#" className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Resources</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <button aria-label="Toggle High Contrast" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full">
                                <span className="material-symbols-outlined text-[20px]">contrast</span>
                            </button>
                            <div
                                className="h-9 w-9 rounded-full bg-cover bg-center border-2 border-slate-100 dark:border-gray-700"
                                data-alt="User profile avatar showing a smiling person"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXEAdWOezD0ihSjc_ZFfw5iUfcK6Gr4jiWja6_v1QeEGw7gSwyFXtqvY-2SE4hy2gaUzHsHmDizCpZ-FhHEoX3WE6PVwSkaxICyWQ3P7_gJHDdqh-vzl3Qy4c89h3e6fc0nU4NuG7dUTCH6dquTyoYvCndjuSWiJRga5MDImEI1MJwckkxCx6UdsFVUAhPuedFQVkRjUcs9NUOFGVClH5DmaMxSspPngfudWzBB5hei5O56_Dp4Q6CLjqqfFUjCxX-0oHzHFpW9Uw')" }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left Column: Check-in & Input (3 cols) */}
                    <section aria-labelledby="check-in-heading" className="lg:col-span-3 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold mb-1" id="check-in-heading">Check-in</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">How are you feeling right now?</p>
                            {/* Mood Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {/* Mood Item: Happy */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl mb-2 icon-filled">sentiment_very_satisfied</span>
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Happy</span>
                                </button>
                                {/* Mood Item: Anxious */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl mb-2 icon-filled">sentiment_worried</span>
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Anxious</span>
                                </button>
                                {/* Mood Item: Tired */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl mb-2 icon-filled">bedtime</span>
                                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Tired</span>
                                </button>
                                {/* Mood Item: Angry */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl mb-2 icon-filled">mood_bad</span>
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">Angry</span>
                                </button>
                                {/* Mood Item: Calm */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl mb-2 icon-filled">self_improvement</span>
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Calm</span>
                                </button>
                                {/* Mood Item: Sad */}
                                <button className="group flex flex-col items-center justify-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500">
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-3xl mb-2 icon-filled">sentiment_dissatisfied</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sad</span>
                                </button>
                            </div>
                            {/* Voice Input */}
                            <div className="pt-4 border-t border-slate-100 dark:border-gray-800">
                                <button className="w-full flex items-center justify-center gap-3 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-900 dark:text-white p-4 rounded-xl border border-slate-200 dark:border-gray-700 transition-colors group">
                                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">mic</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold">Voice Input</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">Record your thoughts</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Center Column: Sensory Experience (6 cols) */}
                    <section aria-labelledby="experience-heading" className="lg:col-span-6 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-gray-800 h-full flex flex-col">
                            {/* Tabs */}
                            <div className="p-4 flex gap-2 overflow-x-auto">
                                <button className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 transition-transform active:scale-95 whitespace-nowrap">
                                    Nature Sounds
                                </button>
                                <button className="px-5 py-2.5 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors whitespace-nowrap">
                                    Music
                                </button>
                                <button className="px-5 py-2.5 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors whitespace-nowrap">
                                    White Noise
                                </button>
                                <button className="px-5 py-2.5 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors whitespace-nowrap">
                                    Frequencies
                                </button>
                            </div>
                            {/* Visualizer Area */}
                            <div className="relative flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl m-2 min-h-[300px] flex items-center justify-center overflow-hidden border border-slate-100 dark:border-gray-700">
                                {/* Background Image Layer */}
                                <div
                                    className="absolute inset-0 opacity-10 dark:opacity-20 bg-cover bg-center"
                                    data-alt="Abstract calming forest pattern"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlYgfNhSZPsPj9RF86CeJj_abLQV3eL8-O1Kv5fHVMzJDjkSHqpP20-ez_oINCmCTXGvSVxcycxTvwY2ZnMpMhLSXZyULrKIZXRgAiqElLdBqrWqnhC7KsEaMg1bccao0-oL0cyOGi9qwtewSUtpQ5fvugjE_6TMfFZ3H3q9t1DsCVWea4xDajL-CYmkD_vWxpo6wiVqxfhdU__XWQh8-NKUT8XHzM3kM5Wo1JrpzOsBMT-LdcexU5IALxhNauEVRQHG4drg0oR18')" }}
                                ></div>
                                {/* Sound Wave Animation (CSS) */}
                                <div aria-label="Visual representation of sound waves playing" className="relative z-10 flex items-center justify-center gap-2 h-32 w-full max-w-md px-10">
                                    <div className="w-3 bg-primary rounded-full h-full animate-wave-1"></div>
                                    <div className="w-3 bg-primary/80 rounded-full h-full animate-wave-2"></div>
                                    <div className="w-3 bg-primary/60 rounded-full h-full animate-wave-3"></div>
                                    <div className="w-3 bg-primary/40 rounded-full h-full animate-wave-4"></div>
                                    <div className="w-3 bg-primary/80 rounded-full h-full animate-wave-5"></div>
                                    <div className="w-3 bg-primary/60 rounded-full h-full animate-wave-2"></div>
                                    <div className="w-3 bg-primary rounded-full h-full animate-wave-1"></div>
                                </div>
                                {/* Track Info Overlay */}
                                <div className="absolute bottom-6 left-6 z-20">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-12 w-12 rounded-lg bg-cover bg-center shadow-lg"
                                            data-alt="Album art for Forest Rain track"
                                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEsYLM6chr-ZFik5P6Lu1aP9_XPueUFQvRYYkd_CszaQPKZdfCgd_HftWjQ3xJVx0fJrFhlk4UYEvRc8vJx13J6ibR6QptusCAqLI7xIvudrjaOfe8XHjv2YaCgSLPUvcAgUqdjWtlN-aw7RHHHT7X1Il8rCQERZRHC0fpVkV6Pfpue5F0Qzf7nkduN6nhzHCrY-vsqCSVIJLiEhasHVP46HIfmKNKzFYUW4owJFmA27IagKUU1g8Rs--E5YcWxfmjU36KdeTNOuQ')" }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Forest Rain</h3>
                                            <p className="text-sm text-primary font-medium">Nature Sounds • 432Hz</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Timer Badge */}
                                <div className="absolute top-6 right-6 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-600 flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-primary text-sm">timer</span>
                                    <span className="text-sm font-bold font-mono">14:23</span>
                                </div>
                            </div>
                            {/* Player Controls */}
                            <div className="p-6">
                                {/* Progress Bar */}
                                <div aria-label="Audio progress" aria-valuemax="100" aria-valuemin="0" aria-valuenow="45" className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-1.5 mb-6 cursor-pointer group" role="slider">
                                    <div className="bg-primary h-1.5 rounded-full w-[45%] group-hover:bg-primary-dark transition-colors relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 shadow-md"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    {/* Main Playback */}
                                    <div className="flex items-center gap-6">
                                        <button aria-label="Previous track" className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors">
                                            <span className="material-symbols-outlined text-3xl">skip_previous</span>
                                        </button>
                                        <button aria-label="Pause" className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl icon-filled">pause</span>
                                        </button>
                                        <button aria-label="Next track" className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors">
                                            <span className="material-symbols-outlined text-3xl">skip_next</span>
                                        </button>
                                    </div>
                                    {/* Timer & Volume */}
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
                                        <div className="flex bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
                                            <button aria-label="Set timer for 5 minutes" className="px-3 py-1.5 text-xs font-semibold rounded bg-white dark:bg-gray-700 shadow-sm text-slate-800 dark:text-white">5m</button>
                                            <button aria-label="Set timer for 15 minutes" className="px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-400 transition-colors">15m</button>
                                            <button aria-label="Set timer for 30 minutes" className="px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-400 transition-colors">30m</button>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-symbols-outlined text-xl">volume_up</span>
                                            <div className="w-20 h-1 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="w-2/3 h-full bg-slate-400 dark:bg-gray-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Reflection & Recs (3 cols) */}
                    <section aria-labelledby="history-heading" className="lg:col-span-3 flex flex-col gap-6">
                        {/* Recommendation Widget */}
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent rounded-2xl p-6 border border-primary/20">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-lg text-primary-dark dark:text-primary">Recommended</h3>
                                <span className="material-symbols-outlined text-primary/60">auto_awesome</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                                Since you selected <strong className="text-slate-900 dark:text-white">Calm</strong>, try this breathing exercise to maintain your flow.
                            </p>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <span className="material-symbols-outlined">air</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">Box Breathing</h4>
                                    <p className="text-xs text-slate-500">4 min session</p>
                                </div>
                                <button aria-label="Play breathing exercise" className="ml-auto text-primary hover:bg-primary/10 rounded-full p-1">
                                    <span className="material-symbols-outlined">play_arrow</span>
                                </button>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-800 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg" id="history-heading">Journal</h3>
                                <button className="text-xs font-semibold text-primary hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {/* History Item */}
                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 pb-2 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-green-500"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Today, 9:00 AM</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-gray-200">Feeling Good</p>
                                        </div>
                                        <span className="material-symbols-outlined text-green-500 text-lg icon-filled">sentiment_very_satisfied</span>
                                    </div>
                                </div>
                                {/* History Item */}
                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 pb-2 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-amber-500"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Yesterday, 8:30 PM</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-gray-200">A bit Anxious</p>
                                        </div>
                                        <span className="material-symbols-outlined text-amber-500 text-lg icon-filled">sentiment_worried</span>
                                    </div>
                                </div>
                                {/* History Item */}
                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 pb-2 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-slate-400"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Yesterday, 2:15 PM</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-gray-200">Neutral</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 text-lg icon-filled">sentiment_neutral</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats/Summary Mini-Card */}
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-gray-700">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Weekly Mood Flow</h4>
                                <div aria-label="Bar chart showing weekly mood trends" className="flex items-end justify-between h-16 gap-1">
                                    <div className="w-full bg-green-200 dark:bg-green-900/40 rounded-t-sm h-[60%]" title="Mon"></div>
                                    <div className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-t-sm h-[40%]" title="Tue"></div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-t-sm h-[80%]" title="Wed"></div>
                                    <div className="w-full bg-green-200 dark:bg-green-900/40 rounded-t-sm h-[50%]" title="Thu"></div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm h-[30%]" title="Fri"></div>
                                    <div className="w-full bg-green-400 dark:bg-green-600 rounded-t-sm h-[90%]" title="Sat (Today)"></div>
                                    <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-t-sm h-[10%]" title="Sun"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MoodZonePage;
