import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export const useTextToSpeech = () => {
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [voices, setVoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [useBackend, setUseBackend] = useState(false); // Default to browser TTS for speed
    const audioRef = useRef(null);

    // Initialize browser speech synthesis
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

        // Cleanup audio on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Browser-based TTS (fast, offline capable)
    const speakBrowser = useCallback((text, options = {}) => {
        if (!supported) return;

        const { rate = 1, pitch = 1, voice = null, volume = 1 } = options;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        if (voice && voices.length > 0) {
            const selectedVoice = voices.find(v => v.name === voice || v.lang === voice);
            if (selectedVoice) utterance.voice = selectedVoice;
        }

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported, voices]);

    // Backend TTS using Google Cloud Text-to-Speech (higher quality)
    const speakBackend = useCallback(async (text, options = {}) => {
        if (!text?.trim()) return;

        const { 
            languageCode = 'en-US', 
            voiceName = null,
            ssmlGender = 'NEUTRAL',
            speakingRate = 1.0,
            pitch = 0
        } = options;

        setLoading(true);
        setSpeaking(true);

        try {
            const response = await api.ai.textToSpeech(text, {
                language_code: languageCode,
                voice_name: voiceName,
                ssml_gender: ssmlGender,
                speaking_rate: speakingRate,
                pitch: pitch
            });

            if (response.success && response.data?.audio_base64) {
                // Play the audio
                const audioContent = response.data.audio_base64;
                const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
                const audioUrl = URL.createObjectURL(audioBlob);

                // Stop any existing audio
                if (audioRef.current) {
                    audioRef.current.pause();
                }

                audioRef.current = new Audio(audioUrl);
                audioRef.current.onended = () => {
                    setSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                };
                audioRef.current.onerror = () => {
                    setSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                };

                await audioRef.current.play();
            } else {
                throw new Error('No audio data received');
            }
        } catch (err) {
            console.warn('Backend TTS failed, falling back to browser:', err);
            setSpeaking(false);
            // Fallback to browser TTS
            speakBrowser(text, { rate: speakingRate, pitch: pitch });
        } finally {
            setLoading(false);
        }
    }, [speakBrowser]);

    // Main speak function - uses backend or browser based on setting
    const speak = useCallback((text, options = {}) => {
        if (useBackend) {
            return speakBackend(text, options);
        }
        return speakBrowser(text, options);
    }, [useBackend, speakBackend, speakBrowser]);

    // Cancel speech
    const cancel = useCallback(() => {
        // Cancel browser speech
        if (supported) {
            window.speechSynthesis.cancel();
        }
        
        // Cancel backend audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
        setSpeaking(false);
    }, [supported]);

    // Pause speech (browser only)
    const pause = useCallback(() => {
        if (supported && speaking) {
            window.speechSynthesis.pause();
        }
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }, [supported, speaking]);

    // Resume speech (browser only)
    const resume = useCallback(() => {
        if (supported) {
            window.speechSynthesis.resume();
        }
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play();
        }
    }, [supported]);

    return { 
        speak, 
        speakBrowser,
        speakBackend,
        cancel, 
        pause,
        resume,
        speaking, 
        supported, 
        voices,
        loading,
        useBackend,
        setUseBackend
    };
};

// Helper function to convert base64 to blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}
