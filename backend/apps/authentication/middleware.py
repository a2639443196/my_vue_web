from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .authentication import JWTAuthentication

User = get_user_model()


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """JWT Authentication Middleware for API requests."""

    def process_request(self, request):
        """Process request to authenticate user."""
        # Skip authentication for specific paths
        skip_paths = [
            '/api/healthz/',
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/refresh/',
            '/admin/',
        ]

        if request.path_info in skip_paths:
            return None

        # Try to authenticate user
        try:
            auth = JWTAuthentication()
            result = auth.authenticate(request)
            if result:
                request.user, request.auth = result
        except Exception:
            # Authentication failed, but don't block request
            # DRF permissions will handle authentication requirements
            pass

        return None

    def process_response(self, request, response):
        """Process response to add CORS headers."""
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response