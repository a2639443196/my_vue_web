import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ChatRoom, ChatMessage, ChatRoomMember, OnlineUser

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """Chat WebSocket consumer."""

    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]
        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        self.room_group_name = f"chat_{self.user.id}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Track user as online
        await self.track_user_online()

        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Track user as offline
        await self.track_user_offline()

    async def receive(self, text_data):
        """Handle received WebSocket message."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'typing':
                await self.handle_typing(text_data_json)
            elif message_type == 'join_room':
                await self.handle_join_room(text_data_json)
            elif message_type == 'leave_room':
                await self.handle_leave_room(text_data_json)
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(str(e))

    async def handle_chat_message(self, data):
        """Handle chat message."""
        room_id = data.get('room_id')
        content = data.get('content')
        message_type = data.get('message_type', 'text')

        if not room_id or not content:
            await self.send_error('Room ID and content are required')
            return

        # Get or create room
        room = await self.get_or_create_room(room_id)
        if not room:
            await self.send_error('Room not found')
            return

        # Check if user is member
        is_member = await self.is_room_member(room, self.user)
        if not is_member:
            await self.send_error('Not a member of this room')
            return

        # Save message
        message = await self.save_message(room, self.user, content, message_type)

        # Broadcast message to room
        await self.channel_layer.group_send(
            f"room_{room_id}",
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'room_id': room.id,
                    'user': {
                        'id': self.user.id,
                        'username': self.user.username,
                        'avatar': self.user.avatar.url if self.user.avatar else None
                    },
                    'content': content,
                    'message_type': message_type,
                    'created_at': message.created_at.isoformat(),
                }
            }
        )

    async def handle_typing(self, data):
        """Handle typing indicator."""
        room_id = data.get('room_id')
        is_typing = data.get('is_typing', False)

        if not room_id:
            return

        # Broadcast typing status to room
        await self.channel_layer.group_send(
            f"room_{room_id}",
            {
                'type': 'typing',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username
                },
                'is_typing': is_typing,
                'room_id': room_id
            }
        )

    async def handle_join_room(self, data):
        """Handle joining a room."""
        room_id = data.get('room_id')
        if not room_id:
            return

        room = await self.get_room(room_id)
        if not room:
            return

        # Add user to room members
        await self.add_to_room(room, self.user)

        # Broadcast user joined
        await self.channel_layer.group_send(
            f"room_{room_id}",
            {
                'type': 'user_joined',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username
                },
                'room_id': room_id
            }
        )

    async def handle_leave_room(self, data):
        """Handle leaving a room."""
        room_id = data.get('room_id')
        if not room_id:
            return

        room = await self.get_room(room_id)
        if not room:
            return

        # Remove user from room
        await self.remove_from_room(room, self.user)

        # Broadcast user left
        await self.channel_layer.group_send(
            f"room_{room_id}",
            {
                'type': 'user_left',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username
                },
                'room_id': room_id
            }
        )

    async def chat_message(self, event):
        """Send chat message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing(self, event):
        """Send typing indicator to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing'],
            'room_id': event['room_id']
        }))

    async def user_joined(self, event):
        """Send user joined notification."""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'room_id': event['room_id']
        }))

    async def user_left(self, event):
        """Send user left notification."""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'room_id': event['room_id']
        }))

    async def send_error(self, message):
        """Send error message."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    @database_sync_to_async
    def track_user_online(self):
        """Track user as online."""
        OnlineUser.objects.update_or_create(
            user=self.user,
            defaults={
                'channel_name': self.channel_name,
                'last_seen': timezone.now()
            }
        )
        self.user.is_online = True
        self.user.save(update_fields=['is_online'])

    @database_sync_to_async
    def track_user_offline(self):
        """Track user as offline."""
        OnlineUser.objects.filter(
            user=self.user,
            channel_name=self.channel_name
        ).delete()
        self.user.is_online = False
        self.user.save(update_fields=['is_online'])

    @database_sync_to_async
    def get_or_create_room(self, room_id):
        """Get or create chat room."""
        if room_id == 'global':
            room, created = ChatRoom.objects.get_or_create(
                name='Global Chat',
                defaults={
                    'description': 'Global chat room for all users',
                    'is_public': True,
                    'created_by': self.user
                }
            )
            return room
        return ChatRoom.objects.filter(id=room_id).first()

    @database_sync_to_async
    def get_room(self, room_id):
        """Get chat room."""
        return ChatRoom.objects.filter(id=room_id).first()

    @database_sync_to_async
    def is_room_member(self, room, user):
        """Check if user is room member."""
        return ChatRoomMember.objects.filter(room=room, user=user).exists()

    @database_sync_to_async
    def add_to_room(self, room, user):
        """Add user to room."""
        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user=user,
            defaults={
                'is_online': True
            }
        )
        if not created:
            member.is_online = True
            member.save(update_fields=['is_online'])

    @database_sync_to_async
    def remove_from_room(self, room, user):
        """Remove user from room."""
        ChatRoomMember.objects.filter(room=room, user=user).update(
            is_online=False
        )

    @database_sync_to_async
    def save_message(self, room, user, content, message_type):
        """Save chat message."""
        return ChatMessage.objects.create(
            room=room,
            user=user,
            content=content,
            message_type=message_type
        )


class OnlineUsersConsumer(AsyncWebsocketConsumer):
    """Online users WebSocket consumer."""

    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]
        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        self.group_name = "online_users"

        # Join online users group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send current online users list
        await self.send_online_users()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def user_online(self, event):
        """Handle user online event."""
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'user': event['user']
        }))

    async def user_offline(self, event):
        """Handle user offline event."""
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'user_id': event['user_id']
        }))

    @database_sync_to_async
    def get_online_users(self):
        """Get list of online users."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return list(
            User.objects.filter(is_online=True)
            .values('id', 'username', 'avatar')
        )

    async def send_online_users(self):
        """Send online users list."""
        users = await self.get_online_users()
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'users': users
        }))