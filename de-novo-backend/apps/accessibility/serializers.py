"""
Serializers for Accessibility app.
"""

from rest_framework import serializers
from .models import AccessibilityPreset, UserAccessibilityFeedback, QuickPhrase


class AccessibilityPresetSerializer(serializers.ModelSerializer):
    """Serializer for accessibility presets."""
    
    disability_display = serializers.CharField(source='get_disability_type_display', read_only=True)
    
    class Meta:
        model = AccessibilityPreset
        fields = [
            'id', 'name', 'description', 'disability_type',
            'disability_display', 'settings', 'is_default'
        ]


class AccessibilityFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for accessibility feedback."""
    
    feature_display = serializers.CharField(source='get_feature_display', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    
    class Meta:
        model = UserAccessibilityFeedback
        fields = [
            'id', 'feature', 'feature_display', 'rating',
            'rating_display', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CreateFeedbackSerializer(serializers.Serializer):
    """Serializer for creating feedback."""
    
    feature = serializers.ChoiceField(choices=[
        'tts', 'stt', 'high_contrast', 'font_size',
        'color_blind', 'haptic', 'navigation', 'other'
    ])
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)


class QuickPhraseSerializer(serializers.ModelSerializer):
    """Serializer for quick phrases."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = QuickPhrase
        fields = [
            'id', 'category', 'category_display', 'phrase',
            'shortcut', 'display_order', 'is_system'
        ]
        read_only_fields = ['id', 'is_system']


class CreateQuickPhraseSerializer(serializers.Serializer):
    """Serializer for creating quick phrases."""
    
    category = serializers.ChoiceField(choices=[
        'greeting', 'common', 'emergency', 'emotion', 'question', 'custom'
    ])
    phrase = serializers.CharField()
    shortcut = serializers.CharField(required=False, allow_blank=True)


class ApplyPresetSerializer(serializers.Serializer):
    """Serializer for applying a preset."""
    
    preset_id = serializers.IntegerField()
