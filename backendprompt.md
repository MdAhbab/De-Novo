De-Novo Django Backend

Build a complete Django REST Framework backend for "De-Novo" - an accessible social communication platform. This backend must integrate with React frontend and Google Cloud AI services.

---

## PART 1: PROJECT STRUCTURE

```
de_novo_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── de_novo/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── signals.py
│   ├── chat/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── consumers.py
│   │   └── routing.py
│   ├── accessibility/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── mood/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── security/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   └── ai_services/
│       ├── __init__.py
│       ├── sentiment_analyzer.py
│       ├── text_to_speech.py
│       ├── speech_to_text.py
│       ├── gemma_assistant.py
│       ├── peeping_tom_detector.py
│       └── views.py
├── services/
│   ├── __init__.py
│   ├── gcp_client.py
│   ├── encryption.py
│   └── websocket_manager.py
└── tests/
    ├── test_users.py
    ├── test_chat.py
    └── test_ai_services.py
```

---

## PART 2: DEPENDENCIES (requirements.txt)

```txt
# Core Django
Django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.3
djangorestframework-simplejwt>=5.3
django-environ>=0.11

# Database
mysqlclient>=2.2
pymongo>=4.6
djongo>=1.3.6

# WebSockets for Real-time Chat
channels>=4.0
channels-redis>=4.1
daphne>=4.0

# Google Cloud AI/ML
google-cloud-aiplatform>=1.38
google-cloud-speech>=2.23
google-cloud-texttospeech>=2.14
google-cloud-vision>=3.5
google-generativeai>=0.3

# Security & Encryption
cryptography>=41.0
pycryptodome>=3.19

# AI/ML Libraries
numpy>=1.26
pillow>=10.1
opencv-python>=4.8

# Utilities
celery>=5.3
redis>=5.0
python-dotenv>=1.0
```

---

## PART 3: DATABASE MODELS

### users/models.py

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    DISABILITY_CHOICES = [
        ('visual', 'Visual Impairment'),
        ('hearing', 'Hearing Impairment'),
        ('speech', 'Speech Impairment'),
        ('multiple', 'Multiple Impairments'),
        ('none', 'No Impairment'),
    ]
    
    COLOR_BLIND_CHOICES = [
        ('none', 'None'),
        ('protanopia', 'Protanopia (Red-Blind)'),
        ('deuteranopia', 'Deuteranopia (Green-Blind)'),
        ('tritanopia', 'Tritanopia (Blue-Blind)'),
        ('achromatopsia', 'Achromatopsia (Total Color Blindness)'),
    ]
    
    # Profile Fields
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Disability Information
    disability_type = models.CharField(max_length=20, choices=DISABILITY_CHOICES, default='none')
    disability_details = models.TextField(blank=True)
    
    # Accessibility Preferences (stored in MySQL)
    font_size = models.IntegerField(default=16)
    high_contrast = models.BooleanField(default=False)
    color_blind_mode = models.CharField(max_length=20, choices=COLOR_BLIND_CHOICES, default='none')
    dark_mode = models.BooleanField(default=False)
    reduce_motion = models.BooleanField(default=False)
    
    # TTS Preferences
    tts_enabled = models.BooleanField(default=True)
    tts_voice = models.CharField(max_length=50, default='en-US-Standard-A')
    tts_rate = models.FloatField(default=1.0)
    tts_pitch = models.FloatField(default=0.0)
    
    # STT Preferences
    stt_enabled = models.BooleanField(default=True)
    stt_language = models.CharField(max_length=10, default='en-US')
    stt_continuous = models.BooleanField(default=False)
    
    # Security
    peeping_tom_enabled = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    # Activity
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    # Onboarding
    onboarding_completed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'users'


class UserContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacted_by')
    nickname = models.CharField(max_length=100, blank=True)
    is_blocked = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_contacts'
        unique_together = ['user', 'contact']


class BlockedUser(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blocked_users'
```

### chat/models.py (MongoDB via Djongo or PyMongo)

```python
from django.db import models
from djongo import models as djongo_models
import uuid

class Conversation(models.Model):
    """
    Store in MongoDB for flexible message storage
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    participants = djongo_models.ArrayField(
        model_container=models.IntegerField()  # User IDs
    )
    conversation_type = models.CharField(max_length=20, default='direct')  # direct, group
    name = models.CharField(max_length=100, blank=True)  # For group chats
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Encryption
    encryption_key_id = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'conversations'


class Message(models.Model):
    """
    Store in MongoDB - E2E Encrypted
    """
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('voice', 'Voice Message'),
        ('image', 'Image'),
        ('file', 'File'),
    ]
    
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    conversation_id = models.UUIDField()
    sender_id = models.IntegerField()
    
    # Content (E2E Encrypted)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    encrypted_content = models.BinaryField()  # Encrypted message content
    
    # Voice message specific
    voice_duration = models.FloatField(null=True, blank=True)
    voice_waveform = djongo_models.ArrayField(
        model_container=models.FloatField(),
        null=True, blank=True
    )
    
    # AI Analysis (computed server-side, not encrypted)
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, null=True)
    sentiment_score = models.FloatField(null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    
    # Read receipts
    read_by = djongo_models.ArrayField(
        model_container=models.IntegerField(),
        default=list
    )
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']


class VoiceMessage(models.Model):
    """
    Separate storage for voice message files
    """
    message_id = models.UUIDField(primary_key=True)
    encrypted_audio = models.BinaryField()
    duration = models.FloatField()
    transcription = models.TextField(blank=True)  # STT transcription
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'voice_messages'
```

### mood/models.py

```python
from django.db import models
from apps.users.models import User

class MoodEntry(models.Model):
    MOOD_CHOICES = [
        ('very_happy', 'Very Happy'),
        ('happy', 'Happy'),
        ('neutral', 'Neutral'),
        ('sad', 'Sad'),
        ('very_sad', 'Very Sad'),
        ('anxious', 'Anxious'),
        ('calm', 'Calm'),
        ('energetic', 'Energetic'),
        ('tired', 'Tired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_entries')
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mood_entries'
        ordering = ['-created_at']


class AmbientSound(models.Model):
    CATEGORY_CHOICES = [
        ('nature', 'Nature'),
        ('music', 'Music'),
        ('white_noise', 'White Noise'),
        ('meditation', 'Meditation'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    file_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    duration = models.IntegerField()  # in seconds
    description = models.TextField(blank=True)
    recommended_moods = models.JSONField(default=list)
    
    class Meta:
        db_table = 'ambient_sounds'


class UserSoundSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sound = models.ForeignKey(AmbientSound, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_listened = models.IntegerField(default=0)  # in seconds
    
    class Meta:
        db_table = 'user_sound_sessions'
```

---

## PART 4: API ENDPOINTS

### Authentication URLs (users/urls.py)

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('profile/avatar/', views.AvatarUploadView.as_view(), name='avatar_upload'),
    
    # Accessibility Settings
    path('settings/accessibility/', views.AccessibilitySettingsView.as_view(), name='accessibility_settings'),
    
    # Contacts
    path('contacts/', views.ContactListView.as_view(), name='contacts'),
    path('contacts/add/', views.AddContactView.as_view(), name='add_contact'),
    path('contacts/<int:contact_id>/remove/', views.RemoveContactView.as_view(), name='remove_contact'),
    path('contacts/<int:contact_id>/block/', views.BlockUserView.as_view(), name='block_user'),
    path('contacts/<int:contact_id>/unblock/', views.UnblockUserView.as_view(), name='unblock_user'),
    
    # Search
    path('search/', views.UserSearchView.as_view(), name='user_search'),
    
    # Online Status
    path('status/online/', views.SetOnlineStatusView.as_view(), name='set_online'),
]
```

### Chat URLs (chat/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('conversations/create/', views.CreateConversationView.as_view(), name='create_conversation'),
    path('conversations/<uuid:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<uuid:conversation_id>/messages/', views.MessageListView.as_view(), name='messages'),
    
    # Messages
    path('messages/send/', views.SendMessageView.as_view(), name='send_message'),
    path('messages/<uuid:message_id>/read/', views.MarkAsReadView.as_view(), name='mark_read'),
    path('messages/<uuid:message_id>/delete/', views.DeleteMessageView.as_view(), name='delete_message'),
    
    # Voice Messages
    path('voice/upload/', views.VoiceMessageUploadView.as_view(), name='voice_upload'),
    path('voice/<uuid:message_id>/transcribe/', views.TranscribeVoiceView.as_view(), name='transcribe_voice'),
]
```

### AI Services URLs (ai_services/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Text-to-Speech
    path('tts/synthesize/', views.TextToSpeechView.as_view(), name='tts_synthesize'),
    path('tts/voices/', views.AvailableVoicesView.as_view(), name='tts_voices'),
    
    # Speech-to-Text
    path('stt/transcribe/', views.SpeechToTextView.as_view(), name='stt_transcribe'),
    path('stt/stream/', views.StreamingSTTView.as_view(), name='stt_stream'),
    
    # Sentiment Analysis
    path('sentiment/analyze/', views.SentimentAnalysisView.as_view(), name='sentiment_analyze'),
    
    # Gemma Assistant
    path('assistant/chat/', views.GemmaAssistantView.as_view(), name='assistant_chat'),
    path('assistant/accessibility-help/', views.AccessibilityHelpView.as_view(), name='accessibility_help'),
    
    # Peeping Tom Detection
    path('security/detect-faces/', views.FaceDetectionView.as_view(), name='detect_faces'),
]
```

### Mood URLs (mood/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Mood Tracking
    path('entry/', views.MoodEntryView.as_view(), name='mood_entry'),
    path('history/', views.MoodHistoryView.as_view(), name='mood_history'),
    path('analytics/', views.MoodAnalyticsView.as_view(), name='mood_analytics'),
    
    # Ambient Sounds
    path('sounds/', views.AmbientSoundListView.as_view(), name='sounds'),
    path('sounds/<int:sound_id>/', views.AmbientSoundDetailView.as_view(), name='sound_detail'),
    path('sounds/recommendations/', views.SoundRecommendationsView.as_view(), name='sound_recommendations'),
    
    # Sessions
    path('sessions/start/', views.StartSessionView.as_view(), name='start_session'),
    path('sessions/end/', views.EndSessionView.as_view(), name='end_session'),
]
```

---

## PART 5: AI/ML INTEGRATION WITH GOOGLE CLOUD

### services/gcp_client.py - Central GCP Service Manager

```python
import os
from google.cloud import aiplatform
from google.cloud import speech_v1 as speech
from google.cloud import texttospeech_v1 as texttospeech
from google.cloud import vision_v1 as vision
import google.generativeai as genai
from google.oauth2 import service_account

class GCPClient:
    """
    Centralized Google Cloud Platform client manager
    """
    
    def __init__(self):
        # Load credentials from environment or service account file
        self.credentials_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        self.project_id = os.environ.get('GCP_PROJECT_ID')
        self.location = os.environ.get('GCP_LOCATION', 'us-central1')
        
        # Initialize AI Platform
        aiplatform.init(
            project=self.project_id,
            location=self.location
        )
        
        # Initialize Gemini API
        genai.configure(api_key=os.environ.get('GOOGLE_AI_API_KEY'))
        
        # Initialize service clients
        self._speech_client = None
        self._tts_client = None
        self._vision_client = None
    
    @property
    def speech_client(self):
        if self._speech_client is None:
            self._speech_client = speech.SpeechClient()
        return self._speech_client
    
    @property
    def tts_client(self):
        if self._tts_client is None:
            self._tts_client = texttospeech.TextToSpeechClient()
        return self._tts_client
    
    @property
    def vision_client(self):
        if self._vision_client is None:
            self._vision_client = vision.ImageAnnotatorClient()
        return self._vision_client
    
    def get_gemma_model(self, model_name='gemma-3'):
        """
        Get Gemma model from Vertex AI
        """
        return genai.GenerativeModel(model_name)


# Singleton instance
gcp_client = GCPClient()
```

### ai_services/text_to_speech.py

```python
from google.cloud import texttospeech_v1 as texttospeech
from services.gcp_client import gcp_client
import base64

class TextToSpeechService:
    """
    Google Cloud Text-to-Speech integration
    
    API: Cloud Text-to-Speech API
    Enable at: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
    """
    
    def __init__(self):
        self.client = gcp_client.tts_client
    
    def synthesize(self, text: str, voice_name: str = 'en-US-Standard-A', 
                   speaking_rate: float = 1.0, pitch: float = 0.0) -> dict:
        """
        Convert text to speech audio
        
        Args:
            text: Text to synthesize
            voice_name: Voice ID (e.g., 'en-US-Standard-A', 'en-US-Wavenet-D')
            speaking_rate: Speed (0.25 to 4.0, default 1.0)
            pitch: Pitch adjustment (-20.0 to 20.0, default 0.0)
        
        Returns:
            dict with audio_content (base64) and audio_config
        """
        # Set the text input
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Parse voice name to get language code
        language_code = '-'.join(voice_name.split('-')[:2])
        
        # Build the voice request
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name
        )
        
        # Select audio encoding
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate,
            pitch=pitch
        )
        
        # Perform the TTS request
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        return {
            'audio_content': base64.b64encode(response.audio_content).decode('utf-8'),
            'audio_format': 'mp3',
            'voice_used': voice_name,
            'speaking_rate': speaking_rate,
            'pitch': pitch
        }
    
    def list_voices(self, language_code: str = 'en') -> list:
        """
        List available voices for a language
        """
        response = self.client.list_voices(language_code=language_code)
        
        voices = []
        for voice in response.voices:
            voices.append({
                'name': voice.name,
                'language_codes': list(voice.language_codes),
                'gender': texttospeech.SsmlVoiceGender(voice.ssml_gender).name,
                'natural_sample_rate': voice.natural_sample_rate_hertz
            })
        
        return voices


tts_service = TextToSpeechService()
```

### ai_services/speech_to_text.py

```python
from google.cloud import speech_v1 as speech
from services.gcp_client import gcp_client
import base64

class SpeechToTextService:
    """
    Google Cloud Speech-to-Text integration
    
    API: Cloud Speech-to-Text API
    Enable at: https://console.cloud.google.com/apis/library/speech.googleapis.com
    """
    
    def __init__(self):
        self.client = gcp_client.speech_client
    
    def transcribe(self, audio_content: bytes, language_code: str = 'en-US',
                   encoding: str = 'WEBM_OPUS', sample_rate: int = 48000) -> dict:
        """
        Transcribe audio to text
        
        Args:
            audio_content: Audio bytes
            language_code: Language code (e.g., 'en-US', 'es-ES')
            encoding: Audio encoding (LINEAR16, FLAC, WEBM_OPUS, etc.)
            sample_rate: Sample rate in Hz
        
        Returns:
            dict with transcription and confidence
        """
        audio = speech.RecognitionAudio(content=audio_content)
        
        config = speech.RecognitionConfig(
            encoding=getattr(speech.RecognitionConfig.AudioEncoding, encoding),
            sample_rate_hertz=sample_rate,
            language_code=language_code,
            enable_automatic_punctuation=True,
            enable_word_time_offsets=True,
            model='latest_long'  # Better accuracy
        )
        
        response = self.client.recognize(config=config, audio=audio)
        
        results = []
        for result in response.results:
            alternative = result.alternatives[0]
            results.append({
                'transcript': alternative.transcript,
                'confidence': alternative.confidence,
                'words': [
                    {
                        'word': word.word,
                        'start_time': word.start_time.total_seconds(),
                        'end_time': word.end_time.total_seconds()
                    }
                    for word in alternative.words
                ]
            })
        
        return {
            'results': results,
            'full_transcript': ' '.join([r['transcript'] for r in results])
        }
    
    def transcribe_streaming(self, audio_generator, language_code: str = 'en-US'):
        """
        Streaming transcription for real-time STT
        
        This is used for continuous listening mode
        """
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=language_code,
            enable_automatic_punctuation=True
        )
        
        streaming_config = speech.StreamingRecognitionConfig(
            config=config,
            interim_results=True
        )
        
        def request_generator():
            yield speech.StreamingRecognizeRequest(streaming_config=streaming_config)
            for chunk in audio_generator:
                yield speech.StreamingRecognizeRequest(audio_content=chunk)
        
        responses = self.client.streaming_recognize(request_generator())
        
        for response in responses:
            for result in response.results:
                yield {
                    'transcript': result.alternatives[0].transcript,
                    'is_final': result.is_final,
                    'confidence': result.alternatives[0].confidence if result.is_final else None
                }


stt_service = SpeechToTextService()
```

### ai_services/sentiment_analyzer.py

```python
import google.generativeai as genai
from services.gcp_client import gcp_client

class SentimentAnalyzer:
    """
    Sentiment Analysis using Gemma-3 via Google AI
    
    API: Generative AI API (Gemini/Gemma)
    Enable at: https://makersuite.google.com/app/apikey
    
    For Vertex AI Gemma:
    Enable at: https://console.cloud.google.com/vertex-ai
    """
    
    def __init__(self):
        # Use Gemini for sentiment (faster, good for real-time)
        # Can switch to Gemma-3 for more nuanced analysis
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of text
        
        Returns:
            dict with sentiment (positive/neutral/negative), score, and explanation
        """
        prompt = f"""Analyze the sentiment of the following message. 
        Consider the emotional context and provide:
        1. sentiment: "positive", "neutral", or "negative"
        2. score: float from -1.0 (very negative) to 1.0 (very positive)
        3. emotion: primary emotion detected (happy, sad, angry, anxious, calm, excited, etc.)
        4. explanation: brief explanation for accessibility users
        
        Respond in JSON format only.
        
        Message: "{text}"
        """
        
        response = self.model.generate_content(prompt)
        
        try:
            import json
            result = json.loads(response.text)
            return result
        except:
            # Fallback parsing
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'emotion': 'unknown',
                'explanation': 'Unable to analyze sentiment'
            }
    
    def analyze_conversation_mood(self, messages: list) -> dict:
        """
        Analyze overall mood of a conversation
        Useful for mood zone recommendations
        """
        conversation_text = "\n".join([
            f"{msg['sender']}: {msg['content']}" 
            for msg in messages[-10:]  # Last 10 messages
        ])
        
        prompt = f"""Analyze the overall mood of this conversation and suggest 
        what kind of ambient sound might help the user feel better.
        
        Provide:
        1. overall_mood: the dominant mood
        2. mood_trend: "improving", "stable", or "declining"
        3. recommended_sound_category: "nature", "music", "white_noise", or "meditation"
        4. specific_recommendation: specific sound suggestion
        
        Respond in JSON format only.
        
        Conversation:
        {conversation_text}
        """
        
        response = self.model.generate_content(prompt)
        
        try:
            import json
            return json.loads(response.text)
        except:
            return {
                'overall_mood': 'neutral',
                'mood_trend': 'stable',
                'recommended_sound_category': 'nature',
                'specific_recommendation': 'Gentle rain sounds'
            }


sentiment_analyzer = SentimentAnalyzer()
```

### ai_services/gemma_assistant.py

```python
import google.generativeai as genai
from google.cloud import aiplatform
from vertexai.preview.generative_models import GenerativeModel
import os

class GemmaAssistant:
    """
    Gemma-3 Integration for Intelligent Assistance
    
    TWO OPTIONS FOR GEMMA-3:
    
    Option 1: Google AI Studio (Easier, API Key based)
    - Get API key from: https://makersuite.google.com/app/apikey
    - Use gemini models or wait for Gemma-3 availability
    
    Option 2: Vertex AI (Production, more control)
    - Enable Vertex AI: https://console.cloud.google.com/vertex-ai
    - Deploy Gemma model from Model Garden
    - Use service account authentication
    """
    
    def __init__(self, use_vertex=False):
        self.use_vertex = use_vertex
        
        if use_vertex:
            # Vertex AI Gemma deployment
            aiplatform.init(
                project=os.environ.get('GCP_PROJECT_ID'),
                location=os.environ.get('GCP_LOCATION', 'us-central1')
            )
            # You need to deploy Gemma from Model Garden first
            self.endpoint_name = os.environ.get('GEMMA_ENDPOINT_NAME')
            self.model = GenerativeModel("gemma-3")
        else:
            # Google AI Studio (simpler)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def get_system_prompt(self):
        return """You are a helpful assistant for De-Novo, an accessible communication platform 
        for people with disabilities (visual, hearing, and speech impairments).
        
        Your role is to:
        1. Help users navigate the platform
        2. Explain features in accessible language
        3. Provide emotional support and understanding
        4. Suggest accessibility settings based on user needs
        5. Help compose messages when requested
        
        Be patient, clear, and always consider accessibility needs.
        Avoid using idioms or complex language that might be confusing.
        When describing visual elements, be detailed for visually impaired users.
        """
    
    def chat(self, user_message: str, conversation_history: list = None) -> str:
        """
        Chat with the Gemma assistant
        """
        messages = [{"role": "user", "parts": [self.get_system_prompt()]}]
        
        if conversation_history:
            for msg in conversation_history:
                messages.append({
                    "role": msg['role'],
                    "parts": [msg['content']]
                })
        
        messages.append({"role": "user", "parts": [user_message]})
        
        chat = self.model.start_chat(history=messages[:-1])
        response = chat.send_message(user_message)
        
        return response.text
    
    def help_compose_message(self, intent: str, context: str = None) -> str:
        """
        Help users compose messages
        Useful for speech-impaired users
        """
        prompt = f"""Help compose a message with the following intent: {intent}
        
        {"Context: " + context if context else ""}
        
        Provide 3 different message options, from casual to formal.
        Keep messages clear and friendly.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def explain_for_accessibility(self, content: str, impairment_type: str) -> str:
        """
        Explain content in an accessible way based on user's impairment
        """
        prompts = {
            'visual': f"Describe this content in detail for a visually impaired user: {content}",
            'hearing': f"Explain this content, avoiding audio references, for a deaf user: {content}",
            'speech': f"Summarize this content briefly for a user who communicates via typing: {content}"
        }
        
        prompt = prompts.get(impairment_type, prompts['visual'])
        response = self.model.generate_content(prompt)
        return response.text


gemma_assistant = GemmaAssistant(use_vertex=False)  # Set True for production
```

### ai_services/peeping_tom_detector.py

```python
from google.cloud import vision_v1 as vision
from services.gcp_client import gcp_client
import base64
import numpy as np

class PeepingTomDetector:
    """
    Face Detection for "Peeping Tom" Security Feature
    
    API: Cloud Vision API
    Enable at: https://console.cloud.google.com/apis/library/vision.googleapis.com
    
    This detects if multiple faces are visible in the camera frame,
    indicating someone might be looking over the user's shoulder.
    """
    
    def __init__(self):
        self.client = gcp_client.vision_client
        self.registered_face_encoding = None  # For advanced: store user's face
    
    def detect_faces(self, image_content: bytes) -> dict:
        """
        Detect faces in an image
        
        Args:
            image_content: Image bytes from webcam capture
        
        Returns:
            dict with face count, positions, and warning status
        """
        image = vision.Image(content=image_content)
        
        response = self.client.face_detection(image=image)
        faces = response.face_annotations
        
        face_data = []
        for face in faces:
            vertices = face.bounding_poly.vertices
            face_data.append({
                'bounding_box': {
                    'x': vertices[0].x,
                    'y': vertices[0].y,
                    'width': vertices[2].x - vertices[0].x,
                    'height': vertices[2].y - vertices[0].y
                },
                'detection_confidence': face.detection_confidence,
                'joy_likelihood': vision.Likelihood(face.joy_likelihood).name,
                'anger_likelihood': vision.Likelihood(face.anger_likelihood).name,
                'roll_angle': face.roll_angle,
                'pan_angle': face.pan_angle
            })
        
        # Warning logic
        face_count = len(faces)
        warning = False
        warning_message = None
        
        if face_count == 0:
            warning_message = "No face detected - user may have stepped away"
        elif face_count > 1:
            warning = True
            warning_message = f"Warning: {face_count} faces detected! Someone may be looking at your screen."
        
        return {
            'face_count': face_count,
            'faces': face_data,
            'warning': warning,
            'warning_message': warning_message,
            'should_alert': face_count > 1
        }
    
    def continuous_monitoring(self, image_content: bytes, 
                             expected_faces: int = 1) -> dict:
        """
        For continuous monitoring mode
        Returns quick boolean check
        """
        result = self.detect_faces(image_content)
        
        return {
            'is_safe': result['face_count'] == expected_faces,
            'face_count': result['face_count'],
            'alert': result['warning']
        }


peeping_tom_detector = PeepingTomDetector()
```

---

## PART 6: WEBSOCKET FOR REAL-TIME CHAT

### chat/consumers.py

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.ai_services.sentiment_analyzer import sentiment_analyzer

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    """
    
    async def connect(self):
        self.user = self.scope['user']
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Mark user as online
        await self.update_user_status(True)
    
    async def disconnect(self, close_code):
        # Leave conversation group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Mark user as offline
        await self.update_user_status(False)
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')
        
        if message_type == 'message':
            await self.handle_message(data)
        elif message_type == 'typing':
            await self.handle_typing(data)
        elif message_type == 'read':
            await self.handle_read_receipt(data)
    
    async def handle_message(self, data):
        content = data['content']
        
        # Analyze sentiment asynchronously
        sentiment = await self.analyze_sentiment(content)
        
        # Save message to database
        message = await self.save_message(content, sentiment)
        
        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': str(message.id),
                    'sender_id': self.user.id,
                    'sender_name': self.user.username,
                    'content': content,
                    'sentiment': sentiment,
                    'timestamp': message.created_at.isoformat()
                }
            }
        )
    
    async def handle_typing(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': data.get('is_typing', True)
            }
        )
    
    async def handle_read_receipt(self, data):
        message_id = data['message_id']
        await self.mark_message_read(message_id)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt',
                'message_id': message_id,
                'reader_id': self.user.id
            }
        )
    
    # Event handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))
    
    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing']
        }))
    
    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'message_id': event['message_id'],
            'reader_id': event['reader_id']
        }))
    
    @database_sync_to_async
    def analyze_sentiment(self, text):
        result = sentiment_analyzer.analyze(text)
        return result
    
    @database_sync_to_async
    def save_message(self, content, sentiment):
        from apps.chat.models import Message
        # Implement message saving with encryption
        pass
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        from apps.chat.models import Message
        # Implement read receipt
        pass
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        self.user.is_online = is_online
        self.user.save(update_fields=['is_online', 'last_seen'])
```

### chat/routing.py

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<conversation_id>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
]
```

---

## PART 7: END-TO-END ENCRYPTION

### services/encryption.py

```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64

class E2EEncryption:
    """
    End-to-End Encryption for messages
    
    Architecture:
    1. Each user has RSA key pair (public/private)
    2. Messages are encrypted with AES-256-GCM
    3. AES key is encrypted with recipient's RSA public key
    4. Private keys never leave client (stored in browser)
    
    For hackathon: Server holds keys (simplified)
    For production: Use Web Crypto API on client
    """
    
    @staticmethod
    def generate_key_pair():
        """Generate RSA key pair for a user"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        public_key = private_key.public_key()
        
        # Serialize keys
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return {
            'private_key': private_pem.decode('utf-8'),
            'public_key': public_pem.decode('utf-8')
        }
    
    @staticmethod
    def encrypt_message(message: str, recipient_public_key_pem: str) -> dict:
        """
        Encrypt a message for a recipient
        
        Returns:
            dict with encrypted_content, encrypted_key, iv, tag
        """
        # Generate random AES key
        aes_key = os.urandom(32)  # 256-bit key
        iv = os.urandom(12)  # 96-bit IV for GCM
        
        # Encrypt message with AES-GCM
        cipher = Cipher(
            algorithms.AES(aes_key),
            modes.GCM(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        encrypted_content = encryptor.update(message.encode('utf-8')) + encryptor.finalize()
        
        # Encrypt AES key with recipient's RSA public key
        public_key = serialization.load_pem_public_key(
            recipient_public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
        
        encrypted_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            'encrypted_content': base64.b64encode(encrypted_content).decode('utf-8'),
            'encrypted_key': base64.b64encode(encrypted_key).decode('utf-8'),
            'iv': base64.b64encode(iv).decode('utf-8'),
            'tag': base64.b64encode(encryptor.tag).decode('utf-8')
        }
    
    @staticmethod
    def decrypt_message(encrypted_data: dict, private_key_pem: str) -> str:
        """
        Decrypt a message using private key
        """
        # Load private key
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        
        # Decode base64 values
        encrypted_key = base64.b64decode(encrypted_data['encrypted_key'])
        encrypted_content = base64.b64decode(encrypted_data['encrypted_content'])
        iv = base64.b64decode(encrypted_data['iv'])
        tag = base64.b64decode(encrypted_data['tag'])
        
        # Decrypt AES key with RSA private key
        aes_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Decrypt message with AES-GCM
        cipher = Cipher(
            algorithms.AES(aes_key),
            modes.GCM(iv, tag),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        decrypted_content = decryptor.update(encrypted_content) + decryptor.finalize()
        
        return decrypted_content.decode('utf-8')


encryption_service = E2EEncryption()
```

---

## PART 8: ENVIRONMENT CONFIGURATION

### .env.example

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# MySQL Database (User data, settings)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=de_novo
MYSQL_USER=root
MYSQL_PASSWORD=your-password

# MongoDB (Messages, conversations)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=de_novo_chat

# Redis (Channels, caching)
REDIS_URL=redis://localhost:6379/0

# Google Cloud Platform
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Google AI Studio API Key (for Gemini/Gemma)
GOOGLE_AI_API_KEY=your-api-key-from-makersuite

# Vertex AI Gemma Endpoint (if using Vertex AI)
GEMMA_ENDPOINT_NAME=projects/your-project/locations/us-central1/endpoints/your-endpoint

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## PART 9: GOOGLE CLOUD PLATFORM SETUP GUIDE

### APIs TO ENABLE (Google Cloud Console)

```
1. Cloud Speech-to-Text API
   URL: https://console.cloud.google.com/apis/library/speech.googleapis.com
   Use: Voice message transcription, Speech-to-Text feature

2. Cloud Text-to-Speech API
   URL: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
   Use: Text-to-Speech accessibility feature

3. Cloud Vision API
   URL: https://console.cloud.google.com/apis/library/vision.googleapis.com
   Use: Peeping Tom face detection feature

4. Vertex AI API
   URL: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
   Use: Gemma-3 model deployment (optional for hackathon)

5. Generative Language API (Google AI Studio)
   URL: https://makersuite.google.com/app/apikey
   Use: Gemini/Gemma for sentiment analysis and assistant
```

### QUICK SETUP COMMANDS (Google Cloud CLI)

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable aiplatform.googleapis.com

# Create service account
gcloud iam service-accounts create de-novo-backend \
    --display-name="De-Novo Backend Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:de-novo-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:de-novo-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/speech.client"

# Create and download key
gcloud iam service-accounts keys create service-account.json \
    --iam-account=de-novo-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

---

## PART 10: 4-HOUR HACKATHON PRIORITY IMPLEMENTATION

### HOUR 1: Core Setup (60 min)
```
- [ ] Django project setup with DRF
- [ ] User model with accessibility fields
- [ ] JWT authentication endpoints
- [ ] Basic CORS configuration
- [ ] MySQL connection
```

### HOUR 2: Chat System (60 min)
```
- [ ] Conversation and Message models
- [ ] REST endpoints for conversations/messages
- [ ] WebSocket consumer (basic)
- [ ] MongoDB connection for messages
```

### HOUR 3: AI Integration (60 min)
```
- [ ] GCP client setup
- [ ] Text-to-Speech endpoint
- [ ] Speech-to-Text endpoint
- [ ] Sentiment analysis with Gemini
- [ ] Connect sentiment to chat messages
```

### HOUR 4: Security & Polish (60 min)
```
- [ ] Face detection endpoint (Peeping Tom)
- [ ] Basic E2E encryption helpers
- [ ] Mood endpoints (simplified)
- [ ] API documentation
- [ ] Testing critical endpoints
```

### SIMPLIFIED MODELS FOR HACKATHON

If time is short, use this simplified approach:

```python
# Use SQLite instead of MySQL for quick setup
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Skip MongoDB - store messages in SQLite
# Skip WebSockets - use polling
# Skip E2E encryption - use HTTPS only
# Use Google AI Studio instead of Vertex AI
```

---

## PART 11: API RESPONSE FORMATS

### Standard Success Response
```json
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

### Standard Error Response
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "details": { ... }
    }
}
```

### Pagination Response
```json
{
    "success": true,
    "data": {
        "results": [ ... ],
        "pagination": {
            "page": 1,
            "page_size": 20,
            "total_pages": 5,
            "total_count": 100,
            "has_next": true,
            "has_previous": false
        }
    }
}
```

---

## FINAL INSTRUCTIONS FOR AGENT

Generate all Django apps with:
1. Complete models with migrations
2. Serializers with validation
3. ViewSets with proper permissions
4. URL routing
5. Integration with Google Cloud services
6. WebSocket consumers for real-time features
7. Comprehensive error handling
8. API documentation strings

Focus on accessibility in all responses - ensure all error messages are clear and can be read by screen readers.
