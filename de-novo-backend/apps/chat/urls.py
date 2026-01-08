"""
URL routes for Chat app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('conversations/create/', views.CreateConversationView.as_view(), name='create_conversation'),
    path('conversations/<uuid:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<uuid:conversation_id>/messages/', views.MessageListView.as_view(), name='messages'),
    
    # Messages
    path('messages/send/', views.SendMessageView.as_view(), name='send_message'),
    path('messages/<uuid:message_id>/read/', views.MarkAsReadView.as_view(), name='mark_read'),
    path('messages/<uuid:message_id>/delete/', views.DeleteMessageView.as_view(), name='delete_message'),
    
    # Voice Messages
    path('voice/upload/', views.VoiceMessageUploadView.as_view(), name='voice_upload'),
    path('voice/<uuid:message_id>/transcribe/', views.TranscribeVoiceView.as_view(), name='transcribe_voice'),
]
