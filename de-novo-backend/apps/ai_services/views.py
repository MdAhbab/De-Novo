"""
Views for AI Services app.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import base64

from .text_to_speech import text_to_speech
from .speech_to_text import speech_to_text
from .sentiment_analyzer import sentiment_analyzer
from .gemma_assistant import gemma_assistant
from .peeping_tom_detector import peeping_tom_detector
from services.gcp_client import gcp_client


class TextToSpeechView(APIView):
    """Convert text to speech."""
    
    def post(self, request):
        text = request.data.get('text', '')
        language_code = request.data.get('language_code', 'en-US')
        voice_name = request.data.get('voice')
        speaking_rate = float(request.data.get('speaking_rate', 1.0))
        
        if not text:
            return Response({
                'success': False,
                'error': {'message': 'Text is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = text_to_speech.synthesize(
            text=text,
            language_code=language_code,
            voice_name=voice_name,
            speaking_rate=speaking_rate
        )
        
        if result.get('success'):
            return Response({
                'success': True,
                'data': {
                    'audio_content': result.get('audio_content'),
                    'format': 'mp3'
                }
            })
        else:
            return Response({
                'success': False,
                'error': {'message': str(result.get('error', 'TTS failed'))}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TTSVoicesView(APIView):
    """List available TTS voices."""
    
    def get(self, request):
        language_code = request.query_params.get('language')
        voices = text_to_speech.get_voices(language_code)
        languages = text_to_speech.get_supported_languages()
        
        return Response({
            'success': True,
            'data': {
                'voices': voices,
                'languages': languages
            }
        })


class SpeechToTextView(APIView):
    """Convert speech to text."""
    
    def post(self, request):
        audio_content = request.data.get('audio_content')
        audio_base64 = request.data.get('audio_base64')
        language_code = request.data.get('language_code', 'en-US')
        encoding = request.data.get('encoding', 'WEBM_OPUS')
        sample_rate = int(request.data.get('sample_rate', 48000))
        
        if not audio_content and not audio_base64:
            return Response({
                'success': False,
                'error': {'message': 'Audio content is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if audio_base64:
            result = speech_to_text.transcribe_base64(
                audio_base64=audio_base64,
                language_code=language_code,
                encoding=encoding,
                sample_rate=sample_rate
            )
        else:
            # Decode base64 audio content
            try:
                audio_bytes = base64.b64decode(audio_content)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': {'message': f'Invalid audio content: {str(e)}'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = speech_to_text.transcribe(
                audio_content=audio_bytes,
                language_code=language_code,
                encoding=encoding,
                sample_rate=sample_rate
            )
        
        if result.get('success'):
            return Response({
                'success': True,
                'data': {
                    'transcript': result.get('full_transcript', ''),
                    'results': result.get('results', [])
                }
            })
        else:
            return Response({
                'success': False,
                'error': {'message': str(result.get('error', 'STT failed'))}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class STTLanguagesView(APIView):
    """List supported STT languages."""
    
    def get(self, request):
        languages = speech_to_text.get_supported_languages()
        
        return Response({
            'success': True,
            'data': {
                'languages': languages
            }
        })


class SentimentAnalysisView(APIView):
    """Analyze text sentiment."""
    
    def post(self, request):
        text = request.data.get('text', '')
        use_gemini = request.data.get('use_gemini', False)
        
        if not text:
            return Response({
                'success': False,
                'error': {'message': 'Text is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = sentiment_analyzer.analyze(text, use_gemini=use_gemini)
        
        return Response({
            'success': True,
            'data': result
        })


class ConversationMoodView(APIView):
    """Analyze conversation mood."""
    
    def post(self, request):
        messages = request.data.get('messages', [])
        
        if not messages:
            return Response({
                'success': False,
                'error': {'message': 'Messages are required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = sentiment_analyzer.analyze_conversation_mood(messages)
        
        return Response({
            'success': True,
            'data': result
        })


class AIAssistantView(APIView):
    """AI assistant for various tasks."""
    
    def post(self, request):
        task = request.data.get('task', 'help')
        text = request.data.get('text', '')
        context = request.data.get('context', {})
        
        if task == 'compose':
            # Use help_compose_message method
            tone = context.get('tone', 'friendly')
            context_text = context.get('context', '')
            result = gemma_assistant.help_compose_message(
                intent=text,
                context=context_text,
                tone=tone
            )
        elif task == 'explain':
            # Explain content for accessibility
            impairment_type = context.get('impairment_type', 'visual')
            result = gemma_assistant.explain_for_accessibility(text, impairment_type)
        elif task == 'accessibility_tips':
            disability_type = context.get('disability_type', 'general')
            result = gemma_assistant.get_accessibility_tips(disability_type)
        elif task == 'chat':
            # Interactive chat with conversation history
            history = context.get('history', [])
            result = gemma_assistant.chat(text, history)
        else:
            # Default: general help via chat
            result = gemma_assistant.chat(text)
        
        return Response({
            'success': True,
            'data': result
        })


class FaceDetectionView(APIView):
    """Detect faces for privacy protection."""
    
    def post(self, request):
        image_base64 = request.data.get('image')
        
        if not image_base64:
            return Response({
                'success': False,
                'error': {'message': 'Image is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = peeping_tom_detector.analyze_privacy_risk(image_base64)
        
        return Response({
            'success': True,
            'data': result
        })


class AIServicesStatusView(APIView):
    """Get status of AI services."""
    
    permission_classes = []  # Allow unauthenticated access
    
    def get(self, request):
        status_data = gcp_client.get_service_status()
        
        return Response({
            'success': True,
            'data': {
                'services': status_data,
                'message': 'All configured services are available' if all(status_data.values()) else 'Some services may be unavailable'
            }
        })
