"""
URL routes for AI Services app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Text-to-Speech
    path('tts/', views.TextToSpeechView.as_view(), name='tts'),
    path('tts/voices/', views.TTSVoicesView.as_view(), name='tts_voices'),
    
    # Speech-to-Text
    path('stt/', views.SpeechToTextView.as_view(), name='stt'),
    path('stt/languages/', views.STTLanguagesView.as_view(), name='stt_languages'),
    
    # Sentiment Analysis
    path('sentiment/', views.SentimentAnalysisView.as_view(), name='sentiment'),
    path('sentiment/conversation/', views.ConversationMoodView.as_view(), name='conversation_mood'),
    
    # AI Assistant
    path('assistant/', views.AIAssistantView.as_view(), name='assistant'),
    
    # Face Detection / Privacy
    path('face-detection/', views.FaceDetectionView.as_view(), name='face_detection'),
    
    # Service Status
    path('status/', views.AIServicesStatusView.as_view(), name='ai_status'),
]
