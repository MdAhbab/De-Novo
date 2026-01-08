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
                // Token invalid, clear it
                clearTokens();
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            clearTokens();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

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
        } catch (err) {
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
            // Map frontend fields to backend expected fields
            const registerData = {
                email: data.email,
                username: data.username || data.email.split('@')[0],
                password: data.password,
                password_confirm: data.password_confirm || data.password,
                display_name: data.name || data.display_name,
                disability_type: data.disability_type || 'none'
            };
            
            const response = await api.auth.register(registerData);
            
            if (response.success) {
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            } else {
                // Handle validation errors
                let errorMsg = 'Registration failed';
                if (response.email) errorMsg = response.email[0];
                else if (response.username) errorMsg = response.username[0];
                else if (response.password) errorMsg = response.password[0];
                else if (response.error?.message) errorMsg = response.error.message;
                
                setError(errorMsg);
                return { success: false, error: errorMsg, details: response };
            }
        } catch (err) {
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
        } catch (err) {
            console.error('Logout error:', err);
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
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const clearError = () => setError(null);

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
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
