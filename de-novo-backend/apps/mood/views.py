"""
Views for Mood app.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Avg
from datetime import timedelta

from .models import MoodEntry, AmbientSound, UserSoundSession
from .serializers import (
    MoodEntrySerializer,
    CreateMoodEntrySerializer,
    AmbientSoundSerializer,
    UserSoundSessionSerializer,
    StartSessionSerializer,
    EndSessionSerializer,
)


class MoodEntryView(APIView):
    """Create and retrieve mood entries."""
    
    def get(self, request):
        """Get latest mood entry."""
        entry = MoodEntry.objects.filter(user=request.user).first()
        
        if entry:
            return Response({
                'success': True,
                'data': MoodEntrySerializer(entry).data
            })
        
        return Response({
            'success': True,
            'data': None,
            'message': 'No mood entries yet'
        })
    
    def post(self, request):
        """Create a new mood entry."""
        serializer = CreateMoodEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        entry = MoodEntry.objects.create(
            user=request.user,
            mood=serializer.validated_data['mood'],
            notes=serializer.validated_data.get('notes', '')
        )
        
        return Response({
            'success': True,
            'data': MoodEntrySerializer(entry).data,
            'message': 'Mood recorded successfully'
        }, status=status.HTTP_201_CREATED)


class MoodHistoryView(generics.ListAPIView):
    """Get mood history."""
    
    serializer_class = MoodEntrySerializer
    
    def get_queryset(self):
        days = int(self.request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)
        
        return MoodEntry.objects.filter(
            user=self.request.user,
            created_at__gte=since
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class MoodAnalyticsView(APIView):
    """Get mood analytics and insights."""
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)
        
        entries = MoodEntry.objects.filter(
            user=request.user,
            created_at__gte=since
        )
        
        # Mood distribution
        mood_counts = entries.values('mood').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Most common mood
        most_common = mood_counts.first() if mood_counts else None
        
        # Recent trend (last 7 days vs previous 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        two_weeks_ago = timezone.now() - timedelta(days=14)
        
        positive_moods = ['very_happy', 'happy', 'calm', 'energetic', 'grateful']
        
        recent_positive = entries.filter(
            created_at__gte=week_ago,
            mood__in=positive_moods
        ).count()
        
        previous_positive = entries.filter(
            created_at__gte=two_weeks_ago,
            created_at__lt=week_ago,
            mood__in=positive_moods
        ).count()
        
        if previous_positive > 0:
            trend = 'improving' if recent_positive > previous_positive else 'declining'
        else:
            trend = 'stable'
        
        return Response({
            'success': True,
            'data': {
                'period_days': days,
                'total_entries': entries.count(),
                'mood_distribution': list(mood_counts),
                'most_common_mood': most_common,
                'trend': trend,
                'positive_entries_this_week': recent_positive,
                'positive_entries_last_week': previous_positive
            }
        })


class AmbientSoundListView(generics.ListAPIView):
    """List available ambient sounds."""
    
    serializer_class = AmbientSoundSerializer
    
    def get_queryset(self):
        queryset = AmbientSound.objects.filter(is_active=True)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        mood = self.request.query_params.get('mood')
        if mood:
            queryset = queryset.filter(recommended_moods__contains=mood)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Get categories for filter
        categories = [
            {'value': 'nature', 'label': 'Nature'},
            {'value': 'music', 'label': 'Music'},
            {'value': 'white_noise', 'label': 'White Noise'},
            {'value': 'meditation', 'label': 'Meditation'},
        ]
        
        return Response({
            'success': True,
            'data': {
                'sounds': serializer.data,
                'categories': categories
            }
        })


class AmbientSoundDetailView(generics.RetrieveAPIView):
    """Get ambient sound details."""
    
    serializer_class = AmbientSoundSerializer
    queryset = AmbientSound.objects.filter(is_active=True)
    lookup_field = 'id'
    lookup_url_kwarg = 'sound_id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class SoundRecommendationsView(APIView):
    """Get personalized sound recommendations."""
    
    def get(self, request):
        # Get user's recent mood
        recent_mood = MoodEntry.objects.filter(
            user=request.user
        ).first()
        
        current_mood = recent_mood.mood if recent_mood else 'neutral'
        
        # Map moods to recommended sound categories
        mood_to_category = {
            'very_happy': ['music'],
            'happy': ['music', 'nature'],
            'neutral': ['nature', 'white_noise'],
            'sad': ['meditation', 'nature'],
            'very_sad': ['meditation'],
            'anxious': ['meditation', 'nature'],
            'calm': ['nature', 'music'],
            'energetic': ['music'],
            'tired': ['meditation', 'white_noise'],
            'frustrated': ['meditation', 'nature'],
            'grateful': ['meditation', 'music'],
        }
        
        recommended_categories = mood_to_category.get(current_mood, ['nature'])
        
        # Get recommended sounds
        sounds = AmbientSound.objects.filter(
            is_active=True,
            category__in=recommended_categories
        ).order_by('-play_count')[:6]
        
        # Also get AI-based recommendation
        ai_recommendation = None
        try:
            from apps.ai_services.sentiment_analyzer import sentiment_analyzer
            recent_entries = MoodEntry.objects.filter(user=request.user)[:5]
            if recent_entries:
                messages = [{'sender': 'user', 'content': e.notes or e.mood} for e in recent_entries]
                ai_result = sentiment_analyzer.analyze_conversation_mood(messages)
                ai_recommendation = {
                    'category': ai_result.get('recommended_sound_category'),
                    'specific': ai_result.get('specific_recommendation'),
                    'reason': f"Based on your {ai_result.get('overall_mood', 'recent')} mood"
                }
        except Exception as e:
            print(f"AI recommendation error: {e}")
        
        return Response({
            'success': True,
            'data': {
                'current_mood': current_mood,
                'recommended_sounds': AmbientSoundSerializer(sounds, many=True).data,
                'ai_recommendation': ai_recommendation
            }
        })


class StartSessionView(APIView):
    """Start a sound listening session."""
    
    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            sound = AmbientSound.objects.get(
                id=serializer.validated_data['sound_id'],
                is_active=True
            )
        except AmbientSound.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Sound not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # End any active sessions
        UserSoundSession.objects.filter(
            user=request.user,
            ended_at__isnull=True
        ).update(ended_at=timezone.now())
        
        # Create new session
        session = UserSoundSession.objects.create(
            user=request.user,
            sound=sound,
            mood_before=serializer.validated_data.get('mood_before', '')
        )
        
        # Increment play count
        sound.play_count += 1
        sound.save(update_fields=['play_count'])
        
        return Response({
            'success': True,
            'data': UserSoundSessionSerializer(session).data,
            'message': 'Session started'
        }, status=status.HTTP_201_CREATED)


class EndSessionView(APIView):
    """End a sound listening session."""
    
    def post(self, request):
        serializer = EndSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            session = UserSoundSession.objects.get(
                id=serializer.validated_data['session_id'],
                user=request.user,
                ended_at__isnull=True
            )
        except UserSoundSession.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Active session not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        session.ended_at = timezone.now()
        session.duration_listened = serializer.validated_data['duration_listened']
        session.mood_after = serializer.validated_data.get('mood_after', '')
        session.save()
        
        return Response({
            'success': True,
            'data': UserSoundSessionSerializer(session).data,
            'message': 'Session ended'
        })
