"""
Serializers for User app.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserContact, BlockedUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'disability_type'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
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
    """Serializer for user profile."""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'phone_number', 'date_of_birth',
            'disability_type', 'disability_details',
            'is_online', 'last_seen', 'onboarding_completed',
            'public_key'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_online', 'last_seen']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'phone_number',
            'date_of_birth', 'disability_type', 'disability_details'
        ]


class AccessibilitySettingsSerializer(serializers.ModelSerializer):
    """Serializer for accessibility settings."""
    
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
    
    contact_username = serializers.CharField(source='contact.username', read_only=True)
    contact_avatar = serializers.ImageField(source='contact.avatar', read_only=True)
    contact_is_online = serializers.BooleanField(source='contact.is_online', read_only=True)
    contact_disability_type = serializers.CharField(source='contact.disability_type', read_only=True)
    
    class Meta:
        model = UserContact
        fields = [
            'id', 'contact', 'contact_username', 'contact_avatar',
            'contact_is_online', 'contact_disability_type',
            'nickname', 'is_blocked', 'is_favorite', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


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
    """Serializer for user search results."""
    
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'avatar', 'disability_type', 'is_online', 'display_name'
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
