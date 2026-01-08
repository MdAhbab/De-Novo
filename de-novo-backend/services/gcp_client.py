"""
Google Cloud Platform client manager.
Centralizes GCP service initialization and configuration.
Uses API keys for Cloud APIs (Speech, TTS, Vision, NLP).
"""

import os
import requests
import base64
from django.conf import settings


class GCPClientManager:
    """
    Manages Google Cloud Platform service clients.
    Uses API keys for authentication (simpler for hackathon).
    """
    
    # API endpoints
    SPEECH_TO_TEXT_URL = "https://speech.googleapis.com/v1/speech:recognize"
    TEXT_TO_SPEECH_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"
    VISION_URL = "https://vision.googleapis.com/v1/images:annotate"
    NLP_URL = "https://language.googleapis.com/v1/documents:analyzeSentiment"
    
    def __init__(self):
        self._initialized = False
        self._api_key = None
        self._gcp_api_key = None
        self._genai_model = None
    
    def _ensure_credentials(self):
        """Ensure API keys are configured."""
        if self._initialized:
            return True
        
        # Gemini API key (for AI assistant and sentiment)
        self._api_key = getattr(settings, 'GOOGLE_API_KEY', None) or os.getenv('GOOGLE_API_KEY')
        
        # GCP API key (for Speech, TTS, Vision, NLP)
        self._gcp_api_key = getattr(settings, 'GCP_API_KEY', None) or os.getenv('GCP_API_KEY')
        
        self._initialized = True
        return True
    
    def speech_to_text(self, audio_content: bytes, language_code: str = 'en-US', 
                       encoding: str = 'LINEAR16', sample_rate: int = 16000) -> dict:
        """
        Convert speech to text using Cloud Speech-to-Text API.
        
        Args:
            audio_content: Audio bytes
            language_code: Language code (e.g., 'en-US', 'bn-BD')
            encoding: Audio encoding (LINEAR16, FLAC, MP3, etc.)
            sample_rate: Sample rate in Hz
            
        Returns:
            Dict with transcript and confidence
        """
        self._ensure_credentials()
        
        if not self._gcp_api_key:
            return {'error': 'GCP API key not configured', 'transcript': ''}
        
        # Map encoding names
        encoding_map = {
            'LINEAR16': 'LINEAR16',
            'FLAC': 'FLAC',
            'MP3': 'MP3',
            'OGG_OPUS': 'OGG_OPUS',
            'WEBM_OPUS': 'WEBM_OPUS',
        }
        
        payload = {
            'config': {
                'encoding': encoding_map.get(encoding, 'LINEAR16'),
                'sampleRateHertz': sample_rate,
                'languageCode': language_code,
                'enableAutomaticPunctuation': True,
            },
            'audio': {
                'content': base64.b64encode(audio_content).decode('utf-8')
            }
        }
        
        try:
            response = requests.post(
                f"{self.SPEECH_TO_TEXT_URL}?key={self._gcp_api_key}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'results' in result and result['results']:
                    best = result['results'][0]['alternatives'][0]
                    return {
                        'transcript': best.get('transcript', ''),
                        'confidence': best.get('confidence', 0.0),
                        'success': True
                    }
                return {'transcript': '', 'confidence': 0.0, 'success': True, 'message': 'No speech detected'}
            else:
                return {'error': response.json(), 'transcript': '', 'success': False}
        except Exception as e:
            return {'error': str(e), 'transcript': '', 'success': False}
    
    def text_to_speech(self, text: str, language_code: str = 'en-US', 
                       voice_name: str = None, speaking_rate: float = 1.0) -> dict:
        """
        Convert text to speech using Cloud Text-to-Speech API.
        
        Args:
            text: Text to convert
            language_code: Language code
            voice_name: Specific voice name (optional)
            speaking_rate: Speed (0.25 to 4.0)
            
        Returns:
            Dict with audio_content (base64) and success status
        """
        self._ensure_credentials()
        
        if not self._gcp_api_key:
            return {'error': 'GCP API key not configured', 'audio_content': None}
        
        # Default voice based on language
        if not voice_name:
            voice_name = f"{language_code}-Neural2-D"
        
        payload = {
            'input': {'text': text},
            'voice': {
                'languageCode': language_code,
                'name': voice_name,
            },
            'audioConfig': {
                'audioEncoding': 'MP3',
                'speakingRate': speaking_rate,
            }
        }
        
        try:
            response = requests.post(
                f"{self.TEXT_TO_SPEECH_URL}?key={self._gcp_api_key}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'audio_content': result.get('audioContent'),
                    'success': True
                }
            else:
                return {'error': response.json(), 'audio_content': None, 'success': False}
        except Exception as e:
            return {'error': str(e), 'audio_content': None, 'success': False}
    
    def detect_faces(self, image_content: bytes) -> dict:
        """
        Detect faces in an image using Cloud Vision API.
        
        Args:
            image_content: Image bytes
            
        Returns:
            Dict with face detection results
        """
        self._ensure_credentials()
        
        if not self._gcp_api_key:
            return {'error': 'GCP API key not configured', 'faces': []}
        
        payload = {
            'requests': [{
                'image': {
                    'content': base64.b64encode(image_content).decode('utf-8')
                },
                'features': [{
                    'type': 'FACE_DETECTION',
                    'maxResults': 10
                }]
            }]
        }
        
        try:
            response = requests.post(
                f"{self.VISION_URL}?key={self._gcp_api_key}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                responses = result.get('responses', [{}])
                face_annotations = responses[0].get('faceAnnotations', [])
                
                faces = []
                for face in face_annotations:
                    faces.append({
                        'confidence': face.get('detectionConfidence', 0),
                        'joy': face.get('joyLikelihood', 'UNKNOWN'),
                        'sorrow': face.get('sorrowLikelihood', 'UNKNOWN'),
                        'anger': face.get('angerLikelihood', 'UNKNOWN'),
                        'surprise': face.get('surpriseLikelihood', 'UNKNOWN'),
                        'bounds': face.get('boundingPoly', {})
                    })
                
                return {
                    'faces': faces,
                    'face_count': len(faces),
                    'success': True
                }
            else:
                return {'error': response.json(), 'faces': [], 'success': False}
        except Exception as e:
            return {'error': str(e), 'faces': [], 'success': False}
    
    def analyze_sentiment_nlp(self, text: str) -> dict:
        """
        Analyze sentiment using Cloud Natural Language API.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict with sentiment score and magnitude
        """
        self._ensure_credentials()
        
        if not self._gcp_api_key:
            return {'error': 'GCP API key not configured'}
        
        payload = {
            'document': {
                'type': 'PLAIN_TEXT',
                'content': text
            },
            'encodingType': 'UTF8'
        }
        
        try:
            response = requests.post(
                f"{self.NLP_URL}?key={self._gcp_api_key}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                sentiment = result.get('documentSentiment', {})
                
                # Convert score to emotion
                score = sentiment.get('score', 0)
                magnitude = sentiment.get('magnitude', 0)
                
                if score >= 0.5:
                    emotion = 'positive'
                elif score <= -0.5:
                    emotion = 'negative'
                else:
                    emotion = 'neutral'
                
                return {
                    'score': score,
                    'magnitude': magnitude,
                    'emotion': emotion,
                    'success': True
                }
            else:
                return {'error': response.json(), 'success': False}
        except Exception as e:
            return {'error': str(e), 'success': False}
    
    def get_genai_model(self, model_name: str = None):
        """
        Get Generative AI model (Gemini).
        
        Args:
            model_name: Model to use (default: gemini-1.5-flash)
            
        Returns:
            GenerativeModel instance or None
        """
        self._ensure_credentials()
        
        if not self._api_key:
            print("Google API key not configured")
            return None
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self._api_key)
            
            model_name = model_name or 'gemini-1.5-flash'
            return genai.GenerativeModel(model_name)
        except Exception as e:
            print(f"Failed to initialize Generative AI model: {e}")
            return None
    
    def is_speech_available(self) -> bool:
        """Check if Speech-to-Text is available."""
        self._ensure_credentials()
        return self._gcp_api_key is not None
    
    def is_tts_available(self) -> bool:
        """Check if Text-to-Speech is available."""
        self._ensure_credentials()
        return self._gcp_api_key is not None
    
    def is_vision_available(self) -> bool:
        """Check if Vision API is available."""
        self._ensure_credentials()
        return self._gcp_api_key is not None
    
    def is_nlp_available(self) -> bool:
        """Check if Natural Language API is available."""
        self._ensure_credentials()
        return self._gcp_api_key is not None
    
    def is_genai_available(self) -> bool:
        """Check if Generative AI (Gemini) is available."""
        self._ensure_credentials()
        return self._api_key is not None
    
    def get_service_status(self) -> dict:
        """Get status of all GCP services."""
        self._ensure_credentials()
        return {
            'speech_to_text': self.is_speech_available(),
            'text_to_speech': self.is_tts_available(),
            'vision': self.is_vision_available(),
            'natural_language': self.is_nlp_available(),
            'generative_ai': self.is_genai_available(),
            'gcp_api_key_configured': self._gcp_api_key is not None,
            'gemini_api_key_configured': self._api_key is not None,
        }


# Global instance
gcp_client = GCPClientManager()


def get_service_status():
    """Get status of all GCP services."""
    return gcp_client.get_service_status()


def get_genai_model(model_name: str = None):
    """Get Generative AI model."""
    return gcp_client.get_genai_model(model_name)
