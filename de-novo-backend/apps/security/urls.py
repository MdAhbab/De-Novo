"""
URL routes for Security app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Privacy Alerts
    path('alerts/', views.PrivacyAlertsView.as_view(), name='privacy_alerts'),
    path('alerts/dismiss/', views.DismissAlertView.as_view(), name='dismiss_alert'),
    
    # Sessions
    path('sessions/', views.ActiveSessionsView.as_view(), name='active_sessions'),
    path('sessions/<int:session_id>/terminate/', views.TerminateSessionView.as_view(), name='terminate_session'),
    path('sessions/terminate-all/', views.TerminateAllSessionsView.as_view(), name='terminate_all_sessions'),
    
    # Events
    path('events/', views.SecurityEventsView.as_view(), name='security_events'),
    
    # Trusted Devices
    path('devices/', views.TrustedDevicesView.as_view(), name='trusted_devices'),
    path('devices/<int:device_id>/', views.RemoveTrustedDeviceView.as_view(), name='remove_device'),
    
    # Settings & Summary
    path('settings/', views.SecuritySettingsView.as_view(), name='security_settings'),
    path('summary/', views.SecuritySummaryView.as_view(), name='security_summary'),
]
