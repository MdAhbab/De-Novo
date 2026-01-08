from django.contrib import admin
from .models import Conversation, Message, MessageReadReceipt, VoiceMessage


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation_type', 'name', 'created_at', 'updated_at']
    list_filter = ['conversation_type', 'created_at']
    search_fields = ['name', 'id']
    filter_horizontal = ['participants']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'message_type', 'sentiment', 'created_at', 'is_deleted']
    list_filter = ['message_type', 'sentiment', 'is_deleted', 'created_at']
    search_fields = ['content', 'sender__username']


@admin.register(MessageReadReceipt)
class MessageReadReceiptAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'read_at']
    list_filter = ['read_at']


@admin.register(VoiceMessage)
class VoiceMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'message', 'duration', 'created_at']
    list_filter = ['created_at']
