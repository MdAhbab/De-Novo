import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechToText = (options = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [supported, setSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = options.continuous || false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = options.lang || 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);

        recognitionRef.current.onresult = (event) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) setTranscript(prev => prev ? prev + ' ' + final : final);
            setInterimTranscript(interim);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

    }, [options.continuous, options.lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return { isListening, transcript, interimTranscript, startListening, stopListening, supported, setTranscript };
};
