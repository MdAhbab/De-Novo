import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../utils/api';
import { toast } from '../utils/toast';
import Avatar from '../components/common/Avatar';

/** Accessible toggle switch component — replaces broken inline-<style> toggle (FE-11) */
function Toggle({ id, checked, onChange, label }) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/30
                ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${checked ? 'translate-x-7' : 'translate-x-0'}`}
            />
        </button>
    );
}

const SettingsPage = () => {
    const { user, getUserDisplayName } = useAuth();
    const { updateSetting, settings } = useAccessibility();
    const navigate = useNavigate();

    const displayName = getUserDisplayName();

    // FE-11: Wire privacy toggles to AccessibilityContext + backend
    const [peepEnabled, setPeepEnabled] = useState(settings?.peepingTomEnabled ?? false);
    const [blurSensitive, setBlurSensitive] = useState(false);

    // Load security data
    const [sessions, setSessions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [securityLoading, setSecurityLoading] = useState(true);
    const [blockedCount, setBlockedCount] = useState(null);

    useEffect(() => {
        setSecurityLoading(true);
        Promise.allSettled([
            api.security.getSessions(),
            api.security.getAlerts(),
            api.users.getContacts(),
        ]).then(([sessRes, alertRes, contactRes]) => {
            if (sessRes.status === 'fulfilled' && sessRes.value.success) {
                setSessions(sessRes.value.data || []);
            }
            if (alertRes.status === 'fulfilled' && alertRes.value.success) {
                setAlerts(alertRes.value.data || []);
            }
            if (contactRes.status === 'fulfilled' && contactRes.value.success) {
                const blocked = (contactRes.value.data || []).filter(c => c.is_blocked);
                setBlockedCount(blocked.length);
            }
        }).finally(() => setSecurityLoading(false));
    }, []);

    const handlePeepToggle = async (value) => {
        setPeepEnabled(value);
        updateSetting('peepingTomEnabled', value);
        try {
            await api.users.updateAccessibilitySettings({ peeping_tom_enabled: value });
            toast.success(`Peeping Tom Protection ${value ? 'enabled' : 'disabled'}`);
            if (value) {
                // Trigger consent modal by dispatching to PrivacyMonitor
                localStorage.setItem('privacy_monitor_consent', 'false');
                window.dispatchEvent(new CustomEvent('privacy:requestConsent'));
            }
        } catch {
            toast.error('Failed to save privacy setting');
            setPeepEnabled(!value);
        }
    };

    const handleTerminateAllSessions = async () => {
        try {
            await api.security.terminateAllSessions();
            toast.success('All other sessions terminated');
            setSessions([]);
        } catch {
            toast.error('Failed to terminate sessions');
        }
    };

    const activeSessions = sessions.filter(s => !s.is_current);
    const pendingAlerts = alerts.filter(a => !a.dismissed);

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display transition-colors duration-200">
            <div className="flex min-h-screen w-full">

                {/* Sidebar Navigation */}
                <aside className="hidden md:flex flex-col w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark overflow-y-auto z-20">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <Link to="/" className="flex items-center gap-3 text-primary">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">grid_view</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">De-Novo</span>
                        </Link>
                    </div>

                    {/* FE-11: Real user info — not "Jane Doe / #8821" */}
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-700">
                            <Avatar
                                src={user?.avatar}
                                name={displayName}
                                username={user?.username}
                                userId={user?.id}
                                size="size-12"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {displayName || user?.username || '—'}
                                </span>
                                <span className="text-primary text-xs font-medium truncate">
                                    {user?.email} · Online
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 pb-4 space-y-2" aria-label="Settings navigation">
                        <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors" aria-hidden="true">account_circle</span>
                            <span className="font-bold text-sm">Account</span>
                        </Link>
                        <div aria-current="page" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-2xl" aria-hidden="true">shield_lock</span>
                            <span className="font-bold text-sm">Privacy & Security</span>
                        </div>
                        <Link to="/accessibility" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors" aria-hidden="true">settings_accessibility</span>
                            <span className="font-bold text-sm">Accessibility</span>
                        </Link>
                        <Link to="/contacts" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors" aria-hidden="true">contacts</span>
                            <span className="font-bold text-sm">Contacts</span>
                        </Link>
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors" aria-hidden="true">home</span>
                                <span className="font-bold text-sm">Dashboard</span>
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <header className="md:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">grid_view</span>
                            <span className="font-bold text-lg">De-Novo</span>
                        </div>
                        <Link to="/dashboard" aria-label="Back to dashboard">
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                        </Link>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Heading */}
                            <div className="space-y-4">
                                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-500">
                                    <Link to="/settings" className="hover:text-primary transition-colors">Settings</Link>
                                    <span className="material-symbols-outlined text-base" aria-hidden="true">chevron_right</span>
                                    <span aria-current="page" className="text-primary">Privacy & Security</span>
                                </nav>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Privacy & Security
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-500 text-lg max-w-2xl mt-2">
                                        Manage your digital safety tools and blocking preferences.
                                    </p>
                                </div>
                            </div>

                            {/* SEC-02: Replaced false E2E banner with honest TLS statement */}
                            <section aria-label="Encryption Status" className="rounded-xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#00606e] opacity-90" />
                                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/20 p-3 rounded-full shrink-0">
                                            <span className="material-symbols-outlined text-white text-3xl" aria-hidden="true">lock</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-white text-xl font-bold">Encrypted in Transit (TLS)</h2>
                                            {/* SEC-02: Honest claim — no "De-Novo cannot intercept" */}
                                            <p className="text-white/90 text-sm md:text-base max-w-lg">
                                                Your connection to De-Novo is protected by TLS encryption. 
                                                Message content is encrypted in transit between your browser and our servers.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 px-4 py-2 bg-white/20 text-white font-bold rounded-lg text-sm border border-white/30">
                                        TLS Active
                                    </span>
                                </div>
                            </section>

                            {/* Security Alerts */}
                            {pendingAlerts.length > 0 && (
                                <section aria-labelledby="alerts-heading">
                                    <h2 id="alerts-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500" aria-hidden="true">warning</span>
                                        Security Alerts
                                        <span className="ml-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {pendingAlerts.length}
                                        </span>
                                    </h2>
                                    <div className="space-y-3">
                                        {pendingAlerts.map(alert => (
                                            <div key={alert.id} className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                                <span className="material-symbols-outlined text-amber-600" aria-hidden="true">warning</span>
                                                <p className="flex-1 text-sm font-medium text-amber-800 dark:text-amber-300">{alert.message}</p>
                                                <button
                                                    onClick={async () => {
                                                        await api.security.dismissAlert(alert.id);
                                                        setAlerts(prev => prev.filter(a => a.id !== alert.id));
                                                        toast.success('Alert dismissed');
                                                    }}
                                                    className="text-amber-600 hover:text-amber-800 font-bold text-sm"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Safety Tools */}
                            <section aria-labelledby="safety-tools-heading">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" id="safety-tools-heading">
                                    <span className="material-symbols-outlined text-primary" aria-hidden="true">policy</span>
                                    Safety Tools
                                </h2>
                                <div className="grid gap-4">
                                    {/* Peeping Tom — FE-11: Wired to backend */}
                                    <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="hidden sm:flex size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">visibility_off</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Peeping Tom Protection</h3>
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">Beta</span>
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed max-w-xl">
                                                        Uses your camera to detect if someone is looking over your shoulder.
                                                        Requires your explicit consent before activating.
                                                    </p>
                                                </div>
                                            </div>
                                            {/* A11Y: Accessible toggle (role=switch) replaces broken CSS toggle */}
                                            <Toggle
                                                id="peep-toggle"
                                                checked={peepEnabled}
                                                onChange={handlePeepToggle}
                                                label="Peeping Tom Protection"
                                            />
                                        </div>
                                    </div>

                                    {/* Blur Sensitive Content */}
                                    <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="hidden sm:flex size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">blur_on</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Blur Sensitive Content</h3>
                                                    <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed max-w-xl">
                                                        Automatically blurs images that may contain flashing lights or sensitive content.
                                                    </p>
                                                </div>
                                            </div>
                                            <Toggle
                                                id="blur-toggle"
                                                checked={blurSensitive}
                                                onChange={setBlurSensitive}
                                                label="Blur sensitive content"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Account Security — FE-11: Real session count */}
                            <section aria-labelledby="account-security-heading">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" id="account-security-heading">
                                    <span className="material-symbols-outlined text-primary" aria-hidden="true">key</span>
                                    Account Security
                                </h2>
                                <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h3>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Active Sessions</h3>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                {securityLoading ? 'Loading...' :
                                                    activeSessions.length > 0
                                                        ? `You are logged in on ${activeSessions.length} other device${activeSessions.length > 1 ? 's' : ''}.`
                                                        : 'Only this device is active.'
                                                }
                                            </p>
                                        </div>
                                        {activeSessions.length > 0 && (
                                            <button
                                                onClick={handleTerminateAllSessions}
                                                className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm hover:underline"
                                            >
                                                Terminate All Other Sessions
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                                                <span className="material-symbols-outlined" aria-hidden="true">block</span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Blocked Users</h3>
                                                <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                    {securityLoading ? 'Loading...' :
                                                        blockedCount !== null ? `${blockedCount} contact${blockedCount !== 1 ? 's' : ''} blocked` : 'Loading...'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <Link to="/contacts" className="flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                                            Manage
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_right</span>
                                        </Link>
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center gap-4 text-center">
                                <p className="text-gray-500 dark:text-gray-500 text-sm">Need help with these settings?</p>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-primary hover:text-primary dark:text-gray-300 transition-all font-bold text-sm">
                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">support_agent</span>
                                    Contact Accessibility Support
                                </button>
                                {/* UX-06: Updated version info — no hardcoded #8821 */}
                                <p className="text-xs text-gray-500 dark:text-gray-600">De-Novo · Privacy & Security Settings</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
