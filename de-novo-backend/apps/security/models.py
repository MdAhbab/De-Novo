"""
Security models for De-Novo platform.
Tracks privacy alerts, session logs, and security events.
"""

from django.db import models
from django.conf import settings


class PrivacyAlert(models.Model):
    """
    Track privacy alerts (e.g., someone looking at screen).
    """
    
    ALERT_TYPE_CHOICES = [
        ('peeping_tom', 'Someone Looking at Screen'),
        ('multiple_faces', 'Multiple Faces Detected'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('screenshot', 'Screenshot Attempted'),
        ('screen_record', 'Screen Recording Detected'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='privacy_alerts'
    )
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    description = models.TextField(blank=True)
    image_data = models.TextField(
        blank=True,
        help_text='Base64 encoded image if available'
    )
    faces_detected = models.IntegerField(default=0)
    confidence_score = models.FloatField(default=0.0)
    action_taken = models.CharField(
        max_length=100,
        blank=True,
        help_text='Action user took (dismiss, secure, etc.)'
    )
    is_dismissed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'privacy_alerts'
        ordering = ['-created_at']
        verbose_name = 'Privacy Alert'
        verbose_name_plural = 'Privacy Alerts'
    
    def __str__(self):
        return f"{self.user.username} - {self.alert_type} at {self.created_at}"


class SessionLog(models.Model):
    """
    Track user sessions for security monitoring.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_logs'
    )
    session_key = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'session_logs'
        ordering = ['-started_at']
        verbose_name = 'Session Log'
        verbose_name_plural = 'Session Logs'
    
    def __str__(self):
        return f"{self.user.username} - {self.ip_address} ({self.device_type})"


class SecurityEvent(models.Model):
    """
    Track security events.
    """
    
    EVENT_TYPE_CHOICES = [
        ('login_success', 'Successful Login'),
        ('login_failed', 'Failed Login Attempt'),
        ('logout', 'Logout'),
        ('password_change', 'Password Changed'),
        ('password_reset', 'Password Reset'),
        ('privacy_alert', 'Privacy Alert'),
        ('encryption_key_gen', 'Encryption Key Generated'),
        ('suspicious_ip', 'Suspicious IP Detected'),
        ('account_locked', 'Account Locked'),
    ]
    
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='security_events'
    )
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
        default='info'
    )
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'security_events'
        ordering = ['-created_at']
        verbose_name = 'Security Event'
        verbose_name_plural = 'Security Events'
    
    def __str__(self):
        return f"{self.user.username} - {self.event_type} ({self.severity})"


class TrustedDevice(models.Model):
    """
    Track trusted devices for user.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trusted_devices'
    )
    device_id = models.CharField(max_length=255)
    device_name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    is_trusted = models.BooleanField(default=True)
    last_used = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'trusted_devices'
        ordering = ['-last_used']
        unique_together = ['user', 'device_id']
        verbose_name = 'Trusted Device'
        verbose_name_plural = 'Trusted Devices'
    
    def __str__(self):
        return f"{self.user.username} - {self.device_name}"
