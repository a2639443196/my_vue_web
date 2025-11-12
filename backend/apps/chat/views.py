from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from .models import ChatRoom, ChatMessage, ChatRoomMember, OnlineUser
from .serializers import (
    ChatRoomSerializer,
    ChatMessageSerializer,
    ChatRoomMemberSerializer
)

User = get_user_model()
DEFAULT_ROOM_NAME = 'Wellness Hub Lounge'


def ensure_default_room(user):
    """Ensure the global lounge room exists and the user is a member."""
    room, _ = ChatRoom.objects.get_or_create(
        name=DEFAULT_ROOM_NAME,
        defaults={
            'description': '全站公共聊天室',
            'is_public': True,
            'created_by': user,
            'max_members': 1000
        }
    )
    ChatRoomMember.objects.get_or_create(
        room=room,
        user=user,
        defaults={'role': 'member'}
    )
    return room


class ChatRoomViewSet(viewsets.ModelViewSet):
    """Chat room viewset."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatRoomSerializer

    def get_queryset(self):
        """Get queryset based on user."""
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(is_public=True) | Q(members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        """Create new chat room."""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join chat room."""
        room = self.get_object()
        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user=request.user,
            defaults={'role': 'member'}
        )

        if created:
            return Response({'message': '成功加入聊天室'})
        else:
            return Response({'message': '您已在聊天室中'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave chat room."""
        room = self.get_object()
        ChatRoomMember.objects.filter(room=room, user=request.user).delete()
        return Response({'message': '已离开聊天室'})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get room messages."""
        room = self.get_object()

        # Check if user is member
        if not ChatRoomMember.objects.filter(room=room, user=request.user).exists():
            return Response({'error': '不是聊天室成员'}, status=403)

        messages = room.messages.filter(is_deleted=False).order_by('-created_at')
        page = self.paginate_queryset(messages)
        serializer = ChatMessageSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class ChatRoomDetailView(APIView):
    """Chat room detail view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """Get room details."""
        try:
            room = ChatRoom.objects.get(pk=pk)
            serializer = ChatRoomSerializer(room)
            return Response(serializer.data)
        except ChatRoom.DoesNotExist:
            return Response({'error': '聊天室不存在'}, status=404)


class ChatMessageListView(APIView):
    """Chat message list view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, room_id):
        """Get room messages."""
        try:
            room = ChatRoom.objects.get(pk=room_id)

            # Check if user is member
            if not ChatRoomMember.objects.filter(room=room, user=request.user).exists():
                return Response({'error': '不是聊天室成员'}, status=403)

            messages = room.messages.filter(is_deleted=False).order_by('-created_at')

            # Pagination
            page_size = int(request.GET.get('page_size', 20))
            page = int(request.GET.get('page', 1))
            start = (page - 1) * page_size
            end = start + page_size

            serializer = ChatMessageSerializer(messages[start:end], many=True)
            return Response({
                'results': serializer.data,
                'count': messages.count(),
                'next': f'?page={page + 1}&page_size={page_size}' if end < messages.count() else None,
                'previous': f'?page={page - 1}&page_size={page_size}' if page > 1 else None
            })

        except ChatRoom.DoesNotExist:
            return Response({'error': '聊天室不存在'}, status=404)

    def post(self, request, room_id):
        """Create new message."""
        try:
            room = ChatRoom.objects.get(pk=room_id)

            # Check if user is member
            if not ChatRoomMember.objects.filter(room=room, user=request.user).exists():
                return Response({'error': '不是聊天室成员'}, status=403)

            content = request.data.get('content')
            message_type = request.data.get('message_type', 'text')

            if not content:
                return Response({'error': '消息内容不能为空'}, status=400)

            message = ChatMessage.objects.create(
                room=room,
                user=request.user,
                content=content,
                message_type=message_type
            )

            serializer = ChatMessageSerializer(message)
            return Response(serializer.data, status=201)

        except ChatRoom.DoesNotExist:
            return Response({'error': '聊天室不存在'}, status=404)


class DefaultChatRoomView(APIView):
    """Ensure and return the default global chat room."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        room = ensure_default_room(request.user)
        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response(serializer.data)


class DefaultChatMessagesView(APIView):
    """Return paginated messages for the default room."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        room = ensure_default_room(request.user)
        messages_qs = room.messages.filter(is_deleted=False).order_by('-created_at')

        page_size = int(request.GET.get('page_size', 50))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        serializer = ChatMessageSerializer(messages_qs[start:end], many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'count': messages_qs.count(),
            'next': page + 1 if end < messages_qs.count() else None,
            'previous': page - 1 if page > 1 else None
        })

    def post(self, request):
        room = ensure_default_room(request.user)
        content = request.data.get('content')
        message_type = request.data.get('message_type', 'text')

        if not content:
            return Response({'error': '消息内容不能为空'}, status=400)

        message = ChatMessage.objects.create(
            room=room,
            user=request.user,
            content=content,
            message_type=message_type
        )
        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=201)


class OnlineUsersView(APIView):
    """Online users view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get online users list."""
        online_records = OnlineUser.objects.select_related('user').order_by('-last_seen')

        def serialize(record):
            avatar_url = None
            if record.user.avatar:
                avatar_url = request.build_absolute_uri(record.user.avatar.url)
            return {
                'id': record.user.id,
                'username': record.user.username,
                'avatar': avatar_url,
                'last_active': record.last_seen.isoformat(),
                'status': 'online'
            }

        data = [serialize(item) for item in online_records]
        return Response({
            'users': data,
            'total_count': len(data)
        })
