import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, isAuthenticated } from '../utils/api';
import { toast } from '../utils/toast';

const AccessibilityContext = createContext(null);

// Default settings
const DEFAULT_SETTINGS = {
    fontSize: 16,
    ttsEnabled: false,
    sttEnabled: false,
    colorBlindMode: 'none',
    reduceMotion: false,
    highContrast: false,
    screenReaderOptimized: false,
    keyboardNavigationEnhanced: false,
    signLanguageMode: false,
    hapticFeedback: false,
    visualAlerts: false,
    autoReadMessages: false,
    simplifiedUI: false
};

// Map frontend camelCase keys to backend snake_case fields
const BACKEND_KEY_MAP = {
    fontSize:    'font_size',
    highContrast: 'high_contrast',
    colorBlindMode: 'color_blind_mode',
    reduceMotion: 'reduce_motion',
    ttsEnabled:   'tts_enabled',
    sttEnabled:   'stt_enabled',
    peepingTomEnabled: 'peeping_tom_enabled',
};

const toBackendPayload = (settings) => {
    const payload = {};
    Object.entries(BACKEND_KEY_MAP).forEach(([fe, be]) => {
        if (settings[fe] !== undefined) payload[be] = settings[fe];
    });
    return payload;
};

export const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('accessibility_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });
    
    const [presets, setPresets] = useState([]);
    const [quickPhrases, setQuickPhrases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);
    
    // Debounce backend sync
    const syncTimerRef = useRef(null);

    const {
        fontSize, ttsEnabled, sttEnabled, colorBlindMode, reduceMotion, highContrast,
        screenReaderOptimized, keyboardNavigationEnhanced, signLanguageMode,
        hapticFeedback, visualAlerts, autoReadMessages, simplifiedUI
    } = settings;

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    }, [settings]);

    // Sync to backend (debounced, API-06)
    const syncToBackend = useCallback((newSettings) => {
        if (!isAuthenticated()) return;
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(async () => {
            try {
                await api.users.updateAccessibilitySettings(toBackendPayload(newSettings));
            } catch {
                // Non-fatal: settings are safe in localStorage
            }
        }, 1000);
    }, []);

    // Load settings from backend on mount
    useEffect(() => {
        if (!isAuthenticated()) return;
        api.users.getAccessibilitySettings().then(res => {
            if (res.success && res.data) {
                // Merge backend settings (backend is source of truth)
                const backendSettings = {};
                if (res.data.font_size       !== undefined) backendSettings.fontSize      = res.data.font_size;
                if (res.data.high_contrast   !== undefined) backendSettings.highContrast  = res.data.high_contrast;
                if (res.data.color_blind_mode !== undefined) backendSettings.colorBlindMode = res.data.color_blind_mode;
                if (res.data.reduce_motion   !== undefined) backendSettings.reduceMotion  = res.data.reduce_motion;
                if (res.data.tts_enabled     !== undefined) backendSettings.ttsEnabled    = res.data.tts_enabled;
                if (res.data.stt_enabled     !== undefined) backendSettings.sttEnabled    = res.data.stt_enabled;
                setSettings(prev => ({ ...prev, ...backendSettings }));
            }
        }).catch(() => {});
    }, []);

    // Apply font size to document
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    // Apply high contrast mode
    useEffect(() => {
        document.documentElement.classList.toggle('high-contrast', highContrast);
        if (highContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [highContrast]);

    // Apply reduce motion
    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    }, [reduceMotion]);

    // Apply color blind mode (A11Y-01)
    useEffect(() => {
        document.documentElement.setAttribute('data-color-blind-mode', colorBlindMode || 'none');
    }, [colorBlindMode]);

    // Fetch presets from backend (API-16: unwrapped in api.js)
    const fetchPresets = useCallback(async () => {
        try {
            const response = await api.accessibility.getPresets();
            if (response.success && Array.isArray(response.data)) {
                setPresets(response.data);
            }
        } catch {}
    }, []);

    // Fetch quick phrases (API-15: unwrapped in api.js)
    const fetchQuickPhrases = useCallback(async () => {
        if (!isAuthenticated()) return;
        try {
            const response = await api.accessibility.getQuickPhrases();
            if (response.success && Array.isArray(response.data)) {
                setQuickPhrases(response.data);
            }
        } catch {}
    }, []);

    useEffect(() => { fetchPresets(); }, [fetchPresets]);
    useEffect(() => {
        if (isAuthenticated()) fetchQuickPhrases();
    }, [fetchQuickPhrases]);

    // Update a single setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            syncToBackend(next);
            return next;
        });
    }, [syncToBackend]);

    // Bulk update (FE-02: was updateSettings plural — now we provide it)
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const next = { ...prev, ...newSettings };
            syncToBackend(next);
            return next;
        });
    }, [syncToBackend]);

    // Apply a preset
    const applyPreset = (preset) => {
        if (!preset?.settings) return;
        setSettings(prev => {
            const next = { ...prev, ...preset.settings };
            syncToBackend(next);
            return next;
        });
        setActivePreset(preset.id);
    };

    // Font size helpers
    const increaseFontSize = () => updateSetting('fontSize', Math.min(fontSize + 2, 32));
    const decreaseFontSize = () => updateSetting('fontSize', Math.max(fontSize - 2, 12));
    const resetFontSize    = () => updateSetting('fontSize', 16);
    const setFontSize      = (v) => updateSetting('fontSize', v);

    // Convenience setters
    const setTtsEnabled               = (v) => updateSetting('ttsEnabled', v);
    const setSttEnabled               = (v) => updateSetting('sttEnabled', v);
    const setColorBlindMode           = (v) => updateSetting('colorBlindMode', v);
    const setReduceMotion             = (v) => updateSetting('reduceMotion', v);
    const setHighContrast             = (v) => updateSetting('highContrast', v);
    const setScreenReaderOptimized    = (v) => updateSetting('screenReaderOptimized', v);
    const setKeyboardNavigationEnhanced = (v) => updateSetting('keyboardNavigationEnhanced', v);
    const setSignLanguageMode         = (v) => updateSetting('signLanguageMode', v);
    const setHapticFeedback           = (v) => updateSetting('hapticFeedback', v);
    const setVisualAlerts             = (v) => updateSetting('visualAlerts', v);
    const setAutoReadMessages         = (v) => updateSetting('autoReadMessages', v);
    const setSimplifiedUI             = (v) => updateSetting('simplifiedUI', v);

    // Add a quick phrase (API-13: {phrase, category})
    const addQuickPhrase = async (text, category = 'general') => {
        try {
            const response = await api.accessibility.createQuickPhrase(text, category);
            if (response.success) {
                setQuickPhrases(prev => [...prev, response.data]);
                toast.success('Quick phrase added');
                return { success: true };
            }
            toast.error(response.error?.message || 'Failed to add phrase');
            return { success: false, error: response.error };
        } catch {
            toast.error('Failed to add phrase');
            return { success: false, error: 'Failed to add phrase' };
        }
    };

    // Reset all settings
    const resetAllSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        setActivePreset(null);
        syncToBackend(DEFAULT_SETTINGS);
    };

    // Submit accessibility feedback (API-14: {feature, rating, comment})
    const submitFeedback = async (feature, rating, comment) => {
        try {
            const response = await api.accessibility.submitFeedback(feature, rating, comment);
            if (response.success) {
                toast.success('Feedback submitted — thank you!');
                return { success: true };
            }
            toast.error('Failed to submit feedback');
            return { success: false, error: response.error };
        } catch {
            toast.error('Failed to submit feedback');
            return { success: false, error: 'Failed to submit feedback' };
        }
    };

    return (
        <AccessibilityContext.Provider value={{
            // Settings object
            settings,
            fontSize, ttsEnabled, sttEnabled, colorBlindMode, reduceMotion, highContrast,
            screenReaderOptimized, keyboardNavigationEnhanced, signLanguageMode,
            hapticFeedback, visualAlerts, autoReadMessages, simplifiedUI,

            // Setters
            setFontSize, setTtsEnabled, setSttEnabled, setColorBlindMode,
            setReduceMotion, setHighContrast, setScreenReaderOptimized,
            setKeyboardNavigationEnhanced, setSignLanguageMode, setHapticFeedback,
            setVisualAlerts, setAutoReadMessages, setSimplifiedUI,

            // Font helpers
            increaseFontSize, decreaseFontSize, resetFontSize,

            // Generic updates
            updateSetting,
            updateSettings,  // FE-02: plural form now provided

            // Presets
            presets, activePreset, applyPreset, fetchPresets,

            // Quick phrases
            quickPhrases, addQuickPhrase, fetchQuickPhrases,

            // Other
            resetAllSettings, submitFeedback, loading
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => useContext(AccessibilityContext);
