"""
Mood models for De-Novo platform.
Tracks user mood and ambient sound sessions.
"""

from django.db import models
from django.conf import settings


class MoodEntry(models.Model):
    """
    Track user's mood over time.
    """
    
    MOOD_CHOICES = [
        ('very_happy', 'Very Happy 😄'),
        ('happy', 'Happy 🙂'),
        ('neutral', 'Neutral 😐'),
        ('sad', 'Sad 😢'),
        ('very_sad', 'Very Sad 😭'),
        ('anxious', 'Anxious 😰'),
        ('calm', 'Calm 😌'),
        ('energetic', 'Energetic ⚡'),
        ('tired', 'Tired 😴'),
        ('frustrated', 'Frustrated 😤'),
        ('grateful', 'Grateful 🙏'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mood_entries'
    )
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mood_entries'
        ordering = ['-created_at']
        verbose_name = 'Mood Entry'
        verbose_name_plural = 'Mood Entries'
    
    def __str__(self):
        return f"{self.user.username} - {self.mood} at {self.created_at}"


class AmbientSound(models.Model):
    """
    Ambient sounds for mood enhancement.
    """
    
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
    duration = models.IntegerField(help_text='Duration in seconds')
    description = models.TextField(blank=True)
    recommended_moods = models.JSONField(
        default=list,
        help_text='List of mood types this sound is good for'
    )
    is_active = models.BooleanField(default=True)
    play_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ambient_sounds'
        ordering = ['-play_count']
        verbose_name = 'Ambient Sound'
        verbose_name_plural = 'Ambient Sounds'
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class UserSoundSession(models.Model):
    """
    Track user's listening sessions.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sound_sessions'
    )
    sound = models.ForeignKey(
        AmbientSound,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_listened = models.IntegerField(
        default=0,
        help_text='Duration listened in seconds'
    )
    mood_before = models.CharField(max_length=20, blank=True)
    mood_after = models.CharField(max_length=20, blank=True)
    
    class Meta:
        db_table = 'user_sound_sessions'
        ordering = ['-started_at']
        verbose_name = 'Sound Session'
        verbose_name_plural = 'Sound Sessions'
    
    def __str__(self):
        return f"{self.user.username} - {self.sound.name}"
