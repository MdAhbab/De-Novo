import { useState, useCallback } from 'react';
import { api } from '../utils/api';

// Local fallback sentiment analysis (for offline/quick analysis)
const localAnalyze = (text) => {
    if (!text) return { sentiment: 'neutral', score: 0, confidence: 0 };

    const lower = text.toLowerCase();
    
    // Expanded sentiment dictionary
    const sentimentWords = {
        happy: ['happy', 'love', 'great', 'good', 'amazing', 'excellent', 'fun', 'enjoy', 'thanks', 
                'wonderful', 'fantastic', 'awesome', 'delighted', 'pleased', 'excited', 'joy', 'glad'],
        sad: ['sad', 'bad', 'hate', 'terrible', 'awful', 'cry', 'sorry', 'depressed', 
              'upset', 'disappointed', 'miserable', 'hurt', 'pain', 'lonely', 'unhappy'],
        angry: ['angry', 'furious', 'mad', 'annoyed', 'frustrated', 'irritated', 'rage'],
        anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'fear', 'stress', 'panic']
    };

    let detectedSentiments = {};
    
    for (const [emotion, words] of Object.entries(sentimentWords)) {
        const count = words.filter(word => lower.includes(word)).length;
        if (count > 0) {
            detectedSentiments[emotion] = count;
        }
    }

    if (Object.keys(detectedSentiments).length === 0) {
        return { sentiment: 'neutral', score: 0, confidence: 0.5 };
    }

    // Find dominant sentiment
    const dominant = Object.entries(detectedSentiments)
        .sort((a, b) => b[1] - a[1])[0];
    
    return {
        sentiment: dominant[0],
        score: dominant[1],
        confidence: Math.min(dominant[1] * 0.3, 1),
        all: detectedSentiments
    };
};

export const useSentimentAnalysis = () => {
    const [sentiment, setSentiment] = useState('neutral');
    const [sentimentData, setSentimentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useBackend, setUseBackend] = useState(true);

    // Analyze text using backend AI (Google Cloud NLP)
    const analyzeWithBackend = useCallback(async (text) => {
        if (!text?.trim()) {
            const result = { sentiment: 'neutral', score: 0, magnitude: 0 };
            setSentiment('neutral');
            setSentimentData(result);
            return result;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.ai.analyzeSentiment(text);
            
            if (response.success && response.data) {
                const data = response.data;
                
                // Map backend response to frontend format
                const result = {
                    sentiment: data.sentiment || data.overall_sentiment || 'neutral',
                    score: data.score ?? data.sentiment_score ?? 0,
                    magnitude: data.magnitude ?? 0,
                    confidence: data.confidence ?? Math.abs(data.score ?? 0),
                    sentences: data.sentences || [],
                    raw: data
                };
                
                setSentiment(result.sentiment);
                setSentimentData(result);
                return result;
            } else {
                throw new Error(response.error?.message || 'Analysis failed');
            }
        } catch (err) {
            console.warn('Backend sentiment analysis failed, using local:', err);
            setError(err.message);
            
            // Fallback to local analysis
            const localResult = localAnalyze(text);
            setSentiment(localResult.sentiment);
            setSentimentData(localResult);
            return localResult;
        } finally {
            setLoading(false);
        }
    }, []);

    // Quick local analysis (no API call)
    const analyzeLocal = useCallback((text) => {
        const result = localAnalyze(text);
        setSentiment(result.sentiment);
        setSentimentData(result);
        return result;
    }, []);

    // Main analyze function - uses backend if enabled, otherwise local
    const analyze = useCallback(async (text, forceLocal = false) => {
        if (forceLocal || !useBackend) {
            return analyzeLocal(text);
        }
        return analyzeWithBackend(text);
    }, [useBackend, analyzeLocal, analyzeWithBackend]);

    // Get sentiment color for UI
    const getSentimentColor = useCallback((sentimentValue = sentiment) => {
        const colors = {
            happy: '#22c55e',      // green
            sad: '#3b82f6',        // blue
            angry: '#ef4444',      // red
            anxious: '#f59e0b',    // amber
            neutral: '#6b7280',    // gray
            positive: '#22c55e',   // green
            negative: '#ef4444',   // red
            mixed: '#8b5cf6'       // purple
        };
        return colors[sentimentValue] || colors.neutral;
    }, [sentiment]);

    // Get sentiment emoji
    const getSentimentEmoji = useCallback((sentimentValue = sentiment) => {
        const emojis = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            anxious: '😰',
            neutral: '😐',
            positive: '🙂',
            negative: '😞',
            mixed: '🤔'
        };
        return emojis[sentimentValue] || emojis.neutral;
    }, [sentiment]);

    return { 
        sentiment, 
        sentimentData,
        loading,
        error,
        analyze,
        analyzeLocal,
        analyzeWithBackend,
        getSentimentColor,
        getSentimentEmoji,
        useBackend,
        setUseBackend
    };
};
