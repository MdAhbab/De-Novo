"""
URL routes for Mood app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Mood Tracking
    path('entry/', views.MoodEntryView.as_view(), name='mood_entry'),
    path('history/', views.MoodHistoryView.as_view(), name='mood_history'),
    path('analytics/', views.MoodAnalyticsView.as_view(), name='mood_analytics'),
    
    # Ambient Sounds
    path('sounds/', views.AmbientSoundListView.as_view(), name='sounds'),
    path('sounds/<int:sound_id>/', views.AmbientSoundDetailView.as_view(), name='sound_detail'),
    path('sounds/recommendations/', views.SoundRecommendationsView.as_view(), name='sound_recommendations'),
    
    # Sessions
    path('sessions/start/', views.StartSessionView.as_view(), name='start_session'),
    path('sessions/end/', views.EndSessionView.as_view(), name='end_session'),
]
