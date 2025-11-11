from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import (
    ActivitySerializer, WaterIntakeSerializer,
    BowelMovementSerializer, SmokingRecordSerializer
)
from .models import Activity, WaterIntake, BowelMovement, SmokingRecord

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_list(request):
    """Get user activities."""
    activities = Activity.objects.filter(user=request.user).order_by('-created_at')
    serializer = ActivitySerializer(activities, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_activity(request):
    """Create a new activity."""
    serializer = ActivitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def water_intake_list(request):
    """Get water intake records."""
    records = WaterIntake.objects.filter(user=request.user).order_by('-recorded_at')
    serializer = WaterIntakeSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_water_intake(request):
    """Create a water intake record."""
    serializer = WaterIntakeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bowel_movement_list(request):
    """Get bowel movement records."""
    records = BowelMovement.objects.filter(user=request.user).order_by('-recorded_at')
    serializer = BowelMovementSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bowel_movement(request):
    """Create a bowel movement record."""
    serializer = BowelMovementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def smoking_record_list(request):
    """Get smoking records."""
    records = SmokingRecord.objects.filter(user=request.user).order_by('-recorded_at')
    serializer = SmokingRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_smoking_record(request):
    """Create a smoking record."""
    serializer = SmokingRecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistics(request):
    """Get activity statistics."""
    user = request.user

    # Water intake statistics
    today_water = WaterIntake.objects.filter(
        user=user,
        recorded_at__date=timezone.now().date()
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    # Today's activities count
    today_activities = Activity.objects.filter(
        user=user,
        created_at__date=timezone.now().date()
    ).count()

    # Today's smoking count
    today_smoking = SmokingRecord.objects.filter(
        user=user,
        recorded_at__date=timezone.now().date()
    ).aggregate(total=models.Sum('count'))['total'] or 0

    data = {
        'today_water_intake': today_water,
        'today_activities': today_activities,
        'today_smoking': today_smoking,
    }

    return JsonResponse(data)