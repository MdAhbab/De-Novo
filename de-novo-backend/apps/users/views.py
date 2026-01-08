"""
Views for User app.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.db.models import Q

from .models import User, UserContact, BlockedUser
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    AccessibilitySettingsSerializer,
    UserContactSerializer,
    AddContactSerializer,
    BlockedUserSerializer,
    UserSearchSerializer,
    PublicKeySerializer,
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
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
    """User logout endpoint."""
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
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
            return Response({
                'success': False,
                'error': {
                    'message': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    """Get current user's profile."""
    
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveAPIView):
    """Get another user's profile by ID."""
    
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


class UpdateProfileView(generics.UpdateAPIView):
    """Update current user's profile."""
    
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
    """Get/Update accessibility settings."""
    
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
    """Add a new contact."""
    
    def post(self, request):
        serializer = AddContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        nickname = serializer.validated_data.get('nickname', '')
        
        contact_user = User.objects.get(username=username)
        
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
    """Remove a contact."""
    
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
    """Block a user."""
    
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
            
            blocked, created = BlockedUser.objects.get_or_create(
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
    """Unblock a user."""
    
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
            return Response({
                'success': False,
                'error': {
                    'message': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class UserSearchView(generics.ListAPIView):
    """Search for users."""
    
    serializer_class = UserSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if len(query) < 2:
            return User.objects.none()
        
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
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
