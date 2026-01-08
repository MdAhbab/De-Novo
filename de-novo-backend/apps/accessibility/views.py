"""
Views for Accessibility app.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AccessibilityPreset, UserAccessibilityFeedback, QuickPhrase
from .serializers import (
    AccessibilityPresetSerializer,
    AccessibilityFeedbackSerializer,
    CreateFeedbackSerializer,
    QuickPhraseSerializer,
    CreateQuickPhraseSerializer,
    ApplyPresetSerializer,
)


class AccessibilityPresetsView(generics.ListAPIView):
    """List all accessibility presets."""
    
    serializer_class = AccessibilityPresetSerializer
    
    def get_queryset(self):
        queryset = AccessibilityPreset.objects.all()
        
        disability = self.request.query_params.get('disability')
        if disability:
            queryset = queryset.filter(disability_type=disability)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Group by disability type
        grouped = {}
        for preset in serializer.data:
            disability = preset['disability_type']
            if disability not in grouped:
                grouped[disability] = []
            grouped[disability].append(preset)
        
        return Response({
            'success': True,
            'data': {
                'presets': serializer.data,
                'grouped': grouped
            }
        })


class PresetDetailView(generics.RetrieveAPIView):
    """Get preset details."""
    
    serializer_class = AccessibilityPresetSerializer
    queryset = AccessibilityPreset.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'preset_id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class ApplyPresetView(APIView):
    """Apply a preset to user's settings."""
    
    def post(self, request):
        serializer = ApplyPresetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            preset = AccessibilityPreset.objects.get(
                id=serializer.validated_data['preset_id']
            )
        except AccessibilityPreset.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Preset not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Apply preset settings to user
        user = request.user
        settings = preset.settings
        
        # Update user accessibility settings
        if 'font_size' in settings:
            user.font_size = settings['font_size']
        if 'high_contrast' in settings:
            user.high_contrast = settings['high_contrast']
        if 'color_blind_mode' in settings:
            user.color_blind_mode = settings['color_blind_mode']
        if 'tts_enabled' in settings:
            user.tts_enabled = settings['tts_enabled']
        if 'tts_voice' in settings:
            user.tts_voice = settings['tts_voice']
        if 'tts_speed' in settings:
            user.tts_speed = settings['tts_speed']
        if 'stt_enabled' in settings:
            user.stt_enabled = settings['stt_enabled']
        if 'stt_language' in settings:
            user.stt_language = settings['stt_language']
        
        user.save()
        
        return Response({
            'success': True,
            'message': f'Applied "{preset.name}" preset',
            'data': {
                'preset': AccessibilityPresetSerializer(preset).data,
                'applied_settings': settings
            }
        })


class QuickPhrasesView(APIView):
    """List and create quick phrases."""
    
    def get(self, request):
        # Get system phrases and user's custom phrases
        phrases = QuickPhrase.objects.filter(
            models.Q(is_system=True) | models.Q(user=request.user)
        ).order_by('category', 'display_order')
        
        # Group by category
        grouped = {}
        for phrase in phrases:
            cat = phrase.category
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(QuickPhraseSerializer(phrase).data)
        
        return Response({
            'success': True,
            'data': {
                'phrases': QuickPhraseSerializer(phrases, many=True).data,
                'grouped': grouped
            }
        })
    
    def post(self, request):
        serializer = CreateQuickPhraseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get max display order
        max_order = QuickPhrase.objects.filter(
            user=request.user,
            category=serializer.validated_data['category']
        ).count()
        
        phrase = QuickPhrase.objects.create(
            user=request.user,
            category=serializer.validated_data['category'],
            phrase=serializer.validated_data['phrase'],
            shortcut=serializer.validated_data.get('shortcut', ''),
            display_order=max_order,
            is_system=False
        )
        
        return Response({
            'success': True,
            'data': QuickPhraseSerializer(phrase).data,
            'message': 'Quick phrase added'
        }, status=status.HTTP_201_CREATED)


class QuickPhraseDetailView(APIView):
    """Update and delete quick phrases."""
    
    def put(self, request, phrase_id):
        try:
            phrase = QuickPhrase.objects.get(
                id=phrase_id,
                user=request.user,
                is_system=False
            )
        except QuickPhrase.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Phrase not found or cannot be edited'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data
        if 'phrase' in data:
            phrase.phrase = data['phrase']
        if 'shortcut' in data:
            phrase.shortcut = data['shortcut']
        if 'category' in data:
            phrase.category = data['category']
        
        phrase.save()
        
        return Response({
            'success': True,
            'data': QuickPhraseSerializer(phrase).data,
            'message': 'Quick phrase updated'
        })
    
    def delete(self, request, phrase_id):
        try:
            phrase = QuickPhrase.objects.get(
                id=phrase_id,
                user=request.user,
                is_system=False
            )
        except QuickPhrase.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Phrase not found or cannot be deleted'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        phrase.delete()
        
        return Response({
            'success': True,
            'message': 'Quick phrase deleted'
        })


class AccessibilityFeedbackView(APIView):
    """Submit and retrieve accessibility feedback."""
    
    def get(self, request):
        feedback = UserAccessibilityFeedback.objects.filter(user=request.user)
        serializer = AccessibilityFeedbackSerializer(feedback, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        serializer = CreateFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        feedback = UserAccessibilityFeedback.objects.create(
            user=request.user,
            feature=serializer.validated_data['feature'],
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data.get('comment', '')
        )
        
        return Response({
            'success': True,
            'data': AccessibilityFeedbackSerializer(feedback).data,
            'message': 'Thank you for your feedback!'
        }, status=status.HTTP_201_CREATED)


class AccessibilityTipsView(APIView):
    """Get personalized accessibility tips."""
    
    def get(self, request):
        user = request.user
        tips = []
        
        # Tips based on disability type
        if user.disability_type == 'visual':
            tips.extend([
                {
                    'title': 'Enable High Contrast',
                    'description': 'High contrast mode can help with visibility.',
                    'action': 'settings/accessibility',
                    'priority': 'high' if not user.high_contrast else 'done'
                },
                {
                    'title': 'Try Text-to-Speech',
                    'description': 'Let messages be read aloud to you.',
                    'action': 'settings/tts',
                    'priority': 'high' if not user.tts_enabled else 'done'
                },
                {
                    'title': 'Increase Font Size',
                    'description': 'Larger text can reduce eye strain.',
                    'action': 'settings/accessibility',
                    'priority': 'medium' if user.font_size < 20 else 'done'
                },
            ])
        
        elif user.disability_type == 'hearing':
            tips.extend([
                {
                    'title': 'Enable Visual Notifications',
                    'description': 'Get visual alerts for new messages.',
                    'action': 'settings/notifications',
                    'priority': 'high'
                },
                {
                    'title': 'Use Sentiment Indicators',
                    'description': 'See emotion indicators to understand message tone.',
                    'action': 'settings/chat',
                    'priority': 'medium'
                },
            ])
        
        elif user.disability_type == 'speech':
            tips.extend([
                {
                    'title': 'Set Up Quick Phrases',
                    'description': 'Create shortcuts for common messages.',
                    'action': 'settings/quick-phrases',
                    'priority': 'high'
                },
                {
                    'title': 'Try AI Message Composer',
                    'description': 'Let AI help compose your messages.',
                    'action': 'chat/ai-assist',
                    'priority': 'medium'
                },
            ])
        
        # General tips
        tips.extend([
            {
                'title': 'Explore Ambient Sounds',
                'description': 'Calming sounds can enhance your experience.',
                'action': 'mood/sounds',
                'priority': 'low'
            },
            {
                'title': 'Track Your Mood',
                'description': 'Regular mood tracking helps personalize your experience.',
                'action': 'mood/track',
                'priority': 'low'
            },
        ])
        
        # Sort by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2, 'done': 3}
        tips.sort(key=lambda x: priority_order.get(x['priority'], 3))
        
        return Response({
            'success': True,
            'data': {
                'tips': tips,
                'user_disability': user.disability_type
            }
        })


# Import models for Q lookup
from django.db import models
