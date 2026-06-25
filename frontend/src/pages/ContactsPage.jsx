import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { api } from '../utils/api';
import { toast } from '../utils/toast';
import Avatar from '../components/common/Avatar';

const ContactsPage = () => {
    const { user, getUserDisplayName } = useAuth();
    const { startConversation } = useChat();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addUsername, setAddUsername] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('contacts');

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.users.getContacts();
            if (res.success) setContacts(res.data || []);
        } catch {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    useEffect(() => {
        if (searchQuery.length < 2) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await api.users.search(searchQuery);
                if (res.success) setSearchResults(res.data || []);
            } catch {} finally { setSearchLoading(false); }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddContact = async () => {
        if (!addUsername.trim()) return;
        setAddLoading(true);
        try {
            const res = await api.users.addContact(addUsername.trim());
            if (res.success) {
                toast.success(`${addUsername} added!`);
                setAddUsername(''); setShowAddForm(false);
                await fetchContacts();
            } else toast.error(res.error?.message || 'Failed to add contact');
        } catch { toast.error('Failed to add contact'); }
        finally { setAddLoading(false); }
    };

    const handleAddFromSearch = async (username) => {
        setAddLoading(true);
        try {
            const res = await api.users.addContact(username);
            if (res.success) { toast.success(`${username} added!`); await fetchContacts(); }
            else toast.error(res.error?.message || 'Failed to add contact');
        } catch { toast.error('Failed to add contact'); }
        finally { setAddLoading(false); }
    };

    const handleRemoveContact = async (contact) => {
        const name = contact.contact_display_name || contact.contact_username;
        if (!window.confirm(`Remove ${name} from contacts?`)) return;
        try {
            await api.users.removeContact(contact.contact_id);
            setContacts(prev => prev.filter(c => c.contact_id !== contact.contact_id));
            toast.success('Contact removed');
        } catch { toast.error('Failed to remove contact'); }
    };

    const handleBlockContact = async (contact) => {
        const name = contact.contact_display_name || contact.contact_username;
        if (!window.confirm(`Block ${name}?`)) return;
        try {
            await api.users.blockUser(contact.contact_id);
            await fetchContacts(); toast.success('User blocked');
        } catch { toast.error('Failed to block user'); }
    };

    const handleUnblockContact = async (contact) => {
        try {
            await api.users.unblockUser(contact.contact_id);
            await fetchContacts(); toast.success('User unblocked');
        } catch { toast.error('Failed to unblock user'); }
    };

    const handleMessage = async (contact) => {
        const res = await startConversation(contact.contact_id);
        if (res.success) navigate('/chat');
        else toast.error('Failed to start conversation');
    };

    const visibleContacts = contacts.filter(c =>
        !c.is_blocked && (
            c.contact_display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.contact_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchQuery === ''
        )
    );
    const blockedContacts = contacts.filter(c => c.is_blocked);
    const displayName = getUserDisplayName();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display">
            <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                            </Link>
                            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Contacts</h1>
                        </div>
                        <Link to="/profile">
                            <Avatar src={user?.avatar} name={displayName} username={user?.username} userId={user?.id} size="size-9" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search + Add */}
                <div className="flex gap-3 flex-col sm:flex-row">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-lg" aria-hidden="true">search</span>
                        <input
                            id="contact-search"
                            type="search"
                            placeholder="Search contacts or find people..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); if (e.target.value.length >= 2) setActiveTab('search'); else setActiveTab('contacts'); }}
                            aria-label="Search contacts"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        />
                    </div>
                    <button id="add-contact-btn" onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors flex-shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">person_add</span> Add Contact
                    </button>
                </div>

                {showAddForm && (
                    <div role="form" aria-label="Add contact" className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Add by Username</h2>
                        <div className="flex gap-3">
                            <input id="add-username-input" type="text" placeholder="Enter username..." value={addUsername} onChange={e => setAddUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddContact()} aria-label="Username to add"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium" />
                            <button onClick={handleAddContact} disabled={addLoading || !addUsername.trim()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">{addLoading ? 'Adding...' : 'Add'}</button>
                            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit" role="tablist">
                    {[{ key: 'contacts', label: 'My Contacts', count: visibleContacts.length },
                      { key: 'search',   label: 'Find People', count: null },
                      ...(blockedContacts.length > 0 ? [{ key: 'blocked', label: 'Blocked', count: blockedContacts.length }] : [])
                    ].map(tab => (
                        <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.key ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                            {tab.label}
                            {tab.count !== null && tab.count > 0 && <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* My Contacts */}
                {activeTab === 'contacts' && (
                    <section role="tabpanel" aria-label="My contacts">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-gray-500">
                                <span className="material-symbols-outlined animate-spin text-3xl mr-3" aria-hidden="true">progress_activity</span> Loading contacts...
                            </div>
                        ) : visibleContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4" aria-hidden="true">group</span>
                                <p className="text-gray-500 dark:text-gray-500 font-medium text-lg mb-2">No contacts yet</p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm">Use "Find People" to search and add contacts.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3" aria-label="Contacts list">
                                {visibleContacts.map(contact => (
                                    <li key={contact.id} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                                        <div className="relative flex-shrink-0">
                                            <Avatar src={contact.contact_avatar} name={contact.contact_display_name} username={contact.contact_username} userId={contact.contact_id} size="size-14" />
                                            {contact.contact_is_online && <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full" aria-label="Online" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{contact.contact_display_name || contact.contact_username}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 truncate">@{contact.contact_username}{contact.contact_is_online && <span className="text-green-600 dark:text-green-400 ml-2 font-medium">· Online</span>}</p>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <button onClick={() => handleMessage(contact)} aria-label={`Message ${contact.contact_display_name}`} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-lg" aria-hidden="true">chat</span>
                                            </button>
                                            <button onClick={() => handleBlockContact(contact)} aria-label={`Block ${contact.contact_display_name}`} className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-lg" aria-hidden="true">block</span>
                                            </button>
                                            <button onClick={() => handleRemoveContact(contact)} aria-label={`Remove ${contact.contact_display_name}`} className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-lg" aria-hidden="true">person_remove</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {/* Find People */}
                {activeTab === 'search' && (
                    <section role="tabpanel" aria-label="Find people">
                        {searchQuery.length < 2 && <div className="flex flex-col items-center justify-center py-16 text-center"><span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4" aria-hidden="true">person_search</span><p className="text-gray-500 dark:text-gray-500 font-medium">Type at least 2 characters to search</p></div>}
                        {searchLoading && <div className="flex items-center justify-center py-10 text-gray-500"><span className="material-symbols-outlined animate-spin mr-2" aria-hidden="true">progress_activity</span>Searching...</div>}
                        {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-center"><span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4" aria-hidden="true">search_off</span><p className="text-gray-500 dark:text-gray-500 font-medium">No users found for "{searchQuery}"</p></div>}
                        {searchResults.length > 0 && (
                            <ul className="space-y-3">
                                {searchResults.map(result => {
                                    const alreadyContact = contacts.some(c => c.contact_id === result.id);
                                    return (
                                        <li key={result.id} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <Avatar src={result.avatar} name={result.display_name} username={result.username} userId={result.id} size="size-12" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white truncate">{result.display_name || result.username}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-500">@{result.username}</p>
                                            </div>
                                            {alreadyContact ? (
                                                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">Contact</span>
                                            ) : (
                                                <button onClick={() => handleAddFromSearch(result.username)} disabled={addLoading} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
                                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">person_add</span> Add
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}

                {/* Blocked */}
                {activeTab === 'blocked' && (
                    <section role="tabpanel" aria-label="Blocked users">
                        <ul className="space-y-3">
                            {blockedContacts.map(contact => (
                                <li key={contact.id} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm opacity-70">
                                    <Avatar name={contact.contact_display_name} username={contact.contact_username} userId={contact.contact_id} size="size-12" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white truncate line-through">{contact.contact_display_name || contact.contact_username}</p>
                                        <p className="text-sm text-red-500 font-medium">Blocked</p>
                                    </div>
                                    <button onClick={() => handleUnblockContact(contact)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Unblock</button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ContactsPage;
