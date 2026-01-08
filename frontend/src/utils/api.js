const API_URL = 'http://localhost:8000/api';

// Token management
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// Refresh access token
const refreshAccessToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    
    try {
        const response = await fetch(`${API_URL}/users/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });
        
        if (response.ok) {
            const data = await response.json();
            setTokens(data.access, data.refresh);
            return data.access;
        }
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};

// Base fetch with auth and auto-refresh
const fetchWithAuth = async (endpoint, options = {}) => {
    let token = getAccessToken();
    
    const makeRequest = async (authToken) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
    };
    
    let response = await makeRequest(token);
    
    // If unauthorized, try refreshing token
    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await makeRequest(newToken);
        }
    }
    
    return response;
};

export const api = {
    // Base methods
    get: async (endpoint) => {
        const response = await fetchWithAuth(endpoint);
        return response.json();
    },
    
    post: async (endpoint, data) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    put: async (endpoint, data) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    patch: async (endpoint, data) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    delete: async (endpoint) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'DELETE'
        });
        if (response.status === 204) return { success: true };
        return response.json();
    },

    // Auth methods (no auth required)
    auth: {
        login: async (email, password) => {
            const response = await fetch(`${API_URL}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success && data.data?.tokens) {
                setTokens(data.data.tokens.access, data.data.tokens.refresh);
            }
            return data;
        },
        
        register: async (userData) => {
            const response = await fetch(`${API_URL}/users/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (data.success && data.data?.tokens) {
                setTokens(data.data.tokens.access, data.data.tokens.refresh);
            }
            return data;
        },
        
        logout: async () => {
            try {
                await api.post('/users/logout/', { refresh: getRefreshToken() });
            } finally {
                clearTokens();
            }
        },
        
        refreshToken: refreshAccessToken
    },

    // User methods
    users: {
        getProfile: () => api.get('/users/profile/'),
        updateProfile: (data) => api.patch('/users/profile/', data),
        getContacts: () => api.get('/users/contacts/'),
        addContact: (userId) => api.post('/users/contacts/', { contact_id: userId }),
        removeContact: (contactId) => api.delete(`/users/contacts/${contactId}/`),
        blockUser: (userId) => api.post('/users/blocked/', { blocked_user_id: userId }),
        unblockUser: (blockedId) => api.delete(`/users/blocked/${blockedId}/`),
        search: (query) => api.get(`/users/search/?q=${encodeURIComponent(query)}`)
    },

    // Chat methods
    chat: {
        getConversations: () => api.get('/chat/conversations/'),
        createConversation: (participantIds) => api.post('/chat/conversations/', { participant_ids: participantIds }),
        getConversation: (id) => api.get(`/chat/conversations/${id}/`),
        getMessages: (conversationId, page = 1) => api.get(`/chat/conversations/${conversationId}/messages/?page=${page}`),
        sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages/`, data),
        deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}/`),
        markAsRead: (conversationId) => api.post(`/chat/conversations/${conversationId}/read/`)
    },

    // AI Services
    ai: {
        getStatus: async () => {
            const response = await fetch(`${API_URL}/ai/status/`);
            return response.json();
        },
        
        textToSpeech: (text, voiceSettings = {}) => api.post('/ai/tts/', { 
            text, 
            ...voiceSettings 
        }),
        
        speechToText: (audioBase64, language = 'en-US') => api.post('/ai/stt/', { 
            audio: audioBase64, 
            language 
        }),
        
        getVoices: () => api.get('/ai/tts/voices/'),
        getLanguages: () => api.get('/ai/stt/languages/'),
        
        analyzeSentiment: (text) => api.post('/ai/sentiment/', { text }),
        analyzeConversationMood: (messages) => api.post('/ai/sentiment/conversation/', { messages }),
        
        assistant: (task, text, context = {}) => api.post('/ai/assistant/', { task, text, context }),
        composeMessage: (intent, tone = 'friendly') => api.post('/ai/assistant/', { 
            task: 'compose', 
            text: intent, 
            context: { tone } 
        }),
        
        detectFaces: (imageBase64) => api.post('/ai/face-detection/', { image: imageBase64 })
    },

    // Mood & Wellness
    mood: {
        logMood: (mood, notes = '') => api.post('/mood/entries/', { mood, notes }),
        getMoodHistory: (days = 7) => api.get(`/mood/entries/?days=${days}`),
        getMoodStats: () => api.get('/mood/stats/'),
        
        getSounds: (category = null) => api.get(`/mood/sounds/${category ? `?category=${category}` : ''}`),
        getRecommendedSounds: (mood) => api.get(`/mood/sounds/recommended/?mood=${mood}`),
        logSoundSession: (soundId, duration) => api.post('/mood/sound-sessions/', { sound_id: soundId, duration })
    },

    // Accessibility
    accessibility: {
        getPresets: () => api.get('/accessibility/presets/'),
        getPreset: (id) => api.get(`/accessibility/presets/${id}/`),
        
        getQuickPhrases: () => api.get('/accessibility/quick-phrases/'),
        createQuickPhrase: (data) => api.post('/accessibility/quick-phrases/', data),
        updateQuickPhrase: (id, data) => api.patch(`/accessibility/quick-phrases/${id}/`, data),
        deleteQuickPhrase: (id) => api.delete(`/accessibility/quick-phrases/${id}/`),
        
        submitFeedback: (feature, rating, comment) => api.post('/accessibility/feedback/', { 
            feature, rating, comment 
        })
    },

    // Security
    security: {
        getAlerts: () => api.get('/security/alerts/'),
        dismissAlert: (alertId) => api.patch(`/security/alerts/${alertId}/`, { dismissed: true }),
        
        getSessions: () => api.get('/security/sessions/'),
        terminateSession: (sessionId) => api.delete(`/security/sessions/${sessionId}/`),
        
        getTrustedDevices: () => api.get('/security/trusted-devices/'),
        addTrustedDevice: (deviceInfo) => api.post('/security/trusted-devices/', deviceInfo),
        removeTrustedDevice: (deviceId) => api.delete(`/security/trusted-devices/${deviceId}/`)
    }
};

// Helper to check if user is authenticated
export const isAuthenticated = () => !!getAccessToken();

// Export token management for use in other components
export { setTokens, clearTokens, getAccessToken, getRefreshToken };
