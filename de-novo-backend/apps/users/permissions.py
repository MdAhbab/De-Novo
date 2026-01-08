"""
Custom permissions for User app.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj == request.user or obj.user == request.user


class IsNotBlocked(permissions.BasePermission):
    """
    Check if the requesting user is not blocked by the target user.
    """
    
    def has_object_permission(self, request, view, obj):
        from .models import BlockedUser
        
        # Check if current user is blocked by the object's user
        if hasattr(obj, 'user'):
            target_user = obj.user
        else:
            target_user = obj
        
        return not BlockedUser.objects.filter(
            blocker=target_user,
            blocked=request.user
        ).exists()
