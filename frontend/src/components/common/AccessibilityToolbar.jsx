import { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';
import { ZoomIn, ZoomOut, Eye, MessageSquare, Moon, Sun, Monitor } from 'lucide-react';

export default function AccessibilityToolbar() {
    const [expanded, setExpanded] = useState(false);
    const { increaseFontSize, decreaseFontSize, ttsEnabled, setTtsEnabled } = useAccessibility();
    const { toggleTheme, setHighContrast, theme } = useTheme();

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition z-50 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary"
                aria-label="Open Accessibility Options"
                title="Accessibility Tools"
            >
                <Eye size={28} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 space-y-4 z-50 animate-in slide-in-from-bottom-5" role="dialog" aria-label="Accessibility Tools">
            <div className="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                    <Eye size={20} /> Accessibility
                </h3>
                <button onClick={() => setExpanded(false)} className="text-gray-500 hover:text-black dark:hover:text-white p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">✖</button>
            </div>

            <div className="space-y-4">
                {/* Font Size */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-200">Text Size</span>
                    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={decreaseFontSize} aria-label="Decrease Font Size" className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition"><ZoomOut size={16} /></button>
                        <button onClick={increaseFontSize} aria-label="Increase Font Size" className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition"><ZoomIn size={16} /></button>
                    </div>
                </div>

                {/* Theme Toggles */}
                <div className="flex justify-between items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm transition"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                    <button
                        onClick={setHighContrast}
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-yellow-400 text-black font-bold rounded text-sm hover:bg-yellow-500 transition"
                        aria-label="Enable High Contrast"
                    >
                        <Monitor size={16} /> Contrast
                    </button>
                </div>

                {/* TTS Toggle */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <div className="flex items-center gap-2 text-sm dark:text-gray-200">
                        <MessageSquare size={16} />
                        <span>Text to Speech</span>
                    </div>
                    <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ttsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                        role="switch"
                        aria-checked={ttsEnabled}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ttsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
            <div className="text-xs text-center text-gray-400 mt-2">
                Press <kbd className="bg-gray-200 px-1 rounded">Alt</kbd> + <kbd className="bg-gray-200 px-1 rounded">A</kbd> to toggle
            </div>
        </div>
    );
}
