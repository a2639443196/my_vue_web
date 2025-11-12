from rest_framework import serializers
from .models import Activity, WaterIntake, BowelMovement, SmokingRecord, SlackRecord, DrinkOption


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


class DrinkOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrinkOption
        fields = ['id', 'name', 'amount', 'icon', 'caffeine_mg', 'is_default']
        read_only_fields = ['is_default']


class WaterIntakeSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = WaterIntake
        fields = [
            'id', 'user', 'user_name', 'amount', 'type',
            'drink_name', 'drink_icon', 'caffeine_mg',
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


class SlackRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SlackRecord
        fields = [
            'id', 'user', 'user_name', 'duration',
            'mood', 'notes', 'recorded_at', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username
