"""
Speech-to-Text service using Google Cloud Speech-to-Text API.
Transcribes audio for accessibility features.
"""

import base64
from services.gcp_client import gcp_client


class SpeechToTextService:
    """
    Google Cloud Speech-to-Text integration using REST API with API key.
    """
    
    # Supported languages
    SUPPORTED_LANGUAGES = {
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        'bn-BD': 'Bengali (Bangladesh)',
        'bn-IN': 'Bengali (India)',
        'hi-IN': 'Hindi',
        'es-ES': 'Spanish',
        'fr-FR': 'French',
        'de-DE': 'German',
        'ja-JP': 'Japanese',
        'ko-KR': 'Korean',
        'zh-CN': 'Chinese (Simplified)',
        'ar-SA': 'Arabic',
    }
    
    def transcribe(self, audio_content: bytes, language_code: str = 'en-US',
                   encoding: str = 'WEBM_OPUS', sample_rate: int = 48000) -> dict:
        """
        Transcribe audio to text.
        
        Args:
            audio_content: Audio bytes
            language_code: Language code (e.g., 'en-US', 'es-ES')
            encoding: Audio encoding (LINEAR16, FLAC, WEBM_OPUS, MP3, etc.)
            sample_rate: Sample rate in Hz
        
        Returns:
            dict with transcription results
        """
        if not audio_content:
            return {
                'success': False,
                'error': 'No audio content provided',
                'results': [],
                'full_transcript': ''
            }
        
        # Use the centralized GCP client
        result = gcp_client.speech_to_text(
            audio_content=audio_content,
            language_code=language_code,
            encoding=encoding,
            sample_rate=sample_rate
        )
        
        if result.get('success'):
            return {
                'success': True,
                'results': [{
                    'transcript': result.get('transcript', ''),
                    'confidence': result.get('confidence', 0.0)
                }],
                'full_transcript': result.get('transcript', '')
            }
        else:
            return {
                'success': False,
                'error': result.get('error', 'Transcription failed'),
                'results': [],
                'full_transcript': ''
            }
    
    def transcribe_base64(self, audio_base64: str, language_code: str = 'en-US',
                          encoding: str = 'WEBM_OPUS', sample_rate: int = 48000) -> dict:
        """
        Transcribe base64-encoded audio to text.
        """
        try:
            audio_content = base64.b64decode(audio_base64)
            return self.transcribe(
                audio_content=audio_content,
                language_code=language_code,
                encoding=encoding,
                sample_rate=sample_rate
            )
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to decode audio: {str(e)}',
                'results': [],
                'full_transcript': ''
            }
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages for STT."""
        return [
            {'code': code, 'name': name}
            for code, name in self.SUPPORTED_LANGUAGES.items()
        ]


# Global instance
speech_to_text = SpeechToTextService()
