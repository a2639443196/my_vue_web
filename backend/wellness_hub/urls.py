"""
URL configuration for wellness_hub project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for load balancers."""
    return JsonResponse({'status': 'healthy', 'service': 'wellness-hub-api'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/healthz/', health_check, name='health_check'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/activities/', include('apps.activities.urls')),
    path('api/games/', include('apps.games.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)