import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ChatProvider } from './context/ChatContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import MoodZonePage from './pages/MoodZonePage';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import AccessibilityPage from './pages/AccessibilityPage';

import Navbar from './components/common/Navbar';
import AccessibilityToolbar from './components/common/AccessibilityToolbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';



function ProtectedLayout() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Verifying session..." />;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen flex flex-col bg-background text-text transition-colors duration-300">
            {/* Navbar removed to avoid duplication with page-specific headers */}
            {/* <Navbar /> */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-text transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AccessibilityProvider>
                    <ChatProvider>
                        <Router>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/onboarding" element={<OnboardingPage />} />
                                <Route element={<PublicLayout />}>
                                    {/* Other public pages can go here */}
                                </Route>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedLayout />}>
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/chat" element={<ChatPage />} />
                                    <Route path="/mood-zone" element={<MoodZonePage />} />
                                    <Route path="/contacts" element={<ContactsPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/accessibility" element={<AccessibilityPage />} />
                                </Route>

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                            <AccessibilityToolbar />
                        </Router>
                    </ChatProvider>
                </AccessibilityProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
