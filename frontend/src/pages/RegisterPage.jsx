import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        disabilities: []
    });

    // Handlers
    const toggleDisability = (value) => {
        if (formData.disabilities.includes(value)) {
            setFormData({ ...formData, disabilities: formData.disabilities.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, disabilities: [...formData.disabilities, value] });
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-dark to-primary opacity-90 z-10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 animate-float"></div>
                <div className="absolute bottom-12 right-12 w-80 h-80 bg-white/10 rounded-full blur-3xl z-0 animate-float-delayed"></div>

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

                    {/* Step Indicators */}
                    <div className="flex gap-4">
                        <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                        <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                    </div>
                    <p className="mt-4 text-sm font-bold text-white/80 uppercase tracking-widest">Step {step} of 2</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-white dark:bg-gray-900 overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden w-full flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        <span className="text-xl font-bold">De-Novo</span>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-text-main dark:text-white mb-2">
                            {step === 1 ? 'Create Account' : 'Customize Experience'}
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm">
                            {step === 1 ? 'Enter your details to get started.' : 'Select applicable options to optimize the UI.'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={step === 1 ? handleNext : handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-sm"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-sm"
                                            placeholder="name@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-sm"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-right-8 duration-300">
                                {[
                                    { id: 'visual', icon: 'visibility', title: 'Visual', desc: 'Screen readers, large text.', color: 'blue' },
                                    { id: 'hearing', icon: 'hearing_disabled', title: 'Hearing', desc: 'Captions, visual alerts.', color: 'purple' },
                                    { id: 'speech', icon: 'record_voice_over', title: 'Speech', desc: 'TTS tools, phrasing.', color: 'orange' },
                                    { id: 'ally', icon: 'volunteer_activism', title: 'None / Ally', desc: 'Support & connect.', color: 'emerald' }
                                ].map((option) => (
                                    <label key={option.id} className="relative cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={formData.disabilities.includes(option.id)}
                                            onChange={() => toggleDisability(option.id)}
                                        />
                                        <div className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${formData.disabilities.includes(option.id)
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-slate-100 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-gray-800'
                                            }`}>
                                            <div className={`p-2 rounded-lg ${formData.disabilities.includes(option.id)
                                                    ? 'bg-primary text-white'
                                                    : `bg-${option.color}-50 dark:bg-gray-700 text-${option.color}-500 dark:text-${option.color}-400`
                                                }`}>
                                                <span className="material-symbols-outlined text-xl">{option.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm text-text-main dark:text-white">{option.title}</h3>
                                                <p className="text-xs text-text-muted dark:text-gray-400">{option.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.disabilities.includes(option.id)
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {formData.disabilities.includes(option.id) && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-gray-800"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    'Creating Account...'
                                ) : (
                                    <>
                                        {step === 1 ? 'Continue' : 'Complete Registration'}
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
