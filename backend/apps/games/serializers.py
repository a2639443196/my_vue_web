from rest_framework import serializers
from .models import (
    GameRecord, SchulteRecord, ReactionTimeRecord,
    MemoryFlipRecord, SudokuRecord
)


class GameRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = GameRecord
        fields = [
            'id', 'user', 'user_name', 'game_type', 'score',
            'duration', 'details', 'played_at'
        ]
        read_only_fields = ['user', 'played_at']

    def get_user_name(self, obj):
        return obj.user.username


class SchulteRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    game_type = serializers.CharField(source='base_record.game_type', read_only=True)
    score = serializers.IntegerField(source='base_record.score', read_only=True)

    class Meta:
        model = SchulteRecord
        fields = [
            'id', 'user_name', 'base_record', 'game_type', 'score',
            'grid_size', 'completion_time'
        ]
        read_only_fields = ['base_record']

    def get_user_name(self, obj):
        return obj.base_record.user.username


class ReactionTimeRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    game_type = serializers.CharField(source='base_record.game_type', read_only=True)
    score = serializers.IntegerField(source='base_record.score', read_only=True)

    class Meta:
        model = ReactionTimeRecord
        fields = [
            'id', 'user_name', 'base_record', 'game_type', 'score',
            'average_time', 'best_time', 'attempts'
        ]
        read_only_fields = ['base_record']

    def get_user_name(self, obj):
        return obj.base_record.user.username


class MemoryFlipRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    game_type = serializers.CharField(source='base_record.game_type', read_only=True)
    score = serializers.IntegerField(source='base_record.score', read_only=True)

    class Meta:
        model = MemoryFlipRecord
        fields = [
            'id', 'user_name', 'base_record', 'game_type', 'score',
            'grid_size', 'moves', 'completion_time'
        ]
        read_only_fields = ['base_record']

    def get_user_name(self, obj):
        return obj.base_record.user.username


class SudokuRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    game_type = serializers.CharField(source='base_record.game_type', read_only=True)
    score = serializers.IntegerField(source='base_record.score', read_only=True)

    class Meta:
        model = SudokuRecord
        fields = [
            'id', 'user_name', 'base_record', 'game_type', 'score',
            'difficulty', 'completion_time', 'hints_used', 'mistakes'
        ]
        read_only_fields = ['base_record']

    def get_user_name(self, obj):
        return obj.base_record.user.username