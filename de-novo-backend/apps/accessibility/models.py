"""
Accessibility models for De-Novo platform.
Stores presets and user-specific accessibility configurations.
"""

from django.db import models
from django.conf import settings


class AccessibilityPreset(models.Model):
    """
    Pre-defined accessibility presets for quick setup.
    """
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    disability_type = models.CharField(
        max_length=20,
        choices=[
            ('visual', 'Visual Impairment'),
            ('hearing', 'Hearing Impairment'),
            ('speech', 'Speech Impairment'),
            ('motor', 'Motor Impairment'),
            ('cognitive', 'Cognitive Impairment'),
            ('general', 'General Accessibility'),
        ]
    )
    settings = models.JSONField(
        help_text='Preset accessibility settings as JSON'
    )
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accessibility_presets'
        ordering = ['name']
        verbose_name = 'Accessibility Preset'
        verbose_name_plural = 'Accessibility Presets'
    
    def __str__(self):
        return f"{self.name} ({self.disability_type})"


class UserAccessibilityFeedback(models.Model):
    """
    Collect feedback on accessibility features.
    """
    
    FEATURE_CHOICES = [
        ('tts', 'Text-to-Speech'),
        ('stt', 'Speech-to-Text'),
        ('high_contrast', 'High Contrast Mode'),
        ('font_size', 'Font Size'),
        ('color_blind', 'Color Blind Mode'),
        ('haptic', 'Haptic Feedback'),
        ('navigation', 'Navigation'),
        ('other', 'Other'),
    ]
    
    RATING_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accessibility_feedback'
    )
    feature = models.CharField(max_length=20, choices=FEATURE_CHOICES)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accessibility_feedback'
        ordering = ['-created_at']
        verbose_name = 'Accessibility Feedback'
        verbose_name_plural = 'Accessibility Feedback'
    
    def __str__(self):
        return f"{self.user.username} - {self.feature}: {self.rating}/5"


class QuickPhrase(models.Model):
    """
    Quick phrases for users who have difficulty typing.
    """
    
    CATEGORY_CHOICES = [
        ('greeting', 'Greetings'),
        ('common', 'Common Responses'),
        ('emergency', 'Emergency'),
        ('emotion', 'Emotions'),
        ('question', 'Questions'),
        ('custom', 'Custom'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quick_phrases',
        null=True,
        blank=True,
        help_text='Null for system-wide phrases'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    phrase = models.TextField()
    shortcut = models.CharField(
        max_length=20,
        blank=True,
        help_text='Keyboard shortcut or emoji trigger'
    )
    display_order = models.IntegerField(default=0)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'quick_phrases'
        ordering = ['category', 'display_order']
        verbose_name = 'Quick Phrase'
        verbose_name_plural = 'Quick Phrases'
    
    def __str__(self):
        prefix = "System" if self.is_system else (self.user.username if self.user else "Unknown")
        return f"{prefix}: {self.phrase[:50]}"
