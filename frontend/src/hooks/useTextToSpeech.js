import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSupported(true);
            const loadVoices = () => {
                setVoices(window.speechSynthesis.getVoices());
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            setSupported(false);
        }
    }, []);

    const speak = useCallback((text, rate = 1, pitch = 1) => {
        if (!supported) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported]);

    const cancel = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
    }, [supported]);

    return { speak, cancel, speaking, supported, voices };
};
