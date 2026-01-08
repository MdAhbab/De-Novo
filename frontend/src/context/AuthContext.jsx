import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Mock user restoration
            setUser({ name: 'Demo User', id: 1, email: 'demo@example.com' });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // TODO: Connect to backend
        console.log('Logging in', email);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const demoUser = { name: 'Demo User', id: 1, email };
        setUser(demoUser);
        localStorage.setItem('token', 'demo-token');
        return demoUser;
    };

    const register = async (data) => {
        // TODO: Connect to backend
        console.log('Registering', data);
        await new Promise(resolve => setTimeout(resolve, 500));
        const newUser = { name: data.name, id: 1, email: data.email };
        setUser(newUser);
        localStorage.setItem('token', 'demo-token');
        return newUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
