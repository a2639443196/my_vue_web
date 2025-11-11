from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import (
    GameRecordSerializer, SchulteRecordSerializer,
    ReactionTimeRecordSerializer, MemoryFlipRecordSerializer,
    SudokuRecordSerializer
)
from .models import GameRecord, SchulteRecord, ReactionTimeRecord, MemoryFlipRecord, SudokuRecord

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_record_list(request):
    """Get user game records."""
    game_type = request.GET.get('game_type')
    records = GameRecord.objects.filter(user=request.user).order_by('-played_at')

    if game_type:
        records = records.filter(game_type=game_type)

    serializer = GameRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_game_record(request):
    """Create a new game record."""
    serializer = GameRecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_leaderboard(request):
    """Get game leaderboard."""
    game_type = request.GET.get('game_type', 'schulte')

    records = GameRecord.objects.filter(
        game_type=game_type
    ).order_by('-score')[:10]

    serializer = GameRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schulte_records(request):
    """Get Schulte grid records."""
    records = SchulteRecord.objects.filter(
        base_record__user=request.user
    ).order_by('-base_record__played_at')

    serializer = SchulteRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reaction_time_records(request):
    """Get reaction time records."""
    records = ReactionTimeRecord.objects.filter(
        base_record__user=request.user
    ).order_by('-base_record__played_at')

    serializer = ReactionTimeRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def memory_flip_records(request):
    """Get memory flip records."""
    records = MemoryFlipRecord.objects.filter(
        base_record__user=request.user
    ).order_by('-base_record__played_at')

    serializer = MemoryFlipRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sudoku_records(request):
    """Get Sudoku records."""
    records = SudokuRecord.objects.filter(
        base_record__user=request.user
    ).order_by('-base_record__played_at')

    serializer = SudokuRecordSerializer(records, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistics(request):
    """Get game statistics for the user."""
    user = request.user

    # Total games played
    total_games = GameRecord.objects.filter(user=user).count()

    # Games by type
    games_by_type = GameRecord.objects.filter(user=user).values('game_type').annotate(
        count=models.Count('id')
    )

    # Best scores by game type
    best_scores = GameRecord.objects.filter(user=user).values('game_type').annotate(
        best_score=models.Max('score')
    )

    data = {
        'total_games': total_games,
        'games_by_type': list(games_by_type),
        'best_scores': list(best_scores),
    }

    return JsonResponse(data)