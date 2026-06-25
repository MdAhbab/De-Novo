"""
Views for User app.
Fixes applied:
  - API-01: Logout reads 'refresh_token' field (was 'refresh')
  - API-02: Profile update uses /profile/update/ (routed correctly)
  - API-03: Add contact uses /contacts/add/ with {username}
  - API-04: Remove contact uses /contacts/<id>/remove/
  - API-05: Block/unblock at /contacts/<id>/block/ and /unblock/
  - SEC-06: Rate throttling on login/register
  - SEC-07: UserSearch excludes email, no disability_type in results
  - SEC-08: print() replaced with logging
  - BE-08: UserProfileView uses PublicUserProfileSerializer for others
"""

import logging
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.db.models import Q

from .models import User, UserContact, BlockedUser
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PublicUserProfileSerializer,
    UserUpdateSerializer,
    AccessibilitySettingsSerializer,
    UserContactSerializer,
    AddContactSerializer,
    BlockedUserSerializer,
    UserSearchSerializer,
    PublicKeySerializer,
)

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    scope = 'register'


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    throttle_classes = [RegisterRateThrottle]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""
    
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        user.is_online = True
        user.save(update_fields=['is_online'])
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        })


class LogoutView(APIView):
    """User logout endpoint.
    
    API-01: Reads 'refresh_token' field (frontend was sending 'refresh').
    Fix: accept both field names for compatibility during transition.
    """
    
    def post(self, request):
        try:
            # API-01: Accept 'refresh_token' (backend canonical) and 'refresh' (frontend compat)
            refresh_token = request.data.get('refresh_token') or request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            request.user.is_online = False
            request.user.save(update_fields=['is_online'])
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            })
        except Exception as e:
            logger.warning(f"Logout error for user {request.user.id}: {type(e).__name__}")
            return Response({
                'success': False,
                'error': {
                    'message': 'Logout failed'
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    """Get current user's profile."""
    
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


class UserProfileView(generics.RetrieveAPIView):
    """Get another user's profile by ID.
    
    BE-08: Returns PublicUserProfileSerializer (no PII/health data) for other users.
    """
    
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
    
    def get_serializer_class(self):
        # Return full profile for self, public profile for others
        user_id = self.kwargs.get('user_id')
        if self.request.user.id == user_id:
            return UserProfileSerializer
        return PublicUserProfileSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


class UpdateProfileView(generics.UpdateAPIView):
    """Update current user's profile (API-02: path /profile/update/)."""
    
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'data': UserProfileSerializer(instance).data
        })


class AvatarUploadView(APIView):
    """Upload user avatar."""
    
    def post(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')
        
        if not avatar:
            return Response({
                'success': False,
                'error': {
                    'message': 'No avatar file provided'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.avatar = avatar
        user.save(update_fields=['avatar'])
        
        return Response({
            'success': True,
            'message': 'Avatar uploaded successfully',
            'data': {
                'avatar_url': user.avatar.url if user.avatar else None
            }
        })


class AccessibilitySettingsView(generics.RetrieveUpdateAPIView):
    """Get/Update accessibility settings (API-06)."""
    
    serializer_class = AccessibilitySettingsSerializer
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Accessibility settings updated successfully',
            'data': serializer.data
        })


class ContactListView(generics.ListAPIView):
    """List user's contacts."""
    
    serializer_class = UserContactSerializer
    
    def get_queryset(self):
        return UserContact.objects.filter(
            user=self.request.user,
            is_blocked=False
        ).select_related('contact')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class AddContactView(APIView):
    """Add a new contact (API-03: POST /contacts/add/ with {username})."""
    
    def post(self, request):
        serializer = AddContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        nickname = serializer.validated_data.get('nickname', '')
        
        try:
            contact_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'User not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        if contact_user == request.user:
            return Response({
                'success': False,
                'error': {
                    'message': "You cannot add yourself as a contact"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        contact, created = UserContact.objects.get_or_create(
            user=request.user,
            contact=contact_user,
            defaults={'nickname': nickname}
        )
        
        if not created:
            return Response({
                'success': False,
                'error': {
                    'message': "Contact already exists"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Contact added successfully',
            'data': UserContactSerializer(contact).data
        }, status=status.HTTP_201_CREATED)


class RemoveContactView(APIView):
    """Remove a contact (API-04: DELETE /contacts/<id>/remove/)."""
    
    def delete(self, request, contact_id):
        try:
            contact = UserContact.objects.get(
                user=request.user,
                contact_id=contact_id
            )
            contact.delete()
            
            return Response({
                'success': True,
                'message': 'Contact removed successfully'
            })
        except UserContact.DoesNotExist:
            return Response({
                'success': False,
                'error': {
                    'message': 'Contact not found'
                }
            }, status=status.HTTP_404_NOT_FOUND)


class BlockUserView(APIView):
    """Block a user (API-05: POST /contacts/<id>/block/)."""
    
    def post(self, request, contact_id):
        try:
            blocked_user = User.objects.get(id=contact_id)
            
            if blocked_user == request.user:
                return Response({
                    'success': False,
                    'error': {
                        'message': "You cannot block yourself"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            reason = request.data.get('reason', '')
            
            BlockedUser.objects.get_or_create(
                blocker=request.user,
                blocked=blocked_user,
                defaults={'reason': reason}
            )
            
            # Also update contact if exists
            UserContact.objects.filter(
                user=request.user,
                contact=blocked_user
            ).update(is_blocked=True)
            
            return Response({
                'success': True,
                'message': 'User blocked successfully'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': {
                    'message': 'User not found'
                }
            }, status=status.HTTP_404_NOT_FOUND)


class UnblockUserView(APIView):
    """Unblock a user (API-05: POST /contacts/<id>/unblock/)."""
    
    def post(self, request, contact_id):
        try:
            BlockedUser.objects.filter(
                blocker=request.user,
                blocked_id=contact_id
            ).delete()
            
            UserContact.objects.filter(
                user=request.user,
                contact_id=contact_id
            ).update(is_blocked=False)
            
            return Response({
                'success': True,
                'message': 'User unblocked successfully'
            })
        except Exception as e:
            logger.warning(f"Unblock error: {type(e).__name__}")
            return Response({
                'success': False,
                'error': {
                    'message': 'Failed to unblock user'
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class UserSearchView(generics.ListAPIView):
    """Search for users.
    
    SEC-07: Search by username/name only (no email substring enumeration).
    disability_type is NOT returned in results.
    """
    
    serializer_class = UserSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        # Require at least 2 chars to prevent broad enumeration
        if len(query) < 2:
            return User.objects.none()
        
        # SEC-07: Only search by username/name (NOT email) to prevent enumeration
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=self.request.user.id)[:20]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SetOnlineStatusView(APIView):
    """Set user's online status."""
    
    def post(self, request):
        is_online = request.data.get('is_online', True)
        request.user.is_online = is_online
        request.user.save(update_fields=['is_online', 'last_seen'])
        
        return Response({
            'success': True,
            'message': f"Status set to {'online' if is_online else 'offline'}"
        })


class UpdatePublicKeyView(APIView):
    """Update user's public key for E2E encryption."""
    
    def post(self, request):
        serializer = PublicKeySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        request.user.public_key = serializer.validated_data['public_key']
        request.user.save(update_fields=['public_key'])
        
        return Response({
            'success': True,
            'message': 'Public key updated successfully'
        })


class CompleteOnboardingView(APIView):
    """Mark onboarding as completed."""
    
    def post(self, request):
        request.user.onboarding_completed = True
        request.user.save(update_fields=['onboarding_completed'])
        
        return Response({
            'success': True,
            'message': 'Onboarding completed'
        })
