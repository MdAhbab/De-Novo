from django.contrib import admin
from .models import PrivacyAlert, SessionLog, SecurityEvent, TrustedDevice


@admin.register(PrivacyAlert)
class PrivacyAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert_type', 'faces_detected', 'is_dismissed', 'created_at']
    list_filter = ['alert_type', 'is_dismissed', 'created_at']
    search_fields = ['user__username', 'description']


@admin.register(SessionLog)
class SessionLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'device_type', 'is_active', 'started_at']
    list_filter = ['is_active', 'device_type', 'started_at']
    search_fields = ['user__username', 'ip_address']


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'severity', 'ip_address', 'created_at']
    list_filter = ['event_type', 'severity', 'created_at']
    search_fields = ['user__username', 'description']


@admin.register(TrustedDevice)
class TrustedDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'device_type', 'is_trusted', 'last_used']
    list_filter = ['is_trusted', 'device_type']
    search_fields = ['user__username', 'device_name']
