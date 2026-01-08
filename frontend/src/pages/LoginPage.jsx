import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            // In a real app, handle error state here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Left Side - Visual & Branding */}
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
                    <h2 className="text-5xl font-black mb-6 leading-tight">Empowering Every Voice.</h2>
                    <p className="text-lg text-white/90 font-medium leading-relaxed mb-8">
                        Experience existing inclusivity. Real-time adaptations, voice-to-visual feedback, and a platform built for everyone.
                    </p>

                    {/* Testimonial/Badge */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 flex items-center justify-center text-xs font-bold text-primary-dark">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">10k+ Users</span>
                                <span className="text-xs opacity-75">Trust De-Novo daily</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-white dark:bg-gray-900">
                {/* Mobile Header (only visible on small screens) */}
                <div className="lg:hidden w-full flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        <span className="text-xl font-bold">De-Novo</span>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-5">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-text-main dark:text-white mb-1">Welcome Back</h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm">Please enter your details to sign in.</p>
                    </div>

                    {/* Quick Login Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary mb-1 transition-colors">mic</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Voice Login</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary mb-1 transition-colors">fingerprint</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Biometric</span>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white dark:bg-gray-900 text-slate-500">Or continue with email</span>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Email Address</label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-xs font-bold text-text-main dark:text-white">Password</label>
                                    <div className="text-xs">
                                        <a href="#" className="font-bold text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600 dark:text-gray-300">
                                Remember me for 30 days
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>


                    </form>

                    <p className="mt-6 text-center text-xs text-slate-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
