from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile."""
    user = request.user
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile."""
    user = request.user

    # Update user fields
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    if 'phone' in request.data:
        user.phone = request.data['phone']
    if 'avatar' in request.data:
        user.avatar = request.data['avatar']

    user.save()

    # Update profile fields if they exist
    if hasattr(user, 'profile'):
        profile = user.profile
        profile_data = request.data.get('profile', {})

        if 'nickname' in profile_data:
            profile.nickname = profile_data['nickname']
        if 'bio' in profile_data:
            profile.bio = profile_data['bio']
        if 'gender' in profile_data:
            profile.gender = profile_data['gender']
        if 'birth_date' in profile_data:
            profile.birth_date = profile_data['birth_date']
        if 'location' in profile_data:
            profile.location = profile_data['location']
        if 'privacy_level' in profile_data:
            profile.privacy_level = profile_data['privacy_level']

        profile.save()

    serializer = UserSerializer(user)
    return JsonResponse(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Get list of users."""
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Get user details by ID."""
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)