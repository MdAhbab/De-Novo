"""
Serializers for Security app.
"""

from rest_framework import serializers
from .models import PrivacyAlert, SessionLog, SecurityEvent, TrustedDevice


class PrivacyAlertSerializer(serializers.ModelSerializer):
    """Serializer for privacy alerts."""
    
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    
    class Meta:
        model = PrivacyAlert
        fields = [
            'id', 'alert_type', 'alert_type_display', 'description',
            'faces_detected', 'confidence_score', 'action_taken',
            'is_dismissed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CreatePrivacyAlertSerializer(serializers.Serializer):
    """Serializer for creating privacy alerts."""
    
    alert_type = serializers.ChoiceField(choices=[
        'peeping_tom', 'multiple_faces', 'suspicious_activity',
        'screenshot', 'screen_record'
    ])
    description = serializers.CharField(required=False, allow_blank=True)
    image_data = serializers.CharField(required=False, allow_blank=True)
    faces_detected = serializers.IntegerField(default=0)
    confidence_score = serializers.FloatField(default=0.0)


class DismissAlertSerializer(serializers.Serializer):
    """Serializer for dismissing alerts."""
    
    alert_id = serializers.IntegerField()
    action_taken = serializers.CharField(required=False, default='dismissed')


class SessionLogSerializer(serializers.ModelSerializer):
    """Serializer for session logs."""
    
    class Meta:
        model = SessionLog
        fields = [
            'id', 'ip_address', 'device_type', 'location',
            'started_at', 'ended_at', 'is_active'
        ]


class SecurityEventSerializer(serializers.ModelSerializer):
    """Serializer for security events."""
    
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = SecurityEvent
        fields = [
            'id', 'event_type', 'event_type_display', 'severity',
            'severity_display', 'description', 'ip_address',
            'metadata', 'created_at'
        ]


class TrustedDeviceSerializer(serializers.ModelSerializer):
    """Serializer for trusted devices."""
    
    class Meta:
        model = TrustedDevice
        fields = [
            'id', 'device_id', 'device_name', 'device_type',
            'browser', 'os', 'is_trusted', 'last_used', 'created_at'
        ]
        read_only_fields = ['id', 'last_used', 'created_at']


class RegisterDeviceSerializer(serializers.Serializer):
    """Serializer for registering a device."""
    
    device_id = serializers.CharField()
    device_name = serializers.CharField()
    device_type = serializers.CharField()
    browser = serializers.CharField(required=False, allow_blank=True)
    os = serializers.CharField(required=False, allow_blank=True)
