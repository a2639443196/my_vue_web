from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatRoom(models.Model):
    """Chat room model."""
    name = models.CharField(max_length=100, unique=True, verbose_name="房间名称")
    description = models.TextField(null=True, blank=True, verbose_name="房间描述")
    is_public = models.BooleanField(default=True, verbose_name="是否公开")
    max_members = models.IntegerField(default=100, verbose_name="最大人数")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    is_active = models.BooleanField(default=True, verbose_name="是否活跃")

    class Meta:
        db_table = 'chat_rooms'
        verbose_name = "聊天室"
        verbose_name_plural = "聊天室"

    def __str__(self):
        return self.name


class ChatMessage(models.Model):
    """Chat message model."""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField(verbose_name="消息内容")
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', '文本'),
            ('image', '图片'),
            ('file', '文件'),
            ('system', '系统'),
        ],
        default='text',
        verbose_name="消息类型"
    )
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    is_deleted = models.BooleanField(default=False, verbose_name="是否已删除")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        db_table = 'chat_messages'
        verbose_name = "聊天消息"
        verbose_name_plural = "聊天消息"
        indexes = [
            models.Index(fields=['room', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}..."


class ChatRoomMember(models.Model):
    """Chat room member model."""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='joined_rooms')
    role = models.CharField(
        max_length=20,
        choices=[
            ('owner', '房主'),
            ('admin', '管理员'),
            ('member', '成员'),
        ],
        default='member',
        verbose_name="角色"
    )
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name="加入时间")
    last_read_at = models.DateTimeField(null=True, blank=True, verbose_name="最后阅读时间")
    is_muted = models.BooleanField(default=False, verbose_name="是否禁言")
    is_online = models.BooleanField(default=False, verbose_name="是否在线")

    class Meta:
        db_table = 'chat_room_members'
        verbose_name = "聊天室成员"
        verbose_name_plural = "聊天室成员"
        unique_together = ('room', 'user')
        indexes = [
            models.Index(fields=['room', 'user']),
            models.Index(fields=['user', 'is_online']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.room.name}"


class OnlineUser(models.Model):
    """Track online users across the application."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='online_status')
    channel_name = models.CharField(max_length=255, unique=True, verbose_name="Channel名称")
    last_seen = models.DateTimeField(auto_now=True, verbose_name="最后活跃时间")
    current_room = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="当前房间")

    class Meta:
        db_table = 'online_users'
        verbose_name = "在线用户"
        verbose_name_plural = "在线用户"
        indexes = [
            models.Index(fields=['last_seen']),
            models.Index(fields=['current_room']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.last_seen}"