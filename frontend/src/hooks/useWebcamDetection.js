import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useWebcamDetection = (options = {}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    
    const [active, setActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [detecting, setDetecting] = useState(false);
    const [lastDetection, setLastDetection] = useState(null);
    const [privacyAlert, setPrivacyAlert] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [error, setError] = useState(null);
    
    // Detection settings
    const detectionInterval = options.detectionInterval || 3000; // Check every 3 seconds
    const alertThreshold = options.alertThreshold || 2; // Alert if more than 1 face

    // Start camera
    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setActive(true);
            return true;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError(err.message || 'Camera access denied');
            return false;
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setActive(false);
        }
        stopDetection();
    }, [stream]);

    // Capture frame from video
    const captureFrame = useCallback(() => {
        if (!videoRef.current || !active) return null;

        // Create or get canvas
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Return base64 image
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }, [active]);

    // Detect faces using backend
    const detectFaces = useCallback(async () => {
        if (!active) return null;

        const imageBase64 = captureFrame();
        if (!imageBase64) return null;

        setDetecting(true);
        try {
            const response = await api.ai.detectFaces(imageBase64);
            
            if (response.success && response.data) {
                const result = {
                    faceCount: response.data.face_count || response.data.faces?.length || 0,
                    faces: response.data.faces || [],
                    isPrivacyThreat: response.data.is_privacy_threat || false,
                    timestamp: new Date().toISOString()
                };
                
                setLastDetection(result);
                setFaceCount(result.faceCount);
                
                // Check for privacy threat (someone looking over shoulder)
                if (result.faceCount >= alertThreshold) {
                    setPrivacyAlert(true);
                    // Trigger callback if provided
                    if (options.onPrivacyAlert) {
                        options.onPrivacyAlert(result);
                    }
                } else {
                    setPrivacyAlert(false);
                }
                
                return result;
            }
            return null;
        } catch (err) {
            console.error('Face detection failed:', err);
            setError(err.message);
            return null;
        } finally {
            setDetecting(false);
        }
    }, [active, captureFrame, alertThreshold, options]);

    // Start continuous detection
    const startDetection = useCallback(() => {
        if (!active || intervalRef.current) return;
        
        // Run immediately
        detectFaces();
        
        // Then run on interval
        intervalRef.current = setInterval(() => {
            detectFaces();
        }, detectionInterval);
    }, [active, detectFaces, detectionInterval]);

    // Stop continuous detection
    const stopDetection = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setDetecting(false);
        setPrivacyAlert(false);
    }, []);

    // Start camera and detection together
    const startWithDetection = useCallback(async () => {
        const started = await startCamera();
        if (started) {
            // Wait for video to be ready
            setTimeout(() => {
                startDetection();
            }, 1000);
        }
        return started;
    }, [startCamera, startDetection]);

    // Dismiss privacy alert
    const dismissAlert = useCallback(() => {
        setPrivacyAlert(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [stream]);

    return { 
        videoRef, 
        startCamera, 
        stopCamera, 
        active,
        // Detection features
        detectFaces,
        startDetection,
        stopDetection,
        startWithDetection,
        detecting,
        lastDetection,
        faceCount,
        // Privacy alert
        privacyAlert,
        dismissAlert,
        alertThreshold,
        // Error handling
        error,
        clearError: () => setError(null)
    };
};
