"""
ASGI config for wellness_hub project.
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wellness_hub.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
import apps.chat.routing
from apps.authentication.ws import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(
                apps.chat.routing.websocket_urlpatterns
            )
        )
    ),
})
