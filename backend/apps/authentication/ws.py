from urllib.parse import parse_qs

import jwt
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


@database_sync_to_async
def _get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.DecodeError, jwt.InvalidTokenError):
        return AnonymousUser()

    user_id = payload.get('user_id')
    if not user_id:
        return AnonymousUser()

    try:
        return User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom Channels middleware that authenticates WebSocket connections using JWT tokens.

    The token can be supplied either via the `Authorization: Bearer <token>` header or as a
    `token` query string parameter.
    """

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        token = self._extract_token(scope)

        if token:
            scope['user'] = await _get_user_from_token(token)

        return await super().__call__(scope, receive, send)

    @staticmethod
    def _extract_token(scope) -> str | None:
        headers = dict(scope.get('headers', []))
        auth_header = headers.get(b'authorization')
        if auth_header:
            decoded = auth_header.decode()
            if decoded.lower().startswith('bearer '):
                return decoded.split(' ', 1)[1].strip()

        query_string = scope.get('query_string', b'').decode()
        if query_string:
            params = parse_qs(query_string)
            token = params.get('token')
            if token:
                return token[0]
        return None


def JWTAuthMiddlewareStack(inner):
    """
    Helper to compose the JWT auth middleware with Django's default AuthMiddlewareStack.
    """

    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
