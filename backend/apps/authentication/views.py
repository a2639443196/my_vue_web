from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)
from .authentication import generate_jwt_token

User = get_user_model()


class RegisterView(APIView):
    """User registration view."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Register new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = generate_jwt_token(user)

            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'token': token,
                'message': '注册成功'
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login view."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Login user."""
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = generate_jwt_token(user)

            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'token': token,
                'message': '登录成功'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """User profile view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user profile."""
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        """Update user profile."""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'user': serializer.data,
                'message': '更新成功'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password view."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                'message': '密码修改成功'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout view."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Logout user."""
        # In JWT-based authentication, logout is client-side
        # Server can implement token blacklisting if needed
        return Response({
            'message': '退出登录成功'
        })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """Refresh JWT token."""
    # For simplicity, we'll just generate a new token
    # In production, implement proper token refresh logic
    return Response({'message': 'Token refresh not implemented'}, status=501)