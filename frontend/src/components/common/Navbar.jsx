import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50" role="navigation" aria-label="Main Navigation">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold focus:ring-2 focus:ring-white rounded p-1 outline-none">
                    EchoReach
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 items-center">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hover:underline focus:ring-2 focus:ring-white rounded p-1 outline-none">Dashboard</Link>
                            <Link to="/chat" className="hover:underline focus:ring-2 focus:ring-white rounded p-1 outline-none">Chat</Link>
                            <Link to="/mood-zone" className="hover:underline focus:ring-2 focus:ring-white rounded p-1 outline-none">Mood Zone</Link>
                            <Link to="/contacts" className="hover:underline focus:ring-2 focus:ring-white rounded p-1 outline-none">Contacts</Link>
                            <div className="relative group">
                                <button className="flex items-center space-x-2 focus:ring-2 focus:ring-white rounded p-1 outline-none hover:bg-primary-dark">
                                    <User size={20} />
                                    <span>{user.name}</span>
                                </button>
                                <div className="absolute right-0 mt-0 w-48 bg-white text-text rounded-md shadow-lg hidden group-hover:block focus-within:block border border-gray-200">
                                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                        <User size={16} /> <span>Profile</span>
                                    </Link>
                                    <Link to="/settings" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                        <Settings size={16} /> <span>Settings</span>
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                                        <LogOut size={16} /> <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:underline focus:ring-2 focus:ring-white rounded p-1 outline-none">Login</Link>
                            <Link to="/register" className="bg-white text-primary px-4 py-2 rounded font-bold hover:bg-gray-100 focus:ring-2 focus:ring-black outline-none">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-1 focus:ring-2 focus:ring-white rounded outline-none"
                    aria-expanded={isOpen}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-4 space-y-2 pb-4 border-t border-white/20 pt-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded">Dashboard</Link>
                            <Link to="/chat" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded">Chat</Link>
                            <Link to="/mood-zone" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded">Mood Zone</Link>
                            <Link to="/contacts" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded">Contacts</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-black/10 rounded text-red-200 font-bold">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded">Login</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-black/10 rounded font-bold">Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
