from django.contrib import admin
from .models import AccessibilityPreset, UserAccessibilityFeedback, QuickPhrase


@admin.register(AccessibilityPreset)
class AccessibilityPresetAdmin(admin.ModelAdmin):
    list_display = ['name', 'disability_type', 'is_default']
    list_filter = ['disability_type', 'is_default']
    search_fields = ['name', 'description']


@admin.register(UserAccessibilityFeedback)
class AccessibilityFeedbackAdmin(admin.ModelAdmin):
    list_display = ['user', 'feature', 'rating', 'created_at']
    list_filter = ['feature', 'rating']
    search_fields = ['user__username', 'comment']


@admin.register(QuickPhrase)
class QuickPhraseAdmin(admin.ModelAdmin):
    list_display = ['phrase', 'category', 'user', 'is_system']
    list_filter = ['category', 'is_system']
    search_fields = ['phrase', 'user__username']
