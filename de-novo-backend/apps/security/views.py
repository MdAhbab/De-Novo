"""
Views for Security app.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import PrivacyAlert, SessionLog, SecurityEvent, TrustedDevice
from .serializers import (
    PrivacyAlertSerializer,
    CreatePrivacyAlertSerializer,
    DismissAlertSerializer,
    SessionLogSerializer,
    SecurityEventSerializer,
    TrustedDeviceSerializer,
    RegisterDeviceSerializer,
)


class PrivacyAlertsView(APIView):
    """List and create privacy alerts."""
    
    def get(self, request):
        # Get recent alerts (last 24 hours by default)
        hours = int(request.query_params.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        
        alerts = PrivacyAlert.objects.filter(
            user=request.user,
            created_at__gte=since
        )
        
        include_dismissed = request.query_params.get('include_dismissed', 'false')
        if include_dismissed.lower() != 'true':
            alerts = alerts.filter(is_dismissed=False)
        
        serializer = PrivacyAlertSerializer(alerts, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': alerts.count()
        })
    
    def post(self, request):
        serializer = CreatePrivacyAlertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        alert = PrivacyAlert.objects.create(
            user=request.user,
            **serializer.validated_data
        )
        
        # Log security event
        SecurityEvent.objects.create(
            user=request.user,
            event_type='privacy_alert',
            severity='warning',
            description=f"Privacy alert: {alert.alert_type}",
            metadata={'alert_id': alert.id}
        )
        
        return Response({
            'success': True,
            'data': PrivacyAlertSerializer(alert).data,
            'message': 'Privacy alert recorded'
        }, status=status.HTTP_201_CREATED)


class DismissAlertView(APIView):
    """Dismiss a privacy alert."""
    
    def post(self, request):
        serializer = DismissAlertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            alert = PrivacyAlert.objects.get(
                id=serializer.validated_data['alert_id'],
                user=request.user
            )
        except PrivacyAlert.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Alert not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        alert.is_dismissed = True
        alert.action_taken = serializer.validated_data.get('action_taken', 'dismissed')
        alert.save()
        
        return Response({
            'success': True,
            'message': 'Alert dismissed'
        })


class ActiveSessionsView(generics.ListAPIView):
    """List user's active sessions."""
    
    serializer_class = SessionLogSerializer
    
    def get_queryset(self):
        return SessionLog.objects.filter(
            user=self.request.user,
            is_active=True
        )
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })


class TerminateSessionView(APIView):
    """Terminate a specific session."""
    
    def post(self, request, session_id):
        try:
            session = SessionLog.objects.get(
                id=session_id,
                user=request.user,
                is_active=True
            )
        except SessionLog.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Session not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        
        # Log security event
        SecurityEvent.objects.create(
            user=request.user,
            event_type='logout',
            severity='info',
            description='Session terminated by user',
            metadata={'session_id': session_id}
        )
        
        return Response({
            'success': True,
            'message': 'Session terminated'
        })


class TerminateAllSessionsView(APIView):
    """Terminate all other sessions."""
    
    def post(self, request):
        # Keep current session if provided
        current_session = request.data.get('current_session_key')
        
        sessions = SessionLog.objects.filter(
            user=request.user,
            is_active=True
        )
        
        if current_session:
            sessions = sessions.exclude(session_key=current_session)
        
        count = sessions.count()
        sessions.update(is_active=False, ended_at=timezone.now())
        
        # Log security event
        SecurityEvent.objects.create(
            user=request.user,
            event_type='logout',
            severity='warning',
            description=f'Terminated {count} sessions',
            metadata={'count': count}
        )
        
        return Response({
            'success': True,
            'message': f'Terminated {count} session(s)'
        })


class SecurityEventsView(generics.ListAPIView):
    """List security events."""
    
    serializer_class = SecurityEventSerializer
    
    def get_queryset(self):
        days = int(self.request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)
        
        queryset = SecurityEvent.objects.filter(
            user=self.request.user,
            created_at__gte=since
        )
        
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        event_type = self.request.query_params.get('type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Count by severity
        severity_counts = {
            'info': queryset.filter(severity='info').count(),
            'warning': queryset.filter(severity='warning').count(),
            'critical': queryset.filter(severity='critical').count(),
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'severity_counts': severity_counts
        })


class TrustedDevicesView(APIView):
    """List and register trusted devices."""
    
    def get(self, request):
        devices = TrustedDevice.objects.filter(
            user=request.user,
            is_trusted=True
        )
        
        serializer = TrustedDeviceSerializer(devices, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        serializer = RegisterDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        device, created = TrustedDevice.objects.update_or_create(
            user=request.user,
            device_id=serializer.validated_data['device_id'],
            defaults={
                'device_name': serializer.validated_data['device_name'],
                'device_type': serializer.validated_data['device_type'],
                'browser': serializer.validated_data.get('browser', ''),
                'os': serializer.validated_data.get('os', ''),
                'is_trusted': True,
            }
        )
        
        return Response({
            'success': True,
            'data': TrustedDeviceSerializer(device).data,
            'message': 'Device registered' if created else 'Device updated'
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class RemoveTrustedDeviceView(APIView):
    """Remove a trusted device."""
    
    def delete(self, request, device_id):
        try:
            device = TrustedDevice.objects.get(
                id=device_id,
                user=request.user
            )
        except TrustedDevice.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Device not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        device.delete()
        
        return Response({
            'success': True,
            'message': 'Device removed from trusted list'
        })


class SecuritySettingsView(APIView):
    """Get and update security settings."""
    
    def get(self, request):
        user = request.user
        
        return Response({
            'success': True,
            'data': {
                'peeping_tom_detection': user.peeping_tom_detection,
                'encryption_enabled': user.encryption_enabled,
                'public_key': user.public_key[:50] + '...' if user.public_key else None,
                'trusted_devices_count': TrustedDevice.objects.filter(
                    user=user, is_trusted=True
                ).count(),
                'active_sessions_count': SessionLog.objects.filter(
                    user=user, is_active=True
                ).count(),
                'recent_alerts_count': PrivacyAlert.objects.filter(
                    user=user,
                    is_dismissed=False,
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).count()
            }
        })
    
    def patch(self, request):
        user = request.user
        data = request.data
        
        if 'peeping_tom_detection' in data:
            user.peeping_tom_detection = data['peeping_tom_detection']
        
        if 'encryption_enabled' in data:
            user.encryption_enabled = data['encryption_enabled']
        
        user.save()
        
        return Response({
            'success': True,
            'message': 'Security settings updated'
        })


class SecuritySummaryView(APIView):
    """Get security summary dashboard."""
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Recent activity counts
        day_ago = now - timedelta(days=1)
        week_ago = now - timedelta(days=7)
        
        return Response({
            'success': True,
            'data': {
                'security_score': self._calculate_security_score(user),
                'active_sessions': SessionLog.objects.filter(
                    user=user, is_active=True
                ).count(),
                'trusted_devices': TrustedDevice.objects.filter(
                    user=user, is_trusted=True
                ).count(),
                'alerts_today': PrivacyAlert.objects.filter(
                    user=user, created_at__gte=day_ago
                ).count(),
                'alerts_week': PrivacyAlert.objects.filter(
                    user=user, created_at__gte=week_ago
                ).count(),
                'critical_events_week': SecurityEvent.objects.filter(
                    user=user,
                    severity='critical',
                    created_at__gte=week_ago
                ).count(),
                'encryption_status': 'enabled' if user.encryption_enabled else 'disabled',
                'peeping_tom_status': 'enabled' if user.peeping_tom_detection else 'disabled',
            }
        })
    
    def _calculate_security_score(self, user):
        """Calculate user's security score (0-100)."""
        score = 50  # Base score
        
        # Encryption enabled
        if user.encryption_enabled:
            score += 20
        
        # Peeping tom detection
        if user.peeping_tom_detection:
            score += 10
        
        # Has trusted devices
        if TrustedDevice.objects.filter(user=user, is_trusted=True).exists():
            score += 10
        
        # No critical events in last week
        week_ago = timezone.now() - timedelta(days=7)
        critical_events = SecurityEvent.objects.filter(
            user=user,
            severity='critical',
            created_at__gte=week_ago
        ).count()
        
        if critical_events == 0:
            score += 10
        elif critical_events > 3:
            score -= 20
        
        return max(0, min(100, score))
