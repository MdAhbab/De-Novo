import { useState } from 'react';

export const useSentimentAnalysis = () => {
    const [sentiment, setSentiment] = useState('neutral');

    const analyze = (text) => {
        if (!text) return 'neutral';

        const lower = text.toLowerCase();
        // Very basic sentiment dictionary
        const happyWords = ['happy', 'love', 'great', 'good', 'amazing', 'excellent', 'fun', 'enjoy', 'thanks'];
        const sadWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'cry', 'sorry', 'depressed'];

        const isHappy = happyWords.some(word => lower.includes(word));
        const isSad = sadWords.some(word => lower.includes(word));

        if (isHappy) {
            setSentiment('happy');
            return 'happy';
        } else if (isSad) {
            setSentiment('sad');
            return 'sad';
        } else {
            setSentiment('neutral');
            return 'neutral';
        }
    };

    return { sentiment, analyze };
};
