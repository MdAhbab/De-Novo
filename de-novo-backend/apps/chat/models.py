"""
Chat models for De-Novo platform.
Stores conversations, messages, and voice messages.
"""

import uuid
from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    Conversation model - can be direct (1-on-1) or group chat.
    """
    
    CONVERSATION_TYPES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )
    conversation_type = models.CharField(
        max_length=20,
        choices=CONVERSATION_TYPES,
        default='direct'
    )
    name = models.CharField(max_length=100, blank=True)  # For group chats
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Last message preview
    last_message_text = models.TextField(blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_message_sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    
    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
    
    def __str__(self):
        if self.name:
            return self.name
        return f"Conversation {self.id}"
    
    def get_other_participant(self, user):
        """Get the other participant in a direct conversation."""
        if self.conversation_type == 'direct':
            return self.participants.exclude(id=user.id).first()
        return None


class Message(models.Model):
    """
    Message model with support for text, voice, and file messages.
    Includes sentiment analysis results.
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
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    
    # Content
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='text'
    )
    content = models.TextField(blank=True)  # Text content
    
    # For voice messages
    voice_duration = models.FloatField(null=True, blank=True)
    transcription = models.TextField(blank=True)  # STT transcription
    
    # For file/image messages
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    
    # AI Analysis
    sentiment = models.CharField(
        max_length=20,
        choices=SENTIMENT_CHOICES,
        null=True,
        blank=True
    )
    sentiment_score = models.FloatField(null=True, blank=True)
    emotion = models.CharField(max_length=50, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at}"


class MessageReadReceipt(models.Model):
    """
    Track which users have read which messages.
    """
    
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='read_receipts'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='read_messages'
    )
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_read_receipts'
        unique_together = ['message', 'user']
        verbose_name = 'Message Read Receipt'
        verbose_name_plural = 'Message Read Receipts'


class VoiceMessage(models.Model):
    """
    Store voice message audio files separately.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.OneToOneField(
        Message,
        on_delete=models.CASCADE,
        related_name='voice_data'
    )
    audio_file = models.FileField(upload_to='voice_messages/')
    duration = models.FloatField()
    waveform_data = models.JSONField(default=list)  # Visual waveform data
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'voice_messages'
        verbose_name = 'Voice Message'
        verbose_name_plural = 'Voice Messages'
