import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const { register, error: authError, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Wizard step state
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    
    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        disability_type: []
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Clear errors when step changes
    useEffect(() => {
        clearError?.();
        setLocalError('');
    }, [step]);

    const toggleDisability = (value) => {
        setFormData(prev => ({
            ...prev,
            disability_type: prev.disability_type.includes(value)
                ? prev.disability_type.filter(item => item !== value)
                : [...prev.disability_type, value]
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) {
            setLocalError('Please enter your name');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setLocalError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        // Disability selection is optional
        return true;
    };

    const validateStep3 = () => {
        if (!formData.password || formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.password_confirm) {
            setLocalError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setLocalError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;
        
        setIsSubmitting(true);
        setLocalError('');

        try {
            const registerData = {
                name: formData.name,
                display_name: formData.name,
                email: formData.email,
                username: formData.username || formData.email.split('@')[0],
                password: formData.password,
                password_confirm: formData.password_confirm,
                disability_type: formData.disability_type.length > 0 
                    ? formData.disability_type[0] // Backend accepts single value
                    : 'none'
            };

            const result = await register(registerData);
            
            if (result.success) {
                navigate('/onboarding');
            } else {
                setLocalError(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            setLocalError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || authError;

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
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">Step {step} of 3</p>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                            {step === 1 && 'Basic Information'}
                                            {step === 2 && 'Disability Needs'}
                                            {step === 3 && 'Create Password'}
                                        </h2>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {step < 3 && <>Next: <span className="text-slate-900 dark:text-white font-bold">
                                                {step === 1 && 'Disability Needs'}
                                                {step === 2 && 'Create Password'}
                                            </span></>}
                                        </p>
                                    </div>
                                </div>
                                {/* Progress Bar Visual */}
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className={`h-full bg-primary transition-all duration-300`} style={{ width: `${(step / 3) * 100}%` }}></div>
                                </div>
                            </div>
                        </nav>

                        {/* Error Display */}
                        {displayError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{displayError}</p>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-4">
                                    Let's start with your basic information to set up your account.
                                </p>
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                            placeholder="Your full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                                        </div>
                                    </div>
                                </div>
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
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Username (optional)</label>
                                    <div className="relative">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                            placeholder="@username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">alternate_email</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Disability Selection */}
                        {step === 2 && (
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-6">
                                    Help us customize De-Novo for you. Select all that apply so we can optimize the interface immediately.
                                </p>

                                {/* Selection Grid */}
                                <form aria-label="Disability Selection Form" className="grid grid-cols-1 gap-4" onSubmit={(e) => e.preventDefault()}>
                                    {[
                                        { id: 'visual', icon: 'visibility', title: 'Visual Impairment', desc: 'Screen readers, high contrast, larger typography.', color: 'blue' },
                                        { id: 'hearing', icon: 'hearing_disabled', title: 'Hearing Impairment', desc: 'Auto-captions, visual alerts, interpreter badges.', color: 'purple' },
                                        { id: 'speech', icon: 'record_voice_over', title: 'Speech Impairment', desc: 'Text-to-speech tools, quick-response phrasing.', color: 'orange' },
                                        { id: 'none', icon: 'volunteer_activism', title: 'None / Ally', desc: 'I am here to support and connect.', color: 'emerald' }
                                    ].map((option) => (
                                        <label key={option.id} className="relative group cursor-pointer">
                                            <input
                                                className="peer sr-only"
                                                name="disability"
                                                type="checkbox"
                                                value={option.id}
                                                checked={formData.disability_type.includes(option.id)}
                                                onChange={() => toggleDisability(option.id)}
                                            />
                                            <div className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 relative overflow-hidden ${formData.disability_type.includes(option.id)
                                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                    : 'border-slate-100 dark:border-slate-700 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                                                }`}>
                                                <div className={`p-2 rounded-lg shrink-0 ${formData.disability_type.includes(option.id) ? 'bg-white dark:bg-white/10 text-primary' : `bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-600 dark:text-${option.color}-400`
                                                    }`}>
                                                    <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{option.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-1 sm:line-clamp-none">{option.desc}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${formData.disability_type.includes(option.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                    {formData.disability_type.includes(option.id) && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </form>
                            </div>
                        )}

                        {/* Step 3: Password */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-4">
                                    Create a secure password for your account.
                                </p>
                                <div>
                                    <label htmlFor="password" className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                            placeholder="At least 8 characters"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password_confirm" className="block text-xs font-bold text-text-main dark:text-white mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            id="password_confirm"
                                            name="password_confirm"
                                            type="password"
                                            required
                                            className="appearance-none block w-full px-4 pl-10 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm"
                                            placeholder="Confirm your password"
                                            value={formData.password_confirm}
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            {step > 1 && (
                                <button 
                                    onClick={handleBack}
                                    className="w-full md:w-auto px-6 h-12 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button 
                                    onClick={handleNext}
                                    className="w-full md:w-auto md:ml-auto px-8 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <span>Continue</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto md:ml-auto px-8 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                                    {!isSubmitting && <span className="material-symbols-outlined text-lg">check</span>}
                                </button>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
