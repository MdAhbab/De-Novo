import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display text-[#0c1b1d] dark:text-white">
            {/* TopNavBar Component (Adapted) */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e6f3f4] dark:border-b-gray-800 bg-white dark:bg-[#111827] px-6 md:px-10 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#0c1b1d] dark:text-white">
                    <div className="size-8 bg-[#e6f3f4] dark:bg-gray-800 rounded-lg flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">diversity_3</span>
                    </div>
                    <Link to="/" className="text-lg md:text-xl font-bold leading-tight tracking-[-0.015em]">De-Novo</Link>
                </div>
                <div className="flex items-center gap-4">
                    {/* Accessibility Controls Group */}
                    <div className="hidden md:flex items-center gap-3 bg-[#f8fbfc] dark:bg-gray-900 border border-[#e6f3f4] dark:border-gray-700 px-3 py-1.5 rounded-full">
                        <span className="text-sm font-bold text-[#4596a1] dark:text-gray-400">High Contrast</span>
                        {/* ActionPanel Toggle reused here */}
                        <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#e6f3f4] dark:bg-gray-700 p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#008c9e] transition-colors">
                            <div className="h-full w-[27px] rounded-full bg-white shadow-sm" style={{ boxShadow: "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px" }}></div>
                            <input aria-label="Enable high contrast mode" className="invisible absolute" type="checkbox" />
                        </label>
                    </div>
                    <button aria-label="Text to speech settings" className="flex items-center justify-center size-10 overflow-hidden rounded-xl bg-[#e6f3f4] dark:bg-gray-800 text-[#0c1b1d] dark:text-white hover:bg-[#d1e9ec] dark:hover:bg-gray-700 transition-colors">
                        <span className="material-symbols-outlined">volume_up</span>
                    </button>
                </div>
            </header>

            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 justify-center py-5 md:py-10 px-4 md:px-0">
                    <div className="layout-content-container flex flex-col md:flex-row max-w-[1280px] w-full flex-1 gap-8 md:gap-16 items-center md:items-start md:px-10">
                        {/* Left Column: Visual Context (Hidden on small screens) */}
                        <div className="hidden md:flex flex-1 w-full h-full min-h-[600px] flex-col justify-end p-10 rounded-3xl relative overflow-hidden bg-[#008c9e]">
                            {/* Using CSS gradient for texture instead of image for base */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00606d] to-[#008c9e] opacity-90"></div>
                            {/* Image with data-alt */}
                            <img
                                alt="Background texture"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuejiCeemeI1805sDDnnslDGOHD0oZEkb2TmMtl4EEUU6hEV1AK0GDcqhavKx2vi9zmnlmQ7n-TczI5G__Ex_2Co2r2TwY-bxMVjR4WAfqKugp36zAq2G5NZSIRW1lqNpCNG_BgRGPHVypypn3XBDOoLdV7Sfh0Vsyb6WV-XzlDpLOstEoF3jjIRK8JPg0P-0xx8qT9N323Yi89WZNnPGwGlzyuaxTLFT9biXZUhTmZSYYGL0o9RhKK8ENLFz6_Ppk2KSJB-7wpWg"
                            />
                            <div className="relative z-10 text-white max-w-md">
                                <div className="mb-4 size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-white">record_voice_over</span>
                                </div>
                                <h2 className="text-4xl font-black tracking-tight mb-4">Empowering every voice.</h2>
                                <p className="text-lg opacity-90 font-medium leading-relaxed">Join a platform built from the ground up for inclusive communication. Experience real-time sign-to-text and voice-to-visual feedback.</p>
                            </div>
                        </div>

                        {/* Right Column: Login Form */}
                        <div className="flex flex-1 w-full max-w-[560px] flex-col justify-center">
                            {/* PageHeading Component */}
                            <div className="flex flex-col gap-3 mb-8">
                                <p className="text-[#0c1b1d] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Welcome Back</p>
                                <p className="text-[#4596a1] dark:text-gray-400 text-lg font-normal leading-normal">Sign in to access your dashboard</p>
                            </div>

                            {/* Priority Access Methods */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button className="group flex flex-col items-center justify-center gap-3 p-5 h-32 rounded-2xl border-2 border-[#008c9e] bg-[#f0f9fa] dark:bg-[#008c9e]/10 dark:border-[#008c9e] hover:bg-[#e0f5f7] dark:hover:bg-[#008c9e]/20 transition-all focus:ring-4 focus:ring-[#008c9e]/30">
                                    <span className="material-symbols-outlined text-4xl text-[#008c9e] dark:text-[#4fd1e3] group-hover:scale-110 transition-transform">mic</span>
                                    <span className="text-[#008c9e] dark:text-[#4fd1e3] font-bold">Voice Login</span>
                                </button>
                                <button className="group flex flex-col items-center justify-center gap-3 p-5 h-32 rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all focus:ring-4 focus:ring-gray-200">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 group-hover:text-[#008c9e] transition-colors">fingerprint</span>
                                    <span className="text-gray-600 dark:text-gray-300 font-bold">Biometric</span>
                                </button>
                            </div>

                            <div className="relative flex py-2 items-center mb-8">
                                <div className="flex-grow border-t border-[#e6f3f4] dark:border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-bold uppercase">Or login with email</span>
                                <div className="flex-grow border-t border-[#e6f3f4] dark:border-gray-700"></div>
                            </div>

                            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                                {/* TextField Component 1 (Email) */}
                                <label className="flex flex-col w-full">
                                    <p className="text-[#0c1b1d] dark:text-white text-base font-bold leading-normal pb-2">Email Address</p>
                                    <div className="relative">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0c1b1d] dark:text-white border-2 border-[#cde6ea] dark:border-gray-700 bg-[#f8fbfc] dark:bg-gray-800 focus:border-[#008c9e] focus:ring-0 h-16 placeholder:text-[#4596a1] p-[15px] pl-[50px] text-lg font-normal leading-normal transition-colors"
                                            placeholder="name@example.com"
                                            defaultValue=""
                                        />
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4596a1]">mail</span>
                                    </div>
                                </label>

                                {/* TextField Component 2 (Password) */}
                                <label className="flex flex-col w-full group/password">
                                    <div className="flex justify-between items-center pb-2">
                                        <p className="text-[#0c1b1d] dark:text-white text-base font-bold leading-normal">Password</p>
                                        <a className="text-sm font-bold text-[#008c9e] hover:underline" href="#">Forgot password?</a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0c1b1d] dark:text-white border-2 border-[#cde6ea] dark:border-gray-700 bg-[#f8fbfc] dark:bg-gray-800 focus:border-[#008c9e] focus:ring-0 h-16 placeholder:text-[#4596a1] p-[15px] pl-[50px] text-lg font-normal leading-normal transition-colors"
                                            placeholder="Enter your password"
                                            type="password"
                                            defaultValue=""
                                        />
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4596a1]">lock</span>
                                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4596a1] hover:text-[#008c9e] p-1 rounded-full hover:bg-[#e6f3f4] dark:hover:bg-gray-700 transition-colors" type="button">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </div>
                                    {/* Error Feedback Region (Accessibility requirement) */}
                                    <div aria-live="polite" className="mt-2 hidden group-focus-within/password:flex items-center gap-2 text-amber-600 dark:text-amber-500 animate-pulse" role="alert">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        <span className="text-sm font-semibold">Caps lock is on</span>
                                    </div>
                                </label>

                                {/* Remember Me */}
                                <label className="flex items-center gap-3 cursor-pointer py-2 w-max">
                                    <div className="relative flex items-center">
                                        <input className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-[#cde6ea] dark:border-gray-600 bg-white dark:bg-gray-800 checked:border-[#008c9e] checked:bg-[#008c9e] transition-all" type="checkbox" />
                                        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-base font-bold">check</span>
                                        </span>
                                    </div>
                                    <span className="text-[#0c1b1d] dark:text-gray-300 text-base font-medium">Remember me</span>
                                </label>

                                {/* Primary Action */}
                                <Link to="/dashboard" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-[#008c9e] hover:bg-[#007a8a] text-white gap-2 text-lg font-bold leading-normal tracking-[0.015em] px-5 shadow-lg shadow-[#008c9e]/20 transition-all active:scale-[0.99] text-center">
                                    <span className="truncate">Sign In</span>
                                    <span className="material-symbols-outlined" data-icon="ArrowRight" data-size="24px">arrow_forward</span>
                                </Link>
                            </form>

                            {/* Social Login */}
                            <div className="mt-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[#cde6ea] dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#f8fbfc] dark:hover:bg-gray-700 transition-colors">
                                        <span className="font-bold text-[#0c1b1d] dark:text-white">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[#cde6ea] dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#f8fbfc] dark:hover:bg-gray-700 transition-colors">
                                        <span className="font-bold text-[#0c1b1d] dark:text-white">Apple</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-[#4596a1] dark:text-gray-400 text-base font-medium">
                                    Don't have an account? <Link to="/register" className="text-[#008c9e] font-bold hover:underline">Create Account</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
