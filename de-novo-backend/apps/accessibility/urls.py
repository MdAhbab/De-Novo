"""
URL routes for Accessibility app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Presets
    path('presets/', views.AccessibilityPresetsView.as_view(), name='presets'),
    path('presets/<int:preset_id>/', views.PresetDetailView.as_view(), name='preset_detail'),
    path('presets/apply/', views.ApplyPresetView.as_view(), name='apply_preset'),
    
    # Quick Phrases
    path('quick-phrases/', views.QuickPhrasesView.as_view(), name='quick_phrases'),
    path('quick-phrases/<int:phrase_id>/', views.QuickPhraseDetailView.as_view(), name='quick_phrase_detail'),
    
    # Feedback
    path('feedback/', views.AccessibilityFeedbackView.as_view(), name='feedback'),
    
    # Tips
    path('tips/', views.AccessibilityTipsView.as_view(), name='tips'),
]
