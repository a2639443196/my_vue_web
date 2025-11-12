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
    BowelMovementSerializer, SmokingRecordSerializer,
    SlackRecordSerializer, DrinkOptionSerializer
)
from .models import Activity, WaterIntake, BowelMovement, SmokingRecord, SlackRecord, DrinkOption

DEFAULT_DRINKS = [
    {'name': '纯净水 300ml', 'amount': 300, 'icon': 'mdi-cup-water'},
    {'name': '绿茶 350ml', 'amount': 350, 'icon': 'mdi-tea'},
    {'name': '美式咖啡 240ml', 'amount': 240, 'icon': 'mdi-coffee', 'caffeine_mg': 120},
    {'name': '能量饮料 250ml', 'amount': 250, 'icon': 'mdi-flash'},
    {'name': '牛奶 250ml', 'amount': 250, 'icon': 'mdi-cow'},
]


def ensure_default_drinks():
    if not DrinkOption.objects.filter(is_default=True).exists():
        for option in DEFAULT_DRINKS:
            DrinkOption.objects.create(
                name=option['name'],
                amount=option.get('amount', 300),
                icon=option.get('icon'),
                caffeine_mg=option.get('caffeine_mg'),
                is_default=True
            )

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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def water_summary(request):
    """Return daily totals for a given month."""
    month_param = request.GET.get('month')
    if month_param:
        try:
            start = timezone.datetime.strptime(month_param, '%Y-%m')
            start = timezone.make_aware(start.replace(day=1))
        except ValueError:
            return JsonResponse({'detail': 'month 参数格式应为 YYYY-MM'}, status=400)
    else:
        now = timezone.now()
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # compute range to end of month
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)

    qs = WaterIntake.objects.filter(
        user=request.user,
        recorded_at__gte=start,
        recorded_at__lt=end
    ).annotate(date=models.functions.TruncDate('recorded_at')) \
     .values('date') \
     .annotate(total=models.Sum('amount')) \
     .order_by('date')

    data = [
        {
            'date': item['date'].isoformat(),
            'total': item['total']
        }
        for item in qs
    ]

    return JsonResponse({'month': start.strftime('%Y-%m'), 'entries': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_water_intake(request):
    """Create a water intake record."""
    data = request.data.copy()
    drink_id = data.get('drink_id')
    drink_name = data.get('drink_name')

    drink = None
    if drink_id:
        drink = DrinkOption.objects.filter(
            models.Q(user=request.user) | models.Q(is_default=True, user__isnull=True),
            id=drink_id
        ).first()
        if not drink:
            return JsonResponse({'detail': '饮品不存在'}, status=status.HTTP_404_NOT_FOUND)
        data['drink_name'] = drink.name
        data['drink_icon'] = drink.icon
        data['caffeine_mg'] = drink.caffeine_mg
        if not data.get('amount'):
            data['amount'] = drink.amount
    else:
        if not drink_name:
            data['drink_name'] = '自定义饮品'

    if not data.get('recorded_at'):
        data['recorded_at'] = timezone.now().isoformat()

    serializer = WaterIntakeSerializer(data=data)
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
def slack_record_list(request):
    """Get slack records."""
    records = SlackRecord.objects.filter(user=request.user).order_by('-recorded_at')
    serializer = SlackRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_slack_record(request):
    """Create a slack record."""
    serializer = SlackRecordSerializer(data=request.data)
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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def drink_options_view(request):
    """List or create drink options."""
    ensure_default_drinks()
    if request.method == 'GET':
        options = DrinkOption.objects.filter(
            models.Q(user__isnull=True, is_default=True) | models.Q(user=request.user)
        ).order_by('-is_default', 'name')
        serializer = DrinkOptionSerializer(options, many=True)
        return JsonResponse(serializer.data, safe=False)

    serializer = DrinkOptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, is_default=False)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def drink_option_detail(request, pk):
    """Update or delete a custom drink option."""
    option = DrinkOption.objects.filter(user=request.user, pk=pk).first()
    if not option:
        return JsonResponse({'detail': '饮品不存在或无权访问'}, status=404)

    if request.method == 'DELETE':
        option.delete()
        return JsonResponse({'message': '已删除'})

    serializer = DrinkOptionSerializer(option, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
