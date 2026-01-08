"""
Views for Chat app.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q

from .models import Conversation, Message, MessageReadReceipt, VoiceMessage
from .serializers import (
    ConversationSerializer,
    CreateConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    VoiceUploadSerializer,
)
from apps.users.models import User, BlockedUser


class ConversationListView(generics.ListAPIView):
    """List user's conversations."""
    
    serializer_class = ConversationSerializer
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').order_by('-updated_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class CreateConversationView(APIView):
    """Create a new conversation."""
    
    def post(self, request):
        serializer = CreateConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        participant_ids = serializer.validated_data['participant_ids']
        conversation_type = serializer.validated_data['conversation_type']
        name = serializer.validated_data.get('name', '')
        
        # Check if users exist
        participants = User.objects.filter(id__in=participant_ids)
        if participants.count() != len(participant_ids):
            return Response({
                'success': False,
                'error': {'message': 'One or more users not found'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for blocked users
        blocked = BlockedUser.objects.filter(
            Q(blocker=request.user, blocked__in=participants) |
            Q(blocked=request.user, blocker__in=participants)
        ).exists()
        
        if blocked:
            return Response({
                'success': False,
                'error': {'message': 'Cannot create conversation with blocked users'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # For direct conversations, check if one already exists
        if conversation_type == 'direct' and len(participant_ids) == 1:
            existing = Conversation.objects.filter(
                conversation_type='direct',
                participants=request.user
            ).filter(
                participants=participant_ids[0]
            ).first()
            
            if existing:
                return Response({
                    'success': True,
                    'data': ConversationSerializer(existing, context={'request': request}).data,
                    'message': 'Existing conversation found'
                })
        
        # Create new conversation
        conversation = Conversation.objects.create(
            conversation_type=conversation_type,
            name=name,
            created_by=request.user
        )
        conversation.participants.add(request.user, *participants)
        
        return Response({
            'success': True,
            'data': ConversationSerializer(conversation, context={'request': request}).data,
            'message': 'Conversation created successfully'
        }, status=status.HTTP_201_CREATED)


class ConversationDetailView(generics.RetrieveAPIView):
    """Get conversation details."""
    
    serializer_class = ConversationSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'conversation_id'
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


class MessageListView(generics.ListAPIView):
    """List messages in a conversation."""
    
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.request.user,
            is_deleted=False
        ).select_related('sender').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SendMessageView(APIView):
    """Send a message."""
    
    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        conversation_id = serializer.validated_data['conversation_id']
        message_type = serializer.validated_data['message_type']
        content = serializer.validated_data.get('content', '')
        
        # Verify conversation access
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Conversation not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message_type=message_type,
            content=content
        )
        
        # Update conversation
        conversation.last_message_text = content[:100] if content else ''
        conversation.last_message_at = timezone.now()
        conversation.last_message_sender = request.user
        conversation.save()
        
        # Analyze sentiment (async in production)
        try:
            from apps.ai_services.sentiment_analyzer import sentiment_analyzer
            sentiment_result = sentiment_analyzer.analyze(content)
            message.sentiment = sentiment_result.get('sentiment')
            message.sentiment_score = sentiment_result.get('score')
            message.emotion = sentiment_result.get('emotion', '')
            message.save()
        except Exception as e:
            print(f"Sentiment analysis failed: {e}")
        
        return Response({
            'success': True,
            'data': MessageSerializer(message, context={'request': request}).data,
            'message': 'Message sent successfully'
        }, status=status.HTTP_201_CREATED)


class MarkAsReadView(APIView):
    """Mark a message as read."""
    
    def post(self, request, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                conversation__participants=request.user
            )
            
            MessageReadReceipt.objects.get_or_create(
                message=message,
                user=request.user
            )
            
            return Response({
                'success': True,
                'message': 'Message marked as read'
            })
        except Message.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Message not found'}
            }, status=status.HTTP_404_NOT_FOUND)


class MarkConversationAsReadView(APIView):
    """Mark all messages in a conversation as read."""
    
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
            
            # Get all unread messages in this conversation not sent by current user
            unread_messages = Message.objects.filter(
                conversation=conversation
            ).exclude(
                sender=request.user
            ).exclude(
                read_receipts__user=request.user
            )
            
            # Create read receipts for all unread messages
            receipts = [
                MessageReadReceipt(message=msg, user=request.user)
                for msg in unread_messages
            ]
            MessageReadReceipt.objects.bulk_create(receipts, ignore_conflicts=True)
            
            return Response({
                'success': True,
                'message': f'{len(receipts)} messages marked as read'
            })
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Conversation not found'}
            }, status=status.HTTP_404_NOT_FOUND)


class DeleteMessageView(APIView):
    """Delete a message (soft delete)."""
    
    def delete(self, request, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                sender=request.user
            )
            
            message.is_deleted = True
            message.save()
            
            return Response({
                'success': True,
                'message': 'Message deleted successfully'
            })
        except Message.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Message not found or you cannot delete it'}
            }, status=status.HTTP_404_NOT_FOUND)


class VoiceMessageUploadView(APIView):
    """Upload a voice message."""
    
    def post(self, request):
        serializer = VoiceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        conversation_id = serializer.validated_data['conversation_id']
        audio_file = serializer.validated_data['audio_file']
        duration = serializer.validated_data['duration']
        
        # Verify conversation access
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Conversation not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message_type='voice',
            voice_duration=duration
        )
        
        # Create voice message record
        voice_msg = VoiceMessage.objects.create(
            message=message,
            audio_file=audio_file,
            duration=duration
        )
        
        # Update conversation
        conversation.last_message_text = '🎤 Voice message'
        conversation.last_message_at = timezone.now()
        conversation.last_message_sender = request.user
        conversation.save()
        
        return Response({
            'success': True,
            'data': MessageSerializer(message, context={'request': request}).data,
            'message': 'Voice message uploaded successfully'
        }, status=status.HTTP_201_CREATED)


class TranscribeVoiceView(APIView):
    """Transcribe a voice message using Speech-to-Text."""
    
    def post(self, request, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                message_type='voice',
                conversation__participants=request.user
            )
            
            if message.transcription:
                return Response({
                    'success': True,
                    'data': {'transcription': message.transcription},
                    'message': 'Transcription already exists'
                })
            
            # Get voice file
            try:
                voice_data = message.voice_data
                audio_file = voice_data.audio_file
            except VoiceMessage.DoesNotExist:
                return Response({
                    'success': False,
                    'error': {'message': 'Voice data not found'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Transcribe using STT service
            try:
                from apps.ai_services.speech_to_text import stt_service
                
                audio_content = audio_file.read()
                result = stt_service.transcribe(audio_content)
                transcription = result.get('full_transcript', '')
                
                message.transcription = transcription
                message.save()
                
                return Response({
                    'success': True,
                    'data': {'transcription': transcription},
                    'message': 'Transcription completed'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': {'message': f'Transcription failed: {str(e)}'}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Message.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Message not found'}
            }, status=status.HTTP_404_NOT_FOUND)
