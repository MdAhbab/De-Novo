"""
Sentiment Analyzer using Google Cloud Natural Language API and Gemini.
Analyzes message sentiment to provide emotional context.
"""

import os
from services.gcp_client import gcp_client

# Try to import Gemini
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class SentimentAnalyzer:
    """
    Multi-layered sentiment analysis using:
    1. Google Cloud Natural Language API (primary)
    2. Google Gemini (for detailed analysis)
    3. Rule-based fallback
    """
    
    # Emotion emoji mapping
    EMOTION_EMOJIS = {
        'positive': '😊',
        'negative': '😢',
        'neutral': '😐',
        'very_positive': '😄',
        'very_negative': '😭',
        'mixed': '🤔'
    }
    
    def __init__(self):
        self.gemini_model = None
        self._setup_gemini()
    
    def _setup_gemini(self):
        """Initialize Gemini model."""
        if not GENAI_AVAILABLE:
            return
        
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to setup Gemini: {e}")
    
    def analyze(self, text: str, use_gemini: bool = False) -> dict:
        """
        Analyze sentiment of text.
        
        Args:
            text: Text to analyze
            use_gemini: Use Gemini for detailed analysis (slower but more accurate)
            
        Returns:
            dict with sentiment analysis results
        """
        if not text or not text.strip():
            return {
                'success': False,
                'error': 'No text provided',
                'sentiment': 'neutral',
                'emoji': '😐'
            }
        
        # Try Cloud Natural Language API first (fast and accurate)
        nlp_result = gcp_client.analyze_sentiment_nlp(text)
        
        if nlp_result.get('success'):
            score = nlp_result.get('score', 0)
            magnitude = nlp_result.get('magnitude', 0)
            
            # Determine sentiment and emoji
            if score >= 0.5:
                sentiment = 'very_positive' if magnitude > 1 else 'positive'
            elif score >= 0.1:
                sentiment = 'positive'
            elif score <= -0.5:
                sentiment = 'very_negative' if magnitude > 1 else 'negative'
            elif score <= -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                'success': True,
                'sentiment': sentiment,
                'score': score,
                'magnitude': magnitude,
                'emoji': self.EMOTION_EMOJIS.get(sentiment, '😐'),
                'source': 'cloud_nlp'
            }
        
        # Use Gemini for detailed analysis if requested or NLP failed
        if use_gemini and self.gemini_model:
            return self._analyze_with_gemini(text)
        
        # Fallback to rule-based analysis
        return self._rule_based_analysis(text)
    
    def _analyze_with_gemini(self, text: str) -> dict:
        """Analyze sentiment using Gemini."""
        try:
            prompt = f"""Analyze the sentiment of this message and respond ONLY with a JSON object:
{{
    "sentiment": "positive" or "negative" or "neutral" or "mixed",
    "confidence": 0.0 to 1.0,
    "emotions": ["list", "of", "emotions"],
    "summary": "brief sentiment summary"
}}

Message: "{text}"

JSON response:"""

            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response
            import json
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0]
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0]
            
            result = json.loads(response_text)
            sentiment = result.get('sentiment', 'neutral')
            
            return {
                'success': True,
                'sentiment': sentiment,
                'confidence': result.get('confidence', 0.5),
                'emotions': result.get('emotions', []),
                'summary': result.get('summary', ''),
                'emoji': self.EMOTION_EMOJIS.get(sentiment, '😐'),
                'source': 'gemini'
            }
            
        except Exception as e:
            print(f"Gemini analysis failed: {e}")
            return self._rule_based_analysis(text)
    
    def _rule_based_analysis(self, text: str) -> dict:
        """Fallback rule-based sentiment analysis."""
        text_lower = text.lower()
        
        positive_words = [
            'happy', 'great', 'good', 'love', 'wonderful', 'excellent',
            'amazing', 'fantastic', 'beautiful', 'joy', 'excited', 'thanks',
            'thank', 'appreciate', 'glad', 'awesome', 'nice', 'best'
        ]
        
        negative_words = [
            'sad', 'bad', 'hate', 'terrible', 'awful', 'horrible',
            'angry', 'upset', 'disappointed', 'sorry', 'worst', 'never',
            'hurt', 'pain', 'cry', 'scared', 'worried', 'anxious'
        ]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            score = min(positive_count * 0.2, 1.0)
        elif negative_count > positive_count:
            sentiment = 'negative'
            score = -min(negative_count * 0.2, 1.0)
        else:
            sentiment = 'neutral'
            score = 0.0
        
        return {
            'success': True,
            'sentiment': sentiment,
            'score': score,
            'emoji': self.EMOTION_EMOJIS.get(sentiment, '😐'),
            'source': 'rule_based'
        }
    
    def analyze_conversation_mood(self, messages: list) -> dict:
        """
        Analyze the overall mood of a conversation.
        
        Args:
            messages: List of message dicts with 'content' key
            
        Returns:
            dict with conversation mood analysis
        """
        if not messages:
            return {'overall_mood': 'neutral', 'emoji': '😐'}
        
        sentiments = []
        for msg in messages[-10:]:  # Analyze last 10 messages
            content = msg.get('content', '')
            if content:
                result = self.analyze(content)
                if result.get('success'):
                    sentiments.append(result.get('score', 0))
        
        if not sentiments:
            return {'overall_mood': 'neutral', 'emoji': '😐'}
        
        avg_score = sum(sentiments) / len(sentiments)
        
        if avg_score >= 0.3:
            mood = 'positive'
        elif avg_score <= -0.3:
            mood = 'negative'
        else:
            mood = 'neutral'
        
        return {
            'overall_mood': mood,
            'average_score': avg_score,
            'message_count': len(sentiments),
            'emoji': self.EMOTION_EMOJIS.get(mood, '😐')
        }


# Global instance
sentiment_analyzer = SentimentAnalyzer()
