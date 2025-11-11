from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage, ChatRoomMember

User = get_user_model()


class ChatRoomSerializer(serializers.ModelSerializer):
    """Chat room serializer."""
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

    def get_member_count(self, obj):
        """Get member count."""
        return obj.members.filter(is_online=True).count()

    def get_is_member(self, obj):
        """Check if current user is member."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ChatRoomMember.objects.filter(
                room=obj,
                user=request.user
            ).exists()
        return False

    def get_created_by_username(self, obj):
        """Get created by username."""
        return obj.created_by.username if obj.created_by else None


class ChatMessageSerializer(serializers.ModelSerializer):
    """Chat message serializer."""
    user_info = serializers.SerializerMethodField()
    reply_to_info = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('user', 'room', 'created_at', 'updated_at')

    def get_user_info(self, obj):
        """Get user info."""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.avatar.url if obj.user.avatar else None
        }

    def get_reply_to_info(self, obj):
        """Get reply message info."""
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'content': obj.reply_to.content[:50] + '...' if len(obj.reply_to.content) > 50 else obj.reply_to.content,
                'user': obj.reply_to.user.username
            }
        return None


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    """Chat room member serializer."""
    user_info = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoomMember
        fields = '__all__'

    def get_user_info(self, obj):
        """Get user info."""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.avatar.url if obj.user.avatar else None
        }