"""
User models for De-Novo platform.
Includes accessibility preferences and disability information.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with accessibility and disability fields.
    """
    
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
    disability_type = models.CharField(
        max_length=20, 
        choices=DISABILITY_CHOICES, 
        default='none'
    )
    disability_details = models.TextField(blank=True)
    
    # Accessibility Preferences
    font_size = models.IntegerField(default=16)
    high_contrast = models.BooleanField(default=False)
    color_blind_mode = models.CharField(
        max_length=20, 
        choices=COLOR_BLIND_CHOICES, 
        default='none'
    )
    dark_mode = models.BooleanField(default=False)
    reduce_motion = models.BooleanField(default=False)
    
    # TTS (Text-to-Speech) Preferences
    tts_enabled = models.BooleanField(default=True)
    tts_voice = models.CharField(max_length=50, default='en-US-Standard-A')
    tts_rate = models.FloatField(default=1.0)
    tts_pitch = models.FloatField(default=0.0)
    
    # STT (Speech-to-Text) Preferences
    stt_enabled = models.BooleanField(default=True)
    stt_language = models.CharField(max_length=10, default='en-US')
    stt_continuous = models.BooleanField(default=False)
    
    # Security Settings
    peeping_tom_enabled = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    # Activity Status
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    # Onboarding
    onboarding_completed = models.BooleanField(default=False)
    
    # Encryption Keys (for E2E encryption)
    public_key = models.TextField(blank=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def get_accessibility_settings(self):
        """Return all accessibility settings as a dictionary."""
        return {
            'font_size': self.font_size,
            'high_contrast': self.high_contrast,
            'color_blind_mode': self.color_blind_mode,
            'dark_mode': self.dark_mode,
            'reduce_motion': self.reduce_motion,
            'tts_enabled': self.tts_enabled,
            'tts_voice': self.tts_voice,
            'tts_rate': self.tts_rate,
            'tts_pitch': self.tts_pitch,
            'stt_enabled': self.stt_enabled,
            'stt_language': self.stt_language,
            'stt_continuous': self.stt_continuous,
        }


class UserContact(models.Model):
    """
    User contacts/friends list.
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='contacts'
    )
    contact = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='contacted_by'
    )
    nickname = models.CharField(max_length=100, blank=True)
    is_blocked = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_contacts'
        unique_together = ['user', 'contact']
        verbose_name = 'User Contact'
        verbose_name_plural = 'User Contacts'
    
    def __str__(self):
        return f"{self.user.username} -> {self.contact.username}"


class BlockedUser(models.Model):
    """
    Blocked users list for safety.
    """
    blocker = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='blocking'
    )
    blocked = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='blocked_by'
    )
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blocked_users'
        unique_together = ['blocker', 'blocked']
        verbose_name = 'Blocked User'
        verbose_name_plural = 'Blocked Users'
    
    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"
