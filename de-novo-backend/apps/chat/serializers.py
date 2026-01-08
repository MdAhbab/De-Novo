"""
Serializers for Chat app.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Conversation, Message, MessageReadReceipt, VoiceMessage
from apps.users.serializers import UserSearchSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages."""
    
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'sender_avatar',
            'message_type', 'content', 'voice_duration', 'transcription',
            'file', 'file_name', 'sentiment', 'sentiment_score', 'emotion',
            'created_at', 'edited_at', 'is_deleted', 'is_read'
        ]
        read_only_fields = [
            'id', 'sender', 'sentiment', 'sentiment_score', 'emotion',
            'created_at', 'edited_at'
        ]
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return MessageReadReceipt.objects.filter(
                message=obj,
                user=request.user
            ).exists()
        return False


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending messages."""
    
    conversation_id = serializers.UUIDField(required=True)
    message_type = serializers.ChoiceField(
        choices=['text', 'voice', 'image', 'file'],
        default='text'
    )
    content = serializers.CharField(required=False, allow_blank=True)
    file = serializers.FileField(required=False)


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations."""
    
    participants = UserSearchSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'conversation_type', 'name',
            'created_at', 'updated_at', 'last_message', 'unread_count',
            'other_participant'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': str(last_msg.id),
                'content': last_msg.content[:100] if last_msg.content else '',
                'message_type': last_msg.message_type,
                'sender_id': last_msg.sender.id,
                'sender_username': last_msg.sender.username,
                'created_at': last_msg.created_at.isoformat(),
                'sentiment': last_msg.sentiment
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.exclude(
                read_receipts__user=request.user
            ).exclude(
                sender=request.user
            ).count()
        return 0
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user and obj.conversation_type == 'direct':
            other = obj.get_other_participant(request.user)
            if other:
                return {
                    'id': other.id,
                    'username': other.username,
                    'avatar': other.avatar.url if other.avatar else None,
                    'is_online': other.is_online,
                    'disability_type': other.disability_type
                }
        return None


class CreateConversationSerializer(serializers.Serializer):
    """Serializer for creating a conversation."""
    
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    conversation_type = serializers.ChoiceField(
        choices=['direct', 'group'],
        default='direct'
    )
    name = serializers.CharField(required=False, allow_blank=True)


class VoiceMessageSerializer(serializers.ModelSerializer):
    """Serializer for voice messages."""
    
    class Meta:
        model = VoiceMessage
        fields = ['id', 'message', 'audio_file', 'duration', 'waveform_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoiceUploadSerializer(serializers.Serializer):
    """Serializer for uploading voice messages."""
    
    conversation_id = serializers.UUIDField(required=True)
    audio_file = serializers.FileField(required=True)
    duration = serializers.FloatField(required=True)
