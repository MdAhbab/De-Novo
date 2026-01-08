"""
Signals for User app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    """
    Signal handler for when a new user is created.
    Can be used to send welcome emails, create default settings, etc.
    """
    if created:
        # Log user creation
        print(f"New user created: {instance.username}")
