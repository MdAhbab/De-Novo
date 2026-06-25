"""
JWT Authentication Middleware for Django Channels WebSockets.

The standard Channels AuthMiddlewareStack uses session/cookie auth which
doesn't work with JWT tokens stored in localStorage. This middleware reads
the JWT access token from the WebSocket query string (?token=...) or from
the Sec-WebSocket-Protocol header and authenticates the user.
"""

import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_key):
    """Validate a JWT access token and return the associated user."""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
        from django.contrib.auth import get_user_model

        User = get_user_model()
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        logger.debug(f"JWT WebSocket auth failed: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Channels middleware that authenticates WebSocket connections using JWT.
    
    The client must pass the access token as a query parameter:
        ws://localhost:8000/ws/chat/123/?token=<access_token>
    """

    async def __call__(self, scope, receive, send):
        # Extract token from query string
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])

        if token_list:
            token = token_list[0]
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Helper to wrap with JWTAuthMiddleware (mirrors AuthMiddlewareStack)."""
    return JWTAuthMiddleware(inner)
