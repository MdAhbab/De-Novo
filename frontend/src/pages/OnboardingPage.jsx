import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { settings, updateSettings } = useAccessibility();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Communication without barriers.",
            desc: "De-Novo bridges the gap between different sensory experiences. Whether you sign, speak, or type, our platform translates your preferred method into what your friend needs to receive.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMX_q9_SJRAr0FGvYD5dVFIPHG9K1T6zDSE0ZvOlbtqSAosSf0xaHiK9stfhyag8R7jVwoGY6e5vSkDcdbqDELKCOaDZ0fxpFeRReJobg87DJ4ADZudFJNASk53d8dKaWKhY2cuywyquULCB8EQit23-xnVhmZo4tDU_wZ9NzxnR6j6ZDURQ34zij6gjXV9qSfnABlK9kxsUDvthMnp1Jx3Tlbegb0vdAFIp0_VCIHwoLOPNt0F2Sy9wlGzJh5cNuszXuFcYPNWJ8",
            step: "Step 1 of 4"
        },
        {
            title: "Your Sensory Profile.",
            desc: "Customize how you perceive content. Adjust colors, contrast, and audio settings to match your personal sensory needs for a comfortable experience.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDc86v5lBouPLxXOoHo_s2p7JcbT9efcdT5AkDfMB7fwRxHa-txRuM1p9wagcq4SafC8sVmdG9qjwSs1okbWgKDpLu7o_nQgEP3Tp9sGhFlq8czLKgrsy8YnpD3SnD8ZvnLxan6msKZ5GNg81_Jzw2d1Uc25f4pjgsdtb6be9a11E9rIjHzhIJv0IPDYOObkgtQwT3lfPC2sxZ1QgwdhhwbEVux0238_D-vanQkngmxxUfUOqafph0xdtr-9pqxVQRh5s92lKWeLso", // Using placeholder/reused image for now as unique one wasn't in snippet
            step: "Step 2 of 4"
        },
        {
            title: "Real-time Translation.",
            desc: "Speak and we'll type. Sign and we'll voice. Type and we'll sign. Our AI-powered translation ensures smooth conversation flow.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMX_q9_SJRAr0FGvYD5dVFIPHG9K1T6zDSE0ZvOlbtqSAosSf0xaHiK9stfhyag8R7jVwoGY6e5vSkDcdbqDELKCOaDZ0fxpFeRReJobg87DJ4ADZudFJNASk53d8dKaWKhY2cuywyquULCB8EQit23-xnVhmZo4tDU_wZ9NzxnR6j6ZDURQ34zij6gjXV9qSfnABlK9kxsUDvthMnp1Jx3Tlbegb0vdAFIp0_VCIHwoLOPNt0F2Sy9wlGzJh5cNuszXuFcYPNWJ8", // Reused
            step: "Step 3 of 4"
        },
        {
            title: "Safe Community.",
            desc: "Join communities that understand you. Connect with others in a safe, moderated environment designed for inclusivity.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDc86v5lBouPLxXOoHo_s2p7JcbT9efcdT5AkDfMB7fwRxHa-txRuM1p9wagcq4SafC8sVmdG9qjwSs1okbWgKDpLu7o_nQgEP3Tp9sGhFlq8czLKgrsy8YnpD3SnD8ZvnLxan6msKZ5GNg81_Jzw2d1Uc25f4pjgsdtb6be9a11E9rIjHzhIJv0IPDYOObkgtQwT3lfPC2sxZ1QgwdhhwbEVux0238_D-vanQkngmxxUfUOqafph0xdtr-9pqxVQRh5s92lKWeLso", // Reused
            step: "Step 4 of 4"
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
            {/* Top Navigation */}
            <header className="w-full border-b border-[#e6f3f4] dark:border-gray-800 bg-white dark:bg-gray-900 px-10 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
                <div className="flex items-center gap-4 text-[#0c1b1d] dark:text-white">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-4xl">diversity_1</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight">De-Novo</h2>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Voice Narration Toggle */}
                    <button
                        aria-label="Toggle Voice Narration"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e6f3f4] dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-sm transition hover:bg-[#d0eef1] dark:hover:bg-gray-700 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-primary">record_voice_over</span>
                        <span>Voice Narration: On</span>
                    </button>
                    <button
                        onClick={handleSkip}
                        aria-label="Skip Tutorial"
                        className="text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
                    >
                        Skip Tutorial
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[1280px] mx-auto px-6 py-8">
                {/* Welcome Heading */}
                <section className="w-full max-w-[960px] mb-8 text-center md:text-left">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-[#0c1b1d] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Welcome to De-Novo</h1>
                        <p className="text-[#4596a1] text-lg md:text-xl font-normal leading-normal max-w-2xl">Let's set up your experience to match your sensory needs before we begin.</p>
                    </div>
                </section>

                <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Accessibility Calibration */}
                    <aside className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                        {/* Calibration Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e6f3f4] dark:border-gray-800 transition-colors duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-[#e6f3f4] dark:border-gray-800 pb-2">
                                <span className="material-symbols-outlined text-primary">accessibility_new</span>
                                <h3 className="text-[#0c1b1d] dark:text-white text-lg font-bold">Calibration</h3>
                            </div>
                            {/* Checklist items */}
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-5 h-5 rounded border-[#cde6ea] dark:border-gray-600 text-primary focus:ring-primary focus:ring-offset-2 dark:bg-gray-800"
                                    />
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Text-to-Speech (TTS)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-[#cde6ea] dark:border-gray-600 text-primary focus:ring-primary focus:ring-offset-2 dark:bg-gray-800"
                                    />
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Speech-to-Text (STT)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-[#cde6ea] dark:border-gray-600 text-primary focus:ring-primary focus:ring-offset-2 dark:bg-gray-800"
                                    />
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">High Contrast Mode</span>
                                </label>
                            </div>
                            {/* Audio Test Button */}
                            <div className="mt-6">
                                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#e6f3f4] dark:bg-gray-800 hover:bg-[#d0eef1] dark:hover:bg-gray-700 text-[#0c1b1d] dark:text-white font-bold h-12 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                    <span className="material-symbols-outlined">volume_up</span>
                                    <span>Test Audio Output</span>
                                </button>
                            </div>
                        </div>

                        {/* Font Size Adjustment */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e6f3f4] dark:border-gray-800 transition-colors duration-300">
                            <h3 className="text-[#0c1b1d] dark:text-white text-sm uppercase tracking-wide font-bold mb-4 opacity-70">Text Size</h3>
                            <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 transition-colors duration-300">
                                <button aria-label="Decrease Font Size" className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm text-gray-500 dark:text-gray-400 transition-colors">
                                    <span className="material-symbols-outlined text-sm">text_decrease</span>
                                </button>
                                <div className="flex-1 px-2">
                                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-1/2"></div>
                                    </div>
                                </div>
                                <button aria-label="Increase Font Size" className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm text-gray-900 dark:text-white transition-colors">
                                    <span className="material-symbols-outlined text-xl">text_increase</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column: Interactive Feature Carousel */}
                    <section className="lg:col-span-8 order-1 lg:order-2">
                        <div className="relative w-full h-full min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e6f3f4] dark:border-gray-800 overflow-hidden flex flex-col transition-colors duration-300">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800 z-10">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                                ></div>
                            </div>

                            {/* Slide Content */}
                            <div className="flex-1 flex flex-col">
                                {/* Image Area */}
                                <div className="relative h-64 md:h-80 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden group">
                                    <img
                                        alt={slides[currentSlide].title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        src={slides[currentSlide].img}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                        <div className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm mb-1 inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">verified</span>
                                            {slides[currentSlide].step}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                                    <div className="animate-fade-in key={currentSlide}">
                                        <h2 className="text-3xl font-black text-[#0c1b1d] dark:text-white mb-4">{slides[currentSlide].title}</h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {slides[currentSlide].desc}
                                        </p>
                                    </div>

                                    {/* Navigation Controls */}
                                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex gap-2">
                                            {slides.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentSlide(index)}
                                                    className={`block w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                    aria-label={`Go to slide ${index + 1}`}
                                                ></button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={currentSlide === slides.length - 1 ? handleSkip : nextSlide}
                                            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-[#007a8a] text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-primary/30"
                                        >
                                            <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next Feature'}</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slide Navigation Arrows (Desktop) */}
                            <button
                                onClick={prevSlide}
                                className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg items-center justify-center text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 transition"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg items-center justify-center text-primary hover:bg-white dark:hover:bg-gray-700 transition"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Bottom CTA Strip */}
                <div className="w-full max-w-[960px] mt-12 flex flex-col md:flex-row items-center justify-between p-6 bg-[#e6f3f4] dark:bg-gray-800/50 rounded-2xl gap-4 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-primary shadow-sm">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0c1b1d] dark:text-white text-lg">Ready to explore on your own?</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">You can skip the tutorial and start your personalized tour.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="whitespace-nowrap px-6 py-3 bg-white dark:bg-gray-700 border-2 border-primary text-primary dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                    >
                        Take a Tour
                    </button>
                </div>
            </main>
        </div>
    );
};

export default OnboardingPage;
