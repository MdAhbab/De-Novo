import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, isAuthenticated, clearTokens } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile on mount if token exists
    const fetchUserProfile = useCallback(async () => {
        if (!isAuthenticated()) {
            setLoading(false);
            return;
        }
        
        try {
            const response = await api.users.getProfile();
            if (response.success) {
                setUser(response.data);
            } else {
                clearTokens();
                setUser(null);
            }
        } catch (err) {
            clearTokens();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // FE-05: Listen for the single-flight refresh failure broadcast
    useEffect(() => {
        const handleForceLogout = () => {
            setUser(null);
            clearTokens();
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    const login = async (email, password) => {
        setError(null);
        setLoading(true);
        
        try {
            const response = await api.auth.login(email, password);
            
            if (response.success) {
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            } else {
                const errorMsg = response.error?.message || response.detail || 'Login failed';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setError(null);
        setLoading(true);
        
        try {
            // API-21: Split name into first_name/last_name
            const registerData = {
                email: data.email,
                username: data.username || data.email.split('@')[0],
                password: data.password,
                password_confirm: data.password_confirm || data.password,
                disability_type: data.disability_type || 'none',
            };

            // Handle full name → first/last split
            const fullName = data.name || data.display_name || '';
            if (fullName) {
                const parts = fullName.trim().split(' ');
                registerData.first_name = parts[0] || '';
                registerData.last_name  = parts.slice(1).join(' ') || '';
            } else {
                registerData.first_name = data.first_name || '';
                registerData.last_name  = data.last_name  || '';
            }
            
            const response = await api.auth.register(registerData);
            
            if (response.success) {
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            } else {
                let errorMsg = 'Registration failed';
                if (response.email)               errorMsg = response.email[0];
                else if (response.username)        errorMsg = response.username[0];
                else if (response.password)        errorMsg = response.password[0];
                else if (response.error?.message)  errorMsg = response.error.message;
                
                setError(errorMsg);
                return { success: false, error: errorMsg, details: response };
            }
        } catch {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.auth.logout();
        } finally {
            setUser(null);
            clearTokens();
        }
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.users.updateProfile(data);
            if (response.success) {
                setUser(prev => ({ ...prev, ...response.data }));
                return { success: true };
            }
            return { success: false, error: response.error?.message || 'Update failed' };
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    const clearError = () => setError(null);

    // Helper: get display name from user object
    const getUserDisplayName = (u = user) => {
        if (!u) return '';
        return u.display_name || u.name ||
               (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : '') ||
               u.first_name || u.username || '';
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading, 
            error,
            clearError,
            updateProfile,
            refreshProfile: fetchUserProfile,
            isAuthenticated: !!user,
            getUserDisplayName,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
