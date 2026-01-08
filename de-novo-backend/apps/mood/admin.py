from django.contrib import admin
from .models import MoodEntry, AmbientSound, UserSoundSession


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'mood', 'created_at']
    list_filter = ['mood', 'created_at']
    search_fields = ['user__username', 'notes']


@admin.register(AmbientSound)
class AmbientSoundAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'duration', 'play_count', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']


@admin.register(UserSoundSession)
class UserSoundSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'sound', 'started_at', 'duration_listened']
    list_filter = ['started_at']
    search_fields = ['user__username', 'sound__name']
