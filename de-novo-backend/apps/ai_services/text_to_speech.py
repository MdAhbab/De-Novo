"""
Text-to-Speech service using Google Cloud Text-to-Speech API.
Converts text messages to speech for visually impaired users.
"""

from services.gcp_client import gcp_client


class TextToSpeechService:
    """
    Google Cloud Text-to-Speech integration using REST API with API key.
    """
    
    # Available voices by language
    VOICES = {
        'en-US': [
            {'name': 'en-US-Neural2-A', 'gender': 'MALE'},
            {'name': 'en-US-Neural2-C', 'gender': 'FEMALE'},
            {'name': 'en-US-Neural2-D', 'gender': 'MALE'},
            {'name': 'en-US-Neural2-E', 'gender': 'FEMALE'},
            {'name': 'en-US-Neural2-F', 'gender': 'FEMALE'},
            {'name': 'en-US-Neural2-G', 'gender': 'FEMALE'},
            {'name': 'en-US-Neural2-H', 'gender': 'FEMALE'},
            {'name': 'en-US-Neural2-I', 'gender': 'MALE'},
            {'name': 'en-US-Neural2-J', 'gender': 'MALE'},
        ],
        'en-GB': [
            {'name': 'en-GB-Neural2-A', 'gender': 'FEMALE'},
            {'name': 'en-GB-Neural2-B', 'gender': 'MALE'},
            {'name': 'en-GB-Neural2-C', 'gender': 'FEMALE'},
            {'name': 'en-GB-Neural2-D', 'gender': 'MALE'},
        ],
        'bn-IN': [
            {'name': 'bn-IN-Standard-A', 'gender': 'FEMALE'},
            {'name': 'bn-IN-Standard-B', 'gender': 'MALE'},
        ],
        'hi-IN': [
            {'name': 'hi-IN-Neural2-A', 'gender': 'FEMALE'},
            {'name': 'hi-IN-Neural2-B', 'gender': 'MALE'},
            {'name': 'hi-IN-Neural2-C', 'gender': 'MALE'},
            {'name': 'hi-IN-Neural2-D', 'gender': 'FEMALE'},
        ],
    }
    
    def synthesize(self, text: str, language_code: str = 'en-US',
                   voice_name: str = None, speaking_rate: float = 1.0) -> dict:
        """
        Convert text to speech.
        
        Args:
            text: Text to convert
            language_code: Language code (e.g., 'en-US')
            voice_name: Specific voice name (optional)
            speaking_rate: Speed of speech (0.25 to 4.0)
        
        Returns:
            dict with audio_content (base64), success status
        """
        if not text or not text.strip():
            return {
                'success': False,
                'error': 'No text provided',
                'audio_content': None
            }
        
        # Clean text (max 5000 characters)
        text = text[:5000].strip()
        
        # Use the centralized GCP client
        result = gcp_client.text_to_speech(
            text=text,
            language_code=language_code,
            voice_name=voice_name,
            speaking_rate=speaking_rate
        )
        
        return result
    
    def get_voices(self, language_code: str = None) -> list:
        """
        Get available voices.
        
        Args:
            language_code: Optional language filter
        
        Returns:
            List of available voices
        """
        if language_code:
            return self.VOICES.get(language_code, [])
        
        all_voices = []
        for lang, voices in self.VOICES.items():
            for voice in voices:
                all_voices.append({
                    'language_code': lang,
                    **voice
                })
        return all_voices
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages."""
        return [
            {'code': 'en-US', 'name': 'English (US)'},
            {'code': 'en-GB', 'name': 'English (UK)'},
            {'code': 'bn-IN', 'name': 'Bengali'},
            {'code': 'hi-IN', 'name': 'Hindi'},
        ]


# Global instance
text_to_speech = TextToSpeechService()
