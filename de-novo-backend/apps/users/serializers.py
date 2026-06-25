"""
Serializers for User app.
"""

import logging
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserContact, BlockedUser

logger = logging.getLogger(__name__)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration.
    
    Accepts either display_name (split into first/last) or first_name/last_name.
    API-21: Backend now accepts display_name and stores it properly.
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    # Accept display_name from frontend and split into first/last
    display_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'display_name', 'disability_type'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Handle display_name → first_name / last_name split (API-21)
        display_name = attrs.pop('display_name', '')
        if display_name and not (attrs.get('first_name') or attrs.get('last_name')):
            parts = display_name.strip().split(' ', 1)
            attrs['first_name'] = parts[0]
            attrs['last_name'] = parts[1] if len(parts) > 1 else ''
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid credentials. Please check your email and password."
            )
        
        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError(
                "Invalid credentials. Please check your email and password."
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "This account has been deactivated."
            )
        
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile.
    
    FE-01: Exposes display_name so frontend can rely on one canonical field.
    """
    
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'display_name',
            'avatar', 'bio', 'phone_number', 'date_of_birth',
            'disability_type', 'disability_details',
            'is_online', 'last_seen', 'onboarding_completed',
            'public_key'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_online', 'last_seen']
    
    def get_display_name(self, obj):
        """Return full name or fall back to username."""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        return obj.username


class PublicUserProfileSerializer(serializers.ModelSerializer):
    """Reduced serializer for other users' profiles (BE-08).
    
    Does NOT expose PII (phone, DOB) or sensitive health data (disability_type)
    to non-contacts.
    """
    
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'display_name', 'avatar', 'bio',
            'is_online', 'last_seen', 'public_key'
        ]
    
    def get_display_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        return obj.username


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    display_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'display_name', 'bio', 'phone_number',
            'date_of_birth', 'disability_type', 'disability_details'
        ]
    
    def validate(self, attrs):
        # Handle display_name → first/last split
        display_name = attrs.pop('display_name', '')
        if display_name and not (attrs.get('first_name') or attrs.get('last_name')):
            parts = display_name.strip().split(' ', 1)
            attrs['first_name'] = parts[0]
            attrs['last_name'] = parts[1] if len(parts) > 1 else ''
        return attrs


class AccessibilitySettingsSerializer(serializers.ModelSerializer):
    """Serializer for accessibility settings (API-06)."""
    
    class Meta:
        model = User
        fields = [
            'font_size', 'high_contrast', 'color_blind_mode',
            'dark_mode', 'reduce_motion',
            'tts_enabled', 'tts_voice', 'tts_rate', 'tts_pitch',
            'stt_enabled', 'stt_language', 'stt_continuous',
            'peeping_tom_enabled'
        ]


class UserContactSerializer(serializers.ModelSerializer):
    """Serializer for user contacts."""
    
    contact_id = serializers.IntegerField(source='contact.id', read_only=True)
    contact_username = serializers.CharField(source='contact.username', read_only=True)
    contact_display_name = serializers.SerializerMethodField()
    contact_avatar = serializers.ImageField(source='contact.avatar', read_only=True)
    contact_is_online = serializers.BooleanField(source='contact.is_online', read_only=True)
    # SEC-07: Do NOT expose disability_type in contacts list (sensitive health data)
    
    class Meta:
        model = UserContact
        fields = [
            'id', 'contact', 'contact_id', 'contact_username', 'contact_display_name',
            'contact_avatar', 'contact_is_online',
            'nickname', 'is_blocked', 'is_favorite', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_contact_display_name(self, obj):
        c = obj.contact
        if c.first_name and c.last_name:
            return f"{c.first_name} {c.last_name}"
        elif c.first_name:
            return c.first_name
        return c.username


class AddContactSerializer(serializers.Serializer):
    """Serializer for adding a contact."""
    
    username = serializers.CharField(required=True)
    nickname = serializers.CharField(required=False, allow_blank=True)
    
    def validate_username(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        return value


class BlockedUserSerializer(serializers.ModelSerializer):
    """Serializer for blocked users."""
    
    blocked_username = serializers.CharField(source='blocked.username', read_only=True)
    
    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked', 'blocked_username', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for user search results.
    
    SEC-07: Search by username/name only (removed email); no disability_type exposed.
    """
    
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'avatar', 'is_online', 'display_name'
            # NOTE: disability_type intentionally excluded (SEC-07)
        ]
    
    def get_display_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        return obj.username


class PublicKeySerializer(serializers.Serializer):
    """Serializer for updating public key."""
    
    public_key = serializers.CharField(required=True)
