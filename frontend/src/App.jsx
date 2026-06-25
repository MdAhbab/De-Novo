import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ChatProvider } from './context/ChatContext';

import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import LoadingSpinner from './components/common/LoadingSpinner';
import AccessibilityToolbar from './components/common/AccessibilityToolbar';
import PrivacyMonitor from './components/common/PrivacyMonitor';

// PERF-04: Route-based code splitting with React.lazy
const LandingPage     = lazy(() => import('./pages/LandingPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const OnboardingPage  = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const ChatPage        = lazy(() => import('./pages/ChatPage'));
const MoodZonePage    = lazy(() => import('./pages/MoodZonePage'));
const ContactsPage    = lazy(() => import('./pages/ContactsPage'));
const SettingsPage    = lazy(() => import('./pages/SettingsPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));

const PageFallback = () => (
    <LoadingSpinner fullScreen text="Loading page..." />
);

function ProtectedLayout() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Verifying session..." />;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <PrivacyMonitor>
            <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <main className="flex-1">
                    <Suspense fallback={<PageFallback />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </PrivacyMonitor>
    );
}

function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <main className="flex-1">
                <Suspense fallback={<PageFallback />}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <AccessibilityProvider>
                        <ChatProvider>
                            <Router>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route element={<PublicLayout />}>
                                        <Route path="/" element={<LandingPage />} />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                    </Route>

                                    {/* Protected Routes */}
                                    <Route element={<ProtectedLayout />}>
                                        {/* FE-02: Onboarding gated behind auth */}
                                        <Route path="/onboarding" element={<OnboardingPage />} />
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/chat" element={<ChatPage />} />
                                        <Route path="/mood-zone" element={<MoodZonePage />} />
                                        <Route path="/contacts" element={<ContactsPage />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/accessibility" element={<AccessibilityPage />} />
                                    </Route>

                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>

                                <AccessibilityToolbar />
                                {/* UX-01: Global accessible toast container */}
                                <ToastContainer />
                            </Router>
                        </ChatProvider>
                    </AccessibilityProvider>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
