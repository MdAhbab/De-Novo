import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

export const useSpeechToText = (options = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [supported, setSupported] = useState(true);
    const [loading, setLoading] = useState(false);
    const [useBackend, setUseBackend] = useState(false); // Default to browser for real-time
    const [error, setError] = useState(null);
    
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Initialize browser speech recognition
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
            setError(event.error);
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, [options.continuous, options.lang]);

    // Browser-based speech recognition (real-time)
    const startBrowserListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setError(null);
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
                setError(e.message);
            }
        }
    }, [isListening]);

    const stopBrowserListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    // Start recording for backend processing
    const startRecording = useCallback(async () => {
        setError(null);
        audioChunksRef.current = [];
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start(100); // Collect data every 100ms
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied');
        }
    }, []);

    // Stop recording and send to backend
    const stopRecording = useCallback(async () => {
        if (!mediaRecorderRef.current) return;

        return new Promise((resolve) => {
            mediaRecorderRef.current.onstop = async () => {
                setIsListening(false);
                setLoading(true);

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const base64Audio = await blobToBase64(audioBlob);

                    const response = await api.ai.speechToText(base64Audio, {
                        language_code: options.lang || 'en-US',
                        encoding: 'WEBM_OPUS',
                        sample_rate_hertz: 48000
                    });

                    if (response.success && response.data?.transcript) {
                        const text = response.data.transcript;
                        setTranscript(prev => prev ? prev + ' ' + text : text);
                        resolve({ success: true, transcript: text });
                    } else {
                        throw new Error(response.error?.message || 'Transcription failed');
                    }
                } catch (err) {
                    console.error('Backend STT failed:', err);
                    setError(err.message);
                    resolve({ success: false, error: err.message });
                } finally {
                    setLoading(false);
                }

                // Stop all tracks
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.stop();
        });
    }, [options.lang]);

    // Main start listening function
    const startListening = useCallback(() => {
        if (useBackend) {
            return startRecording();
        }
        return startBrowserListening();
    }, [useBackend, startRecording, startBrowserListening]);

    // Main stop listening function
    const stopListening = useCallback(() => {
        if (useBackend) {
            return stopRecording();
        }
        return stopBrowserListening();
    }, [useBackend, stopRecording, stopBrowserListening]);

    // Transcribe an audio file using backend
    const transcribeFile = useCallback(async (file) => {
        setLoading(true);
        setError(null);

        try {
            const base64Audio = await fileToBase64(file);
            
            // Determine encoding from file type
            let encoding = 'LINEAR16';
            if (file.type.includes('webm')) encoding = 'WEBM_OPUS';
            else if (file.type.includes('ogg')) encoding = 'OGG_OPUS';
            else if (file.type.includes('mp3')) encoding = 'MP3';
            else if (file.type.includes('flac')) encoding = 'FLAC';

            const response = await api.ai.speechToText(base64Audio, {
                language_code: options.lang || 'en-US',
                encoding
            });

            if (response.success && response.data?.transcript) {
                return { success: true, transcript: response.data.transcript };
            }
            throw new Error(response.error?.message || 'Transcription failed');
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [options.lang]);

    // Clear transcript
    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return { 
        isListening, 
        transcript, 
        interimTranscript, 
        startListening, 
        stopListening, 
        supported, 
        setTranscript,
        clearTranscript,
        loading,
        error,
        useBackend,
        setUseBackend,
        transcribeFile,
        // Expose both methods directly
        startBrowserListening,
        stopBrowserListening,
        startRecording,
        stopRecording
    };
};

// Helper function to convert blob to base64
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper function to convert file to base64
async function fileToBase64(file) {
    return blobToBase64(file);
}
