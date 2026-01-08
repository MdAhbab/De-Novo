import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(16);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [sttEnabled, setSttEnabled] = useState(false);
    const [colorBlindMode, setColorBlindMode] = useState('none');
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 14));
    const resetFontSize = () => setFontSize(16);

    return (
        <AccessibilityContext.Provider value={{
            fontSize,
            setFontSize,
            increaseFontSize,
            decreaseFontSize,
            resetFontSize,
            ttsEnabled,
            setTtsEnabled,
            sttEnabled,
            setSttEnabled,
            colorBlindMode,
            setColorBlindMode,
            reduceMotion,
            setReduceMotion
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => useContext(AccessibilityContext);
