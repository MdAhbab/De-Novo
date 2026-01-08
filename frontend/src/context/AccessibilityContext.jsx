import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, isAuthenticated } from '../utils/api';

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

export const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem('accessibility_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });
    
    const [presets, setPresets] = useState([]);
    const [quickPhrases, setQuickPhrases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // Destructure for convenience
    const {
        fontSize,
        ttsEnabled,
        sttEnabled,
        colorBlindMode,
        reduceMotion,
        highContrast,
        screenReaderOptimized,
        keyboardNavigationEnhanced,
        signLanguageMode,
        hapticFeedback,
        visualAlerts,
        autoReadMessages,
        simplifiedUI
    } = settings;

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    }, [settings]);

    // Apply font size to document
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    // Apply high contrast mode
    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    // Apply reduce motion
    useEffect(() => {
        if (reduceMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }, [reduceMotion]);

    // Apply color blind mode
    useEffect(() => {
        document.documentElement.setAttribute('data-color-blind-mode', colorBlindMode);
    }, [colorBlindMode]);

    // Fetch presets from backend
    const fetchPresets = useCallback(async () => {
        try {
            const response = await api.accessibility.getPresets();
            if (response.success && response.data) {
                setPresets(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch presets:', err);
        }
    }, []);

    // Fetch quick phrases from backend
    const fetchQuickPhrases = useCallback(async () => {
        if (!isAuthenticated()) return;
        
        try {
            const response = await api.accessibility.getQuickPhrases();
            if (response.success && response.data) {
                setQuickPhrases(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch quick phrases:', err);
        }
    }, []);

    // Load presets on mount
    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    // Load quick phrases when authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            fetchQuickPhrases();
        }
    }, [fetchQuickPhrases]);

    // Update a single setting
    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Apply a preset
    const applyPreset = (preset) => {
        if (!preset?.settings) return;
        
        setSettings(prev => ({
            ...prev,
            ...preset.settings
        }));
        setActivePreset(preset.id);
    };

    // Font size helpers
    const increaseFontSize = () => updateSetting('fontSize', Math.min(fontSize + 2, 32));
    const decreaseFontSize = () => updateSetting('fontSize', Math.max(fontSize - 2, 12));
    const resetFontSize = () => updateSetting('fontSize', 16);

    // Setters for backward compatibility
    const setFontSize = (value) => updateSetting('fontSize', value);
    const setTtsEnabled = (value) => updateSetting('ttsEnabled', value);
    const setSttEnabled = (value) => updateSetting('sttEnabled', value);
    const setColorBlindMode = (value) => updateSetting('colorBlindMode', value);
    const setReduceMotion = (value) => updateSetting('reduceMotion', value);
    const setHighContrast = (value) => updateSetting('highContrast', value);
    const setScreenReaderOptimized = (value) => updateSetting('screenReaderOptimized', value);
    const setKeyboardNavigationEnhanced = (value) => updateSetting('keyboardNavigationEnhanced', value);
    const setSignLanguageMode = (value) => updateSetting('signLanguageMode', value);
    const setHapticFeedback = (value) => updateSetting('hapticFeedback', value);
    const setVisualAlerts = (value) => updateSetting('visualAlerts', value);
    const setAutoReadMessages = (value) => updateSetting('autoReadMessages', value);
    const setSimplifiedUI = (value) => updateSetting('simplifiedUI', value);

    // Add a quick phrase
    const addQuickPhrase = async (text, category = 'general') => {
        try {
            const response = await api.accessibility.createQuickPhrase(text, category);
            if (response.success) {
                setQuickPhrases(prev => [...prev, response.data]);
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (err) {
            return { success: false, error: 'Failed to add phrase' };
        }
    };

    // Reset all settings
    const resetAllSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        setActivePreset(null);
    };

    // Submit accessibility feedback
    const submitFeedback = async (feedbackText, feedbackType = 'general') => {
        try {
            const response = await api.accessibility.submitFeedback({
                feedback_text: feedbackText,
                feedback_type: feedbackType,
                current_settings: settings
            });
            return response.success ? { success: true } : { success: false, error: response.error };
        } catch (err) {
            return { success: false, error: 'Failed to submit feedback' };
        }
    };

    return (
        <AccessibilityContext.Provider value={{
            // Current settings
            fontSize,
            ttsEnabled,
            sttEnabled,
            colorBlindMode,
            reduceMotion,
            highContrast,
            screenReaderOptimized,
            keyboardNavigationEnhanced,
            signLanguageMode,
            hapticFeedback,
            visualAlerts,
            autoReadMessages,
            simplifiedUI,
            
            // Setters
            setFontSize,
            setTtsEnabled,
            setSttEnabled,
            setColorBlindMode,
            setReduceMotion,
            setHighContrast,
            setScreenReaderOptimized,
            setKeyboardNavigationEnhanced,
            setSignLanguageMode,
            setHapticFeedback,
            setVisualAlerts,
            setAutoReadMessages,
            setSimplifiedUI,
            
            // Font helpers
            increaseFontSize,
            decreaseFontSize,
            resetFontSize,
            
            // Generic update
            updateSetting,
            settings,
            
            // Presets
            presets,
            activePreset,
            applyPreset,
            fetchPresets,
            
            // Quick phrases
            quickPhrases,
            addQuickPhrase,
            fetchQuickPhrases,
            
            // Other
            resetAllSettings,
            submitFeedback,
            loading
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => useContext(AccessibilityContext);
