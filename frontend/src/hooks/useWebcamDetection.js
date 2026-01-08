import { useState, useRef, useEffect } from 'react';

export const useWebcamDetection = () => {
    const videoRef = useRef(null);
    const [active, setActive] = useState(false);
    const [stream, setStream] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setActive(true);
        } catch (err) {
            console.error("Error accessing webcam:", err);
            return false;
        }
        return true;
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setActive(false);
        }
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return { videoRef, startCamera, stopCamera, active };
};
