import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark text-text-main font-display antialiased overflow-x-hidden">
            {/* Skip Navigation Link */}
            <a
                className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:font-bold focus:shadow-xl rounded-lg transition-all"
                href="#main-content"
            >
                Skip to main content
            </a>

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 w-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-3xl">accessibility_new</span>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-text-main dark:text-white">EchoReach</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
                            <a className="text-base font-semibold text-text-main dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors py-2" href="#features-heading">Features</a>
                            <a className="text-base font-semibold text-text-main dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors py-2" href="#testimonials-heading">Community</a>
                            <a className="text-base font-semibold text-text-main dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors py-2" href="#">Support</a>
                        </nav>

                        {/* CTA */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="hidden sm:block text-base font-bold text-primary hover:underline underline-offset-4 decoration-2"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                aria-label="Get Started with EchoReach"
                                className="flex items-center justify-center h-12 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-col w-full" id="main-content">
                {/* Hero Section */}
                <section aria-label="Introduction" className="relative w-full py-20 lg:py-32 overflow-hidden">
                    {/* Decorative background blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"></div>

                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Hero Content */}
                            <div className="flex flex-col gap-8 text-left max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    <span className="text-sm font-bold uppercase tracking-wide">Accessibility First</span>
                                </div>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-main dark:text-white leading-[1.1] tracking-tight">
                                    Communication <br />
                                    <span className="text-primary underline decoration-4 underline-offset-4 decoration-primary/30">Without Barriers</span>
                                </h1>
                                <p className="text-xl sm:text-2xl text-text-muted dark:text-gray-300 leading-relaxed max-w-lg">
                                    A secure social platform bridging the gap for the deaf, mute, and blind communities through adaptive technology.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    {/* Voice Announcement Simulation via title/aria */}
                                    <Link
                                        to="/register"
                                        aria-label="Join EchoReach, press to sign up"
                                        className="group relative flex items-center justify-center h-14 px-8 rounded-lg bg-primary hover:bg-primary-dark text-white text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105"
                                        title="Voice Announcement: Join EchoReach"
                                    >
                                        <span className="material-symbols-outlined mr-2 group-hover:animate-pulse">record_voice_over</span>
                                        Get Started
                                    </Link>
                                    <button className="flex items-center justify-center h-14 px-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main dark:text-white text-lg font-bold transition-all">
                                        Learn How It Works
                                    </button>
                                </div>
                            </div>

                            {/* Hero Visuals: Animated Senses */}
                            <div aria-hidden="true" className="relative flex justify-center items-center h-[400px] lg:h-[500px] w-full">
                                {/* Orbiting Circles visual */}
                                <div className="absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-full scale-75 opacity-50"></div>
                                <div className="absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-full scale-50 opacity-50"></div>

                                {/* Floating Icons */}
                                {/* Icon 1: Vision */}
                                <div className="absolute top-10 left-10 lg:left-20 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-2xl animate-float border border-gray-100 dark:border-gray-700">
                                    <span className="material-symbols-outlined text-6xl text-primary">visibility</span>
                                </div>
                                {/* Icon 2: Hearing */}
                                <div className="absolute bottom-20 right-10 lg:right-20 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-2xl animate-float-delayed border border-gray-100 dark:border-gray-700">
                                    <span className="material-symbols-outlined text-6xl text-primary">hearing</span>
                                </div>
                                {/* Icon 3: Speech */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary p-8 rounded-3xl shadow-2xl animate-pulse-slow z-10">
                                    <span className="material-symbols-outlined text-7xl text-white">chat_bubble</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section aria-labelledby="features-heading" className="w-full py-20 bg-surface-light dark:bg-surface-dark border-y border-gray-100 dark:border-gray-800">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main dark:text-white" id="features-heading">Empowering Features</h2>
                            <p className="text-lg text-text-muted dark:text-gray-400 max-w-3xl">Tools specifically engineered to make digital communication accessible, seamless, and human.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="group flex flex-col p-8 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">keyboard</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Text-to-Voice</h3>
                                <p className="text-text-muted dark:text-gray-400 leading-relaxed">Type freely using high-contrast inputs, and our engine speaks for you in a natural tone.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group flex flex-col p-8 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">mic</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Voice-to-Text</h3>
                                <p className="text-text-muted dark:text-gray-400 leading-relaxed">Real-time captions for every conversation. Read what others are saying instantly.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group flex flex-col p-8 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">mood</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Mood Zone</h3>
                                <p className="text-text-muted dark:text-gray-400 leading-relaxed">Express complex feelings with high-contrast, scalable emotive visuals and patterns.</p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group flex flex-col p-8 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">lock</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Secure Chat</h3>
                                <p className="text-text-muted dark:text-gray-400 leading-relaxed">Private, encrypted conversations ensuring your data and specific needs remain yours.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section aria-labelledby="testimonials-heading" className="w-full py-20 lg:py-32 bg-background-light dark:bg-background-dark">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main dark:text-white mb-4" id="testimonials-heading">Voices of the Community</h2>
                                <p className="text-lg text-text-muted dark:text-gray-400">Hear from the people who are redefining how they connect with the world.</p>
                            </div>
                            <div className="flex gap-4">
                                <button aria-label="Previous testimonial" className="flex items-center justify-center size-12 rounded-full border-2 border-gray-300 dark:border-gray-600 text-text-main dark:text-white hover:border-primary hover:text-primary transition-colors focus:ring-4">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <button aria-label="Next testimonial" className="flex items-center justify-center size-12 rounded-full border-2 border-gray-300 dark:border-gray-600 text-text-main dark:text-white hover:border-primary hover:text-primary transition-colors focus:ring-4">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Carousel Container */}
                        <div aria-label="Testimonials Carousel" className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="region">
                            {/* Card 1 */}
                            <div className="snap-start shrink-0 w-[85vw] sm:w-[400px] flex flex-col p-8 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="size-14 rounded-full bg-cover bg-center bg-no-repeat bg-gray-200"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlA8HIlrBNiQk7UMuTm_u7z-vToKurUREaH-n0UMTs3zmkR3eBS0beksQCmTYC1xmxJKbGgHihPV20dWULfqBzcBekhPYnQXeVslyRKgTCq1gyvD7ryKe9tUBo6rL20V9UteTcIFt1i9aH0r0SlBLFSWVj5kJLEfmzw1Xw5GXprytLgkXemmPha5N5gICJspEjby9bKx2zkVfABj14BkIoa_j5NwEOAhurYwN49R8rRcEiyFXnvMEXfId-_N5Bmh9gexqZeSqSWc0')" }}
                                    ></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main dark:text-white">Alex M.</h3>
                                        <p className="text-sm text-primary font-medium">Screen Reader User</p>
                                    </div>
                                </div>
                                <p className="text-lg text-text-muted dark:text-gray-300 italic leading-relaxed">"Finally, an app that understands how I navigate the world. The semantic structure is perfect for my screen reader."</p>
                                <div className="mt-auto pt-6 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined fill-current text-sm">star</span>
                                    ))}
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="snap-start shrink-0 w-[85vw] sm:w-[400px] flex flex-col p-8 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="size-14 rounded-full bg-cover bg-center bg-no-repeat bg-gray-200"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwXuc-E3-gK2bQJaUQX3DYe2PwkwCrPyKMpX26ifrCmwAX9S5CmM76VtvQU7hnXXQVKmkbbSPJVGLV5CwCfIeNxwOebv6hl68iqllwrw0FqlvvudOgQWbjyC63D2vUmxsKuYX8irZuWUXrvgyi0tIGpxf-hmoBqRKcgBtg_-3w7AKzsLwXvzHjKelPCCvtK0o7uGSAWzm8-XQsofRVVBHhKFPCXJPRe0NVFO69kqcr-oegn-mfVJWDHSBFTXUXtm0ZHNJNNUe4U2s')" }}
                                    ></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main dark:text-white">Jamie L.</h3>
                                        <p className="text-sm text-primary font-medium">ASL Native Signer</p>
                                    </div>
                                </div>
                                <p className="text-lg text-text-muted dark:text-gray-300 italic leading-relaxed">"The video quality for signing is unmatched. It doesn't lag or pixelate, which is critical for understanding nuance."</p>
                                <div className="mt-auto pt-6 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined fill-current text-sm">star</span>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="snap-start shrink-0 w-[85vw] sm:w-[400px] flex flex-col p-8 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="size-14 rounded-full bg-cover bg-center bg-no-repeat bg-gray-200"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9CPfxe6as3H8A8yF-3voQ2nS0XC-K_N4GgFUWZK2KQvQ6l9XD2wvQT9mrdIPfeIlG5aBQsbUq99rh1f6H7KkkaRhA3dF_GXTH-8OunDft1buevz9M36Fp9w_wYNPaFLcsIlV9A4o_MC0i1yhxDOeMGdoKTMDyvfsNKy_Cx22SPKVoE1VIZxJZym_Wuc5ueWmQHKbkUExHvZNjyEs4KFuNEXD76jEGgejePYUq9jhCJCJZWRL_YHf_OTdoDp-q_C2EqEkPiSNjaZY')" }}
                                    ></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main dark:text-white">Taylor R.</h3>
                                        <p className="text-sm text-primary font-medium">Low Vision User</p>
                                    </div>
                                </div>
                                <p className="text-lg text-text-muted dark:text-gray-300 italic leading-relaxed">"High contrast mode isn't an afterthought here. It's built into the DNA of the design. Everything is so readable."</p>
                                <div className="mt-auto pt-6 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined fill-current text-sm">star</span>
                                    ))}
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="snap-start shrink-0 w-[85vw] sm:w-[400px] flex flex-col p-8 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="size-14 rounded-full bg-cover bg-center bg-no-repeat bg-gray-200"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6FX5q26uaQy_i4P8TEt27VYpkb9l7f7gIbIM_EmqnjP5STYe2GhFk0vRj_e1LMuOLCZ3Ym1Xm8OMhXuyDjsQre7I_syor5BvIILE14doZPHBTc3vp1Y3nlfuBDu2uq7YpIbmDd5LTmaEA8Q0BCxT6brr6QlIiHIZXpYA7BLSn0G8DpX8JhHoRbBvZP7rBiJvcHy7--CVDwp1kd_yMj4F7fUBJq1k1KctuYUrlRqg_MHTODd5Ku2Mig1EC4k6M9_PwSJs4kEmmBkU')" }}
                                    ></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main dark:text-white">Sarah K.</h3>
                                        <p className="text-sm text-primary font-medium">Teacher</p>
                                    </div>
                                </div>
                                <p className="text-lg text-text-muted dark:text-gray-300 italic leading-relaxed">"I use this to communicate with my non-verbal students. The Mood Zone helps us bridge emotional gaps effortlessly."</p>
                                <div className="mt-auto pt-6 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined fill-current text-sm">star</span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="w-full py-16 bg-primary dark:bg-primary-dark">
                    <div className="max-w-[960px] mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to connect on your own terms?</h2>
                        <p className="text-primary-50 text-lg mb-8 max-w-2xl mx-auto">Join the fastest growing inclusive community today. It's free, secure, and designed for you.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="flex items-center justify-center h-12 px-8 rounded-lg bg-white text-primary font-bold shadow-lg hover:bg-gray-100 transition-colors">
                                Create Free Account
                            </Link>
                            <button className="h-12 px-8 rounded-lg bg-primary-dark/30 text-white border border-white/20 font-bold hover:bg-primary-dark/50 transition-colors">
                                Download App
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-3xl text-primary">accessibility_new</span>
                                <span className="text-xl font-bold text-text-main dark:text-white">EchoReach</span>
                            </div>
                            <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                                Building a world where communication has no physical limits.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-main dark:text-white mb-4">Platform</h4>
                            <ul className="space-y-3">
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Features</a></li>
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Safety</a></li>
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Download</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-main dark:text-white mb-4">Community</h4>
                            <ul className="space-y-3">
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Guidelines</a></li>
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Blog</a></li>
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Events</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-main dark:text-white mb-4">Support</h4>
                            <ul className="space-y-3">
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Help Center</a></li>
                                <li><a className="text-sm font-bold text-primary hover:underline" href="#">Accessibility Statement</a></li>
                                <li><a className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" href="#">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-text-muted dark:text-gray-500">© 2023 EchoReach Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" href="#"><span className="sr-only">Twitter</span><span className="material-symbols-outlined text-xl">share</span></a>
                            <a className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" href="#"><span className="sr-only">Instagram</span><span className="material-symbols-outlined text-xl">photo_camera</span></a>
                            <a className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" href="#"><span className="sr-only">LinkedIn</span><span className="material-symbols-outlined text-xl">work</span></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
