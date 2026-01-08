"""
URL configuration for De-Novo project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/accessibility/', include('apps.accessibility.urls')),
    path('api/mood/', include('apps.mood.urls')),
    path('api/security/', include('apps.security.urls')),
    path('api/ai/', include('apps.ai_services.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
