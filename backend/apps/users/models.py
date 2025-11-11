from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Extended User model."""
    phone = models.CharField(max_length=20, verbose_name="手机号")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name="头像")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    last_login_at = models.DateTimeField(null=True, blank=True, verbose_name="最后登录时间")
    is_online = models.BooleanField(default=False, verbose_name="是否在线")

    class Meta:
        db_table = 'users'
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return self.username


class UserSession(models.Model):
    """User session tracking for online status."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_sessions'
        verbose_name = "用户会话"
        verbose_name_plural = "用户会话"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_key']),
            models.Index(fields=['last_seen']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.ip_address}"


class UserProfile(models.Model):
    """User profile additional information."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    nickname = models.CharField(max_length=50, null=True, blank=True, verbose_name="昵称")
    bio = models.TextField(max_length=500, null=True, blank=True, verbose_name="个人简介")
    gender = models.CharField(
        max_length=10,
        choices=[('male', '男'), ('female', '女'), ('other', '其他')],
        null=True,
        blank=True,
        verbose_name="性别"
    )
    birth_date = models.DateField(null=True, blank=True, verbose_name="生日")
    location = models.CharField(max_length=100, null=True, blank=True, verbose_name="所在地")
    privacy_level = models.CharField(
        max_length=20,
        choices=[
            ('public', '公开'),
            ('friends', '好友可见'),
            ('private', '私密'),
        ],
        default='public',
        verbose_name="隐私级别"
    )

    class Meta:
        db_table = 'user_profiles'
        verbose_name = "用户资料"
        verbose_name_plural = "用户资料"

    def __str__(self):
        return f"{self.user.username} 的资料"