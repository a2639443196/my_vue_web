from rest_framework import serializers
from .models import Activity, WaterIntake, BowelMovement, SmokingRecord


class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'user', 'user_name', 'category', 'action',
            'details', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username


class WaterIntakeSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = WaterIntake
        fields = [
            'id', 'user', 'user_name', 'amount', 'type',
            'recorded_at', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username


class BowelMovementSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = BowelMovement
        fields = [
            'id', 'user', 'user_name', 'type', 'color',
            'difficulty', 'notes', 'recorded_at', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username


class SmokingRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SmokingRecord
        fields = [
            'id', 'user', 'user_name', 'count', 'mood',
            'location', 'notes', 'recorded_at', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username