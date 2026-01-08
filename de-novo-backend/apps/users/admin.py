from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserContact, BlockedUser


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'disability_type', 'is_online', 'is_staff']
    list_filter = ['disability_type', 'is_online', 'is_staff', 'is_active']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('avatar', 'bio', 'phone_number', 'date_of_birth')}),
        ('Disability', {'fields': ('disability_type', 'disability_details')}),
        ('Accessibility', {'fields': (
            'font_size', 'high_contrast', 'color_blind_mode', 
            'dark_mode', 'reduce_motion'
        )}),
        ('TTS Settings', {'fields': ('tts_enabled', 'tts_voice', 'tts_rate', 'tts_pitch')}),
        ('STT Settings', {'fields': ('stt_enabled', 'stt_language', 'stt_continuous')}),
        ('Security', {'fields': ('peeping_tom_enabled', 'two_factor_enabled', 'public_key')}),
        ('Status', {'fields': ('is_online', 'onboarding_completed')}),
    )


@admin.register(UserContact)
class UserContactAdmin(admin.ModelAdmin):
    list_display = ['user', 'contact', 'nickname', 'is_blocked', 'is_favorite']
    list_filter = ['is_blocked', 'is_favorite']
    search_fields = ['user__username', 'contact__username']


@admin.register(BlockedUser)
class BlockedUserAdmin(admin.ModelAdmin):
    list_display = ['blocker', 'blocked', 'created_at']
    search_fields = ['blocker__username', 'blocked__username']
