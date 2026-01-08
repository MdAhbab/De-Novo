"""
WebSocket consumers for real-time chat.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat functionality.
    Handles messages, typing indicators, and read receipts.
    """
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Verify user has access to this conversation
        has_access = await self.verify_conversation_access()
        if not has_access:
            await self.close()
            return
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Mark user as online
        await self.update_user_status(True)
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user.id,
                'username': self.user.username
            }
        )
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'room_group_name'):
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            )
            
            # Leave conversation group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Mark user as offline
        if hasattr(self, 'user') and self.user.is_authenticated:
            await self.update_user_status(False)
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read':
                await self.handle_read_receipt(data)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_message(self, data):
        """Handle new message."""
        content = data.get('content', '')
        message_type = data.get('message_type', 'text')
        
        if not content and message_type == 'text':
            return
        
        # Save message to database
        message_data = await self.save_message(content, message_type)
        
        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_data
            }
        )
    
    async def handle_typing(self, data):
        """Handle typing indicator."""
        is_typing = data.get('is_typing', True)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        """Handle read receipt."""
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_read(message_id)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'message_id': message_id,
                    'reader_id': self.user.id,
                    'reader_username': self.user.username
                }
            )
    
    # Event handlers (called when receiving from channel layer)
    
    async def chat_message(self, event):
        """Send message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket."""
        # Don't send to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))
    
    async def read_receipt(self, event):
        """Send read receipt to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'read',
            'message_id': event['message_id'],
            'reader_id': event['reader_id'],
            'reader_username': event['reader_username']
        }))
    
    async def user_joined(self, event):
        """Send user joined notification."""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_joined',
                'user_id': event['user_id'],
                'username': event['username']
            }))
    
    async def user_left(self, event):
        """Send user left notification."""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_left',
                'user_id': event['user_id'],
                'username': event['username']
            }))
    
    # Database operations
    
    @database_sync_to_async
    def verify_conversation_access(self):
        """Verify user has access to the conversation."""
        from .models import Conversation
        return Conversation.objects.filter(
            id=self.conversation_id,
            participants=self.user
        ).exists()
    
    @database_sync_to_async
    def save_message(self, content, message_type):
        """Save message to database and return serialized data."""
        from .models import Conversation, Message
        
        conversation = Conversation.objects.get(id=self.conversation_id)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            message_type=message_type,
            content=content
        )
        
        # Update conversation
        conversation.last_message_text = content[:100] if content else ''
        conversation.last_message_at = timezone.now()
        conversation.last_message_sender = self.user
        conversation.save()
        
        # Analyze sentiment
        sentiment_data = {}
        try:
            from apps.ai_services.sentiment_analyzer import sentiment_analyzer
            result = sentiment_analyzer.analyze(content)
            message.sentiment = result.get('sentiment')
            message.sentiment_score = result.get('score')
            message.emotion = result.get('emotion', '')
            message.save()
            sentiment_data = {
                'sentiment': message.sentiment,
                'sentiment_score': message.sentiment_score,
                'emotion': message.emotion
            }
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
        
        return {
            'id': str(message.id),
            'sender_id': self.user.id,
            'sender_username': self.user.username,
            'sender_avatar': self.user.avatar.url if self.user.avatar else None,
            'content': content,
            'message_type': message_type,
            'created_at': message.created_at.isoformat(),
            **sentiment_data
        }
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark a message as read."""
        from .models import Message, MessageReadReceipt
        
        try:
            message = Message.objects.get(id=message_id)
            MessageReadReceipt.objects.get_or_create(
                message=message,
                user=self.user
            )
        except Message.DoesNotExist:
            pass
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        """Update user's online status."""
        self.user.is_online = is_online
        self.user.save(update_fields=['is_online', 'last_seen'])
