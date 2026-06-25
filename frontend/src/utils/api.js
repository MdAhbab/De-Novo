/**
 * De-Novo API Client
 * 
 * Fixes applied:
 *   API-01  logout body field: 'refresh' → 'refresh_token'  (backend canonical)
 *   API-02  updateProfile URL: /users/profile/ → /users/profile/update/
 *   API-03  addContact URL + body: /users/contacts/ {contact_id} → /users/contacts/add/ {username}
 *   API-04  removeContact URL: /users/contacts/{id}/ → /users/contacts/{id}/remove/
 *   API-05  blockUser/unblockUser → /users/contacts/{id}/block/ and /unblock/ (POST)
 *   API-06  accessibility settings wired to /users/settings/accessibility/
 *   API-07  logMood: /mood/entries/ → /mood/entry/
 *   API-08  getMoodHistory: /mood/entries/ → /mood/history/
 *   API-09  getMoodStats: /mood/stats/ → /mood/analytics/
 *   API-10  getRecommendedSounds: /mood/sounds/recommended/ → /mood/sounds/recommendations/
 *   API-11  logSoundSession: /mood/sound-sessions/ → /mood/sessions/start/
 *   API-12  getSounds response: unwrap data.sounds (not bare array)
 *   API-13  createQuickPhrase: pass {category, phrase} not raw text
 *   API-14  submitFeedback: pass {feature, rating, comment}
 *   API-15  getQuickPhrases: unwrap data.phrases
 *   API-16  getPresets: unwrap data.presets
 *   API-17  dismissAlert: POST /security/alerts/dismiss/ {alert_id}
 *   API-18  terminateSession: /security/sessions/{id}/terminate/
 *   API-19  getTrustedDevices: /security/trusted-devices/ → /security/devices/
 *   API-21  register: send first_name/last_name (not display_name)
 *   FE-05   single-flight token refresh (concurrent 401s share one refresh call)
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Token management ─────────────────────────────────────────────────────────
const getAccessToken  = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (access, refresh) => {
    if (access)  localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// ── Single-flight token refresh (FE-05) ──────────────────────────────────────
// Concurrent 401 responses will share this one promise instead of racing.
let _refreshPromise = null;

const refreshAccessToken = async () => {
    // Re-use in-flight refresh if already running
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = (async () => {
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

            // Refresh failed — clear tokens and broadcast logout
            clearTokens();
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return null;
        } catch {
            clearTokens();
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return null;
        } finally {
            _refreshPromise = null;
        }
    })();

    return _refreshPromise;
};

// ── Safe JSON parse ───────────────────────────────────────────────────────────
const safeJson = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return { success: true };
    }
    const data = await response.json();
    return data;
};

// ── Base authenticated fetch ──────────────────────────────────────────────────
const fetchWithAuth = async (endpoint, options = {}) => {
    let token = getAccessToken();

    const makeRequest = (authToken) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        return fetch(`${API_URL}${endpoint}`, { ...options, headers });
    };

    let response = await makeRequest(token);

    // On 401, attempt single-flight refresh
    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await makeRequest(newToken);
        }
    }

    return response;
};

// ── api object ────────────────────────────────────────────────────────────────
export const api = {
    // ── Base methods ──────────────────────────────────────────────────────
    get: async (endpoint) => {
        const res = await fetchWithAuth(endpoint);
        return safeJson(res);
    },

    post: async (endpoint, data) => {
        const res = await fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return safeJson(res);
    },

    put: async (endpoint, data) => {
        const res = await fetchWithAuth(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return safeJson(res);
    },

    patch: async (endpoint, data) => {
        const res = await fetchWithAuth(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return safeJson(res);
    },

    delete: async (endpoint) => {
        const res = await fetchWithAuth(endpoint, { method: 'DELETE' });
        if (res.status === 204) return { success: true };
        return safeJson(res);
    },

    // Multipart upload (for avatars etc.)
    upload: async (endpoint, formData) => {
        const token = getAccessToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });
        return safeJson(res);
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    auth: {
        login: async (email, password) => {
            const res = await fetch(`${API_URL}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await safeJson(res);
            if (data.success && data.data?.tokens) {
                setTokens(data.data.tokens.access, data.data.tokens.refresh);
            }
            return data;
        },

        register: async (userData) => {
            // API-21: Send first_name/last_name (not display_name)
            const payload = { ...userData };
            if (payload.display_name && !payload.first_name) {
                const parts = (payload.display_name || '').trim().split(' ');
                payload.first_name = parts[0] || '';
                payload.last_name  = parts.slice(1).join(' ') || '';
                delete payload.display_name;
            }
            if (payload.name && !payload.first_name) {
                const parts = (payload.name || '').trim().split(' ');
                payload.first_name = parts[0] || '';
                payload.last_name  = parts.slice(1).join(' ') || '';
                delete payload.name;
            }

            const res = await fetch(`${API_URL}/users/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await safeJson(res);
            if (data.success && data.data?.tokens) {
                setTokens(data.data.tokens.access, data.data.tokens.refresh);
            }
            return data;
        },

        logout: async () => {
            try {
                // API-01: backend reads 'refresh_token' (accept both for safety)
                await api.post('/users/logout/', { refresh_token: getRefreshToken() });
            } finally {
                clearTokens();
            }
        },

        refreshToken: refreshAccessToken
    },

    // ── Users ─────────────────────────────────────────────────────────────
    users: {
        getProfile:    () => api.get('/users/profile/'),
        // API-02: profile update URL is /profile/update/
        updateProfile: (data) => api.patch('/users/profile/update/', data),
        uploadAvatar:  (formData) => api.upload('/users/profile/avatar/', formData),
        updatePublicKey: (key) => api.post('/users/profile/public-key/', { public_key: key }),
        completeOnboarding: () => api.post('/users/profile/onboarding/complete/'),

        getContacts:    () => api.get('/users/contacts/'),
        // API-03: addContact uses /contacts/add/ with {username}
        addContact:    (username) => api.post('/users/contacts/add/', { username }),
        // API-04: removeContact uses /contacts/<id>/remove/
        removeContact: (userId) => api.delete(`/users/contacts/${userId}/remove/`),
        // API-05: block/unblock as POST on /contacts/<id>/block/ and /unblock/
        blockUser:    (userId) => api.post(`/users/contacts/${userId}/block/`),
        unblockUser:  (userId) => api.post(`/users/contacts/${userId}/unblock/`),

        search: (query) => api.get(`/users/search/?q=${encodeURIComponent(query)}`),
        setOnlineStatus: (isOnline) => api.post('/users/status/online/', { is_online: isOnline }),

        // API-06: Persist accessibility settings server-side
        getAccessibilitySettings:    () => api.get('/users/settings/accessibility/'),
        updateAccessibilitySettings: (data) => api.patch('/users/settings/accessibility/', data),

        getUserProfile: (userId) => api.get(`/users/profile/${userId}/`),
    },

    // ── Chat ──────────────────────────────────────────────────────────────
    chat: {
        getConversations:  () => api.get('/chat/conversations/'),
        createConversation: (participantIds, type = 'direct') => api.post('/chat/conversations/create/', {
            participant_ids: Array.isArray(participantIds) ? participantIds : [participantIds],
            conversation_type: type
        }),
        getConversation: (id)  => api.get(`/chat/conversations/${id}/`),
        getMessages: (convId, page = 1) => api.get(`/chat/conversations/${convId}/messages/?page=${page}`),
        sendMessage: (convId, content, messageType = 'text') => api.post('/chat/messages/send/', {
            conversation_id: convId,
            content,
            message_type: messageType
        }),
        deleteMessage: (msgId) => api.delete(`/chat/messages/${msgId}/delete/`),
        markAsRead:    (convId) => api.post(`/chat/conversations/${convId}/read/`),
        markMessageAsRead: (msgId) => api.post(`/chat/messages/${msgId}/read/`),
    },

    // ── AI Services ───────────────────────────────────────────────────────
    ai: {
        getStatus: async () => {
            const res = await fetch(`${API_URL}/ai/status/`);
            return safeJson(res);
        },
        textToSpeech:    (text, voiceSettings = {}) => api.post('/ai/tts/', { text, ...voiceSettings }),
        speechToText:    (audioBase64, options = {}) => api.post('/ai/stt/', {
            audio_base64: audioBase64,
            language_code: options.language_code || 'en-US',
            encoding: options.encoding || 'WEBM_OPUS',
            sample_rate: options.sample_rate_hertz || 48000
        }),
        getVoices:    () => api.get('/ai/tts/voices/'),
        getLanguages: () => api.get('/ai/stt/languages/'),
        analyzeSentiment:       (text) => api.post('/ai/sentiment/', { text }),
        analyzeConversationMood:(msgs) => api.post('/ai/sentiment/conversation/', { messages: msgs }),
        assistant:      (task, text, context = {}) => api.post('/ai/assistant/', { task, text, context }),
        composeMessage: (intent, tone = 'friendly') => api.post('/ai/assistant/', {
            task: 'compose',
            text: intent,
            context: { tone }
        }),
        detectFaces: (imageBase64) => api.post('/ai/face-detection/', { image: imageBase64 }),
    },

    // ── Mood & Wellness ───────────────────────────────────────────────────
    mood: {
        // API-07: /mood/entries/ → /mood/entry/
        logMood: (mood, notes = '') => api.post('/mood/entry/', { mood, notes }),
        // API-08: /mood/entries/ → /mood/history/
        getMoodHistory: (days = 7) => api.get(`/mood/history/?days=${days}`),
        // API-09: /mood/stats/ → /mood/analytics/
        getMoodStats: () => api.get('/mood/analytics/'),

        // API-12: getSounds unwraps data.sounds
        getSounds: async (category = null) => {
            const url = `/mood/sounds/${category ? `?category=${category}` : ''}`;
            const res = await api.get(url);
            if (res.success && res.data?.sounds) {
                return { ...res, data: res.data.sounds };
            }
            return res;
        },

        // API-10: /mood/sounds/recommended/ → /mood/sounds/recommendations/
        getRecommendedSounds: (mood) => api.get(`/mood/sounds/recommendations/?mood=${mood}`),

        // API-11: /mood/sound-sessions/ → /mood/sessions/start/
        logSoundSession: (soundId, duration) => api.post('/mood/sessions/start/', {
            sound_id: soundId,
            duration
        }),
        endSoundSession: (sessionId) => api.post('/mood/sessions/end/', { session_id: sessionId }),
    },

    // ── Accessibility ─────────────────────────────────────────────────────
    accessibility: {
        // API-16: getPresets unwraps data.presets
        getPresets: async () => {
            const res = await api.get('/accessibility/presets/');
            if (res.success && res.data?.presets) {
                return { ...res, data: res.data.presets };
            }
            return res;
        },
        getPreset:   (id)   => api.get(`/accessibility/presets/${id}/`),
        applyPreset: (id)   => api.post('/accessibility/presets/apply/', { preset_id: id }),

        // API-15: getQuickPhrases unwraps data.phrases
        getQuickPhrases: async () => {
            const res = await api.get('/accessibility/quick-phrases/');
            if (res.success && res.data?.phrases) {
                return { ...res, data: res.data.phrases };
            }
            return res;
        },
        // API-13: createQuickPhrase sends {category, phrase} not raw text
        createQuickPhrase: (phrase, category = 'general') =>
            api.post('/accessibility/quick-phrases/', { phrase, category }),
        updateQuickPhrase: (id, data) => api.patch(`/accessibility/quick-phrases/${id}/`, data),
        deleteQuickPhrase: (id)       => api.delete(`/accessibility/quick-phrases/${id}/`),

        // API-14: submitFeedback passes {feature, rating, comment}
        submitFeedback: (feature, rating, comment) =>
            api.post('/accessibility/feedback/', { feature, rating, comment }),

        getTips: () => api.get('/accessibility/tips/'),
    },

    // ── Security ──────────────────────────────────────────────────────────
    security: {
        getAlerts: () => api.get('/security/alerts/'),
        // API-17: dismissAlert → POST /security/alerts/dismiss/ with {alert_id}
        dismissAlert: (alertId) => api.post('/security/alerts/dismiss/', { alert_id: alertId }),

        getSessions: () => api.get('/security/sessions/'),
        // API-18: terminateSession → /security/sessions/{id}/terminate/
        terminateSession:    (sessionId) => api.delete(`/security/sessions/${sessionId}/terminate/`),
        terminateAllSessions: ()          => api.post('/security/sessions/terminate-all/'),

        // API-19: getTrustedDevices → /security/devices/
        getTrustedDevices:    ()          => api.get('/security/devices/'),
        addTrustedDevice:     (deviceInfo) => api.post('/security/devices/', deviceInfo),
        // API-19: removeTrustedDevice → /security/devices/{id}/
        removeTrustedDevice:  (deviceId)  => api.delete(`/security/devices/${deviceId}/`),

        getSecuritySummary: () => api.get('/security/summary/'),
        getSecurityEvents:  () => api.get('/security/events/'),
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const isAuthenticated = () => !!getAccessToken();

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
