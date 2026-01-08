"""
Serializers for Mood app.
"""

from rest_framework import serializers
from .models import MoodEntry, AmbientSound, UserSoundSession


class MoodEntrySerializer(serializers.ModelSerializer):
    """Serializer for mood entries."""
    
    mood_display = serializers.CharField(source='get_mood_display', read_only=True)
    
    class Meta:
        model = MoodEntry
        fields = ['id', 'mood', 'mood_display', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class CreateMoodEntrySerializer(serializers.Serializer):
    """Serializer for creating mood entries."""
    
    mood = serializers.ChoiceField(choices=[
        'very_happy', 'happy', 'neutral', 'sad', 'very_sad',
        'anxious', 'calm', 'energetic', 'tired', 'frustrated', 'grateful'
    ])
    notes = serializers.CharField(required=False, allow_blank=True)


class AmbientSoundSerializer(serializers.ModelSerializer):
    """Serializer for ambient sounds."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = AmbientSound
        fields = [
            'id', 'name', 'category', 'category_display',
            'file_url', 'thumbnail_url', 'duration', 'description',
            'recommended_moods', 'play_count'
        ]


class UserSoundSessionSerializer(serializers.ModelSerializer):
    """Serializer for sound sessions."""
    
    sound_name = serializers.CharField(source='sound.name', read_only=True)
    
    class Meta:
        model = UserSoundSession
        fields = [
            'id', 'sound', 'sound_name', 'started_at', 'ended_at',
            'duration_listened', 'mood_before', 'mood_after'
        ]
        read_only_fields = ['id', 'started_at']


class StartSessionSerializer(serializers.Serializer):
    """Serializer for starting a sound session."""
    
    sound_id = serializers.IntegerField(required=True)
    mood_before = serializers.CharField(required=False, allow_blank=True)


class EndSessionSerializer(serializers.Serializer):
    """Serializer for ending a sound session."""
    
    session_id = serializers.IntegerField(required=True)
    duration_listened = serializers.IntegerField(required=True)
    mood_after = serializers.CharField(required=False, allow_blank=True)
