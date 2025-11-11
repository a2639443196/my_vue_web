"""
ASGI config for wellness_hub project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import apps.chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wellness_hub.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                apps.chat.routing.websocket_urlpatterns
            )
        )
    ),
})