from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Avg, Max, Min, Count, Sum
from decimal import Decimal
from django.db import ProgrammingError, OperationalError
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

GAME_TYPE_MAP = {
    'schulte': 'schulte',
    'reaction': 'reaction_time',
    'reaction_time': 'reaction_time',
    'memory': 'memory_flip',
    'memory_flip': 'memory_flip',
    'sudoku': 'sudoku'
}

def normalize_game_type(value):
    """Normalize front-end gameType to model friendly value."""
    if not value:
        return None
    return GAME_TYPE_MAP.get(str(value))

def build_game_result(record: GameRecord):
    return {
        'id': record.id,
        'userId': record.user_id,
        'gameType': record.game_type,
        'score': record.score,
        'durationMs': (record.duration or 0) * 1000,
        'metadata': record.details,
        'createdAt': record.played_at.isoformat()
    }


def compute_game_summary(user: User, game_type: str):
    """Compute summary metrics for a given game type."""
    try:
        qs = GameRecord.objects.filter(user=user, game_type=game_type)
        if not qs.exists():
            return {
                'gameType': game_type,
                'bestScore': None,
                'averageScore': None,
                'totalPlays': 0,
                'lastPlayed': None,
            }

        best_agg = Min('score') if game_type in ['reaction_time', 'schulte', 'memory_flip', 'sudoku'] else Max('score')
        aggregate = qs.aggregate(
            best=best_agg,
            average=Avg('score'),
            last_played=Max('played_at'),
            total=Count('id'),
        )
        return {
            'gameType': game_type,
            'bestScore': aggregate['best'],
            'averageScore': round(aggregate['average'], 2) if aggregate['average'] is not None else None,
            'totalPlays': aggregate['total'],
            'lastPlayed': aggregate['last_played'].isoformat() if aggregate['last_played'] else None,
        }
    except (ProgrammingError, OperationalError):
        # Table not migrated yet
        return {
            'gameType': game_type,
            'bestScore': None,
            'averageScore': None,
            'totalPlays': 0,
            'lastPlayed': None,
        }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_game_result(request):
    """
    Persist a game result coming from the front-end.
    Compatible with the modern /games/results payload.
    """
    data = request.data
    game_type_raw = data.get('gameType') or data.get('game_type')
    game_type = normalize_game_type(game_type_raw)
    if not game_type:
        return JsonResponse({'detail': '缺少或不支持的 gameType'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        score = int(data.get('score', 0))
    except (TypeError, ValueError):
        return JsonResponse({'detail': 'score 需要为数字'}, status=status.HTTP_400_BAD_REQUEST)

    duration_ms = data.get('durationMs') or data.get('duration_ms')
    duration = None
    if duration_ms is not None:
        try:
            duration = int(round(float(duration_ms) / 1000))
        except (TypeError, ValueError):
            duration = None

    metadata = data.get('metadata') or {}
    if not isinstance(metadata, dict):
        metadata = {}
    base_record = GameRecord.objects.create(
        user=request.user,
        game_type=game_type,
        score=score,
        duration=duration,
        details=metadata,
    )

    # Create specific records for richer stats
    if game_type == 'schulte':
        grid_size = metadata.get('difficulty') or metadata.get('grid_size') or 5
        completion = Decimal(str(round((duration_ms or 0) / 1000, 2))) if duration_ms else Decimal('0')
        SchulteRecord.objects.create(
            base_record=base_record,
            grid_size=grid_size,
            completion_time=completion
        )
    elif game_type == 'reaction_time':
        avg_time = metadata.get('averageTime') or score
        best_time = metadata.get('bestTime') or score
        attempts = data.get('attempts') or metadata.get('attempts') or 1
        try:
            attempts = int(attempts)
        except (TypeError, ValueError):
            attempts = 1
        ReactionTimeRecord.objects.create(
            base_record=base_record,
            average_time=avg_time,
            best_time=best_time,
            attempts=attempts
        )
    elif game_type == 'memory_flip':
        grid_size = metadata.get('gridSize') or 4
        moves = score
        completion = duration or 0
        MemoryFlipRecord.objects.create(
            base_record=base_record,
            grid_size=grid_size,
            moves=moves,
            completion_time=completion
        )
    elif game_type == 'sudoku':
        difficulty = metadata.get('difficulty') or 'easy'
        completion = duration or 0
        hints = metadata.get('hintsUsed') or 0
        mistakes = metadata.get('mistakes') or 0
        SudokuRecord.objects.create(
            base_record=base_record,
            difficulty=difficulty,
            completion_time=completion,
            hints_used=hints,
            mistakes=mistakes
        )

    return JsonResponse(build_game_result(base_record), status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_summary(request):
    """Return summary for a specific game type."""
    game_type_raw = request.GET.get('gameType') or request.GET.get('game_type')
    game_type = normalize_game_type(game_type_raw)
    if not game_type:
        return JsonResponse({'detail': '缺少或不支持的 gameType'}, status=status.HTTP_400_BAD_REQUEST)

    summary = compute_game_summary(request.user, game_type)
    return JsonResponse(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_game_summary(request):
    """Aggregate summary across all game types for the user."""
    all_types = ['schulte', 'reaction_time', 'memory_flip', 'sudoku']
    summaries = {gt: compute_game_summary(request.user, gt) for gt in all_types}
    try:
        totals_qs = GameRecord.objects.filter(user=request.user)
        totals = totals_qs.aggregate(
            plays=Count('id'),
            duration=Sum('duration')
        )
    except (ProgrammingError, OperationalError):
        totals = {'plays': 0, 'duration': 0}
    data = {
        'totals': {
            'plays': totals.get('plays', 0) or 0,
            'durationMs': (totals.get('duration') or 0) * 1000
        },
        'byGame': summaries
    }
    return JsonResponse(data)


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
    game_type_raw = request.GET.get('gameType') or request.GET.get('game_type') or 'schulte'
    game_type = normalize_game_type(game_type_raw) or 'schulte'

    order_field = 'score'
    if game_type in ['reaction_time', 'schulte', 'memory_flip', 'sudoku']:
        order_field = 'score'
        ordering = order_field
    else:
        ordering = f'-{order_field}'

    records = GameRecord.objects.filter(
        game_type=game_type
    ).order_by(ordering)[:10]

    data = [
        {
            'rank': idx + 1,
            'userId': record.user_id,
            'username': record.user.username,
            'avatar': getattr(record.user, 'avatar', None),
            'score': record.score,
            'createdAt': record.played_at.isoformat()
        }
        for idx, record in enumerate(records)
    ]

    return JsonResponse(data, safe=False)


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
