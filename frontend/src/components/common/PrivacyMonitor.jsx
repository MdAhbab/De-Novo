import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../utils/api';

const EMOTION_LIKELIHOODS = {
    'VERY_UNLIKELY': 0,
    'UNLIKELY': 25,
    'POSSIBLE': 50,
    'LIKELY': 75,
    'VERY_LIKELY': 100,
    'UNKNOWN': 0
};

const PrivacyMonitor = ({ children }) => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [isBlurred, setIsBlurred] = useState(false);
    const [userEmotion, setUserEmotion] = useState(null);
    const [showMiniCam, setShowMiniCam] = useState(true);
    const [cameraError, setCameraError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const analysisIntervalRef = useRef(null);
    const isAnalyzingRef = useRef(false);
    
    // Start camera and monitoring
    const startMonitoring = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' }
            });
            
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            setIsMonitoring(true);
            setCameraError(null);
            
            // Start periodic face detection (every 2 seconds)
            analysisIntervalRef.current = setInterval(() => {
                captureAndAnalyze();
            }, 2000);
            
        } catch (err) {
            console.error('Camera access denied:', err);
            setCameraError('Camera access denied. Please allow camera access for privacy protection.');
            setIsMonitoring(false);
        }
    }, []);
    
    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        
        setIsMonitoring(false);
        setFaceCount(0);
        setIsBlurred(false);
        setUserEmotion(null);
    }, []);
    
    // Capture frame and analyze
    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzingRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Ensure video is playing
        if (video.readyState !== 4) return;
        
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.6);
        const base64Data = imageData.split(',')[1];
        
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        
        try {
            const response = await api.ai.detectFaces(base64Data);
            
            // Response format: {success: true, data: {face_count, faces, ...}}
            if (response && response.success && response.data) {
                const count = response.data.face_count || 0;
                setFaceCount(count);
                
                // Blur if more than 3 faces detected
                setIsBlurred(count > 3);
                
                // Get primary user emotion (first face)
                if (response.data.faces && response.data.faces.length > 0) {
                    const primaryFace = response.data.faces[0];
                    setUserEmotion({
                        joy: EMOTION_LIKELIHOODS[primaryFace.joy] || 0,
                        sorrow: EMOTION_LIKELIHOODS[primaryFace.sorrow] || 0,
                        anger: EMOTION_LIKELIHOODS[primaryFace.anger] || 0,
                        surprise: EMOTION_LIKELIHOODS[primaryFace.surprise] || 0,
                        confidence: Math.round((primaryFace.confidence || 0) * 100)
                    });
                } else {
                    setUserEmotion(null);
                }
            }
        } catch (err) {
            console.error('Face analysis failed:', err);
        } finally {
            isAnalyzingRef.current = false;
            setIsAnalyzing(false);
        }
    }, []);
    
    // Auto-start monitoring on mount
    useEffect(() => {
        startMonitoring();
        
        return () => {
            stopMonitoring();
        };
    }, []);
    
    // Get dominant emotion
    const getDominantEmotion = () => {
        if (!userEmotion) return null;
        
        const emotions = [
            { name: 'Happy', value: userEmotion.joy, icon: 'sentiment_very_satisfied', color: 'text-emerald-500' },
            { name: 'Sad', value: userEmotion.sorrow, icon: 'sentiment_dissatisfied', color: 'text-blue-500' },
            { name: 'Angry', value: userEmotion.anger, icon: 'sentiment_extremely_dissatisfied', color: 'text-red-500' },
            { name: 'Surprised', value: userEmotion.surprise, icon: 'mood', color: 'text-amber-500' }
        ];
        
        return emotions.reduce((max, e) => e.value > max.value ? e : max, emotions[0]);
    };
    
    const dominantEmotion = getDominantEmotion();
    
    return (
        <div className="relative">
            {/* Blur Overlay when privacy breach detected */}
            {isBlurred && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl">
                    <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md mx-4">
                        <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block animate-pulse">
                            visibility_off
                        </span>
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                            Privacy Alert!
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            <span className="font-bold text-red-500">{faceCount} people</span> detected near your screen.
                            Content is blurred for your privacy.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            The screen will automatically unblur when fewer people are detected.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            <span className="text-sm font-medium">Monitoring...</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Mini camera feed and emotion meter */}
            {isMonitoring && (
                <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${showMiniCam ? 'w-64' : 'w-12'}`}>
                    {/* Toggle button */}
                    <button
                        onClick={() => setShowMiniCam(!showMiniCam)}
                        className="absolute -top-2 -left-2 z-10 size-8 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">
                            {showMiniCam ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>
                    
                    {showMiniCam ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            {/* Camera Header */}
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Privacy Monitor</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-slate-500">person</span>
                                    <span className={`text-xs font-bold ${faceCount > 3 ? 'text-red-500' : faceCount > 1 ? 'text-amber-500' : 'text-green-500'}`}>
                                        {faceCount}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Video Feed */}
                            <div className="relative aspect-video bg-slate-900">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Face count badge */}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                    faceCount > 3 ? 'bg-red-500 text-white' : 
                                    faceCount > 1 ? 'bg-amber-500 text-white' : 
                                    'bg-green-500 text-white'
                                }`}>
                                    <span className="material-symbols-outlined text-sm">face</span>
                                    {faceCount}
                                </div>
                                
                                {/* Dominant emotion overlay */}
                                {dominantEmotion && dominantEmotion.value > 25 && (
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-full flex items-center gap-1">
                                        <span className={`material-symbols-outlined text-sm ${dominantEmotion.color}`}>
                                            {dominantEmotion.icon}
                                        </span>
                                        <span className="text-xs text-white font-medium">{dominantEmotion.name}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Emotion Meter */}
                            {userEmotion && (
                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Reaction Meter</span>
                                        <span className="text-xs text-slate-500">{userEmotion.confidence}% conf</span>
                                    </div>
                                    
                                    {/* Joy */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-emerald-500">sentiment_very_satisfied</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${userEmotion.joy}%` }}
                                            />
                                        </div>
                                        <span className="text-xs w-8 text-right text-slate-500">{userEmotion.joy}%</span>
                                    </div>
                                    
                                    {/* Sorrow */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-blue-500">sentiment_dissatisfied</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${userEmotion.sorrow}%` }}
                                            />
                                        </div>
                                        <span className="text-xs w-8 text-right text-slate-500">{userEmotion.sorrow}%</span>
                                    </div>
                                    
                                    {/* Anger */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-red-500">sentiment_extremely_dissatisfied</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-red-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${userEmotion.anger}%` }}
                                            />
                                        </div>
                                        <span className="text-xs w-8 text-right text-slate-500">{userEmotion.anger}%</span>
                                    </div>
                                    
                                    {/* Surprise */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-amber-500">mood</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${userEmotion.surprise}%` }}
                                            />
                                        </div>
                                        <span className="text-xs w-8 text-right text-slate-500">{userEmotion.surprise}%</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Status Footer */}
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${
                                        faceCount > 3 ? 'text-red-500' : 
                                        faceCount > 1 ? 'text-amber-500' : 
                                        'text-green-500'
                                    }`}>
                                        {faceCount > 3 ? '⚠️ Privacy Risk!' : 
                                         faceCount > 1 ? '👀 Others nearby' : 
                                         faceCount === 1 ? '✓ Secure' : 
                                         '📷 No face detected'}
                                    </span>
                                    <button
                                        onClick={stopMonitoring}
                                        className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        Disable
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Collapsed mini indicator */
                        <div className={`size-12 rounded-full shadow-lg flex items-center justify-center ${
                            faceCount > 3 ? 'bg-red-500 animate-pulse' : 
                            faceCount > 1 ? 'bg-amber-500' : 
                            'bg-green-500'
                        }`}>
                            <span className="material-symbols-outlined text-white">
                                {faceCount > 3 ? 'visibility_off' : 'videocam'}
                            </span>
                        </div>
                    )}
                </div>
            )}
            
            {/* Camera Error Banner */}
            {cameraError && !isMonitoring && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm">
                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-lg">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                            <div className="flex-1">
                                <p className="text-sm text-amber-700 dark:text-amber-300">{cameraError}</p>
                                <button
                                    onClick={startMonitoring}
                                    className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                >
                                    Try Again →
                                </button>
                            </div>
                            <button
                                onClick={() => setCameraError(null)}
                                className="text-amber-500 hover:text-amber-600"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Main Content - blurred when privacy breach */}
            <div className={`transition-all duration-300 ${isBlurred ? 'blur-xl pointer-events-none select-none' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default PrivacyMonitor;
