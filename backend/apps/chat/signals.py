from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import OnlineUser

User = get_user_model()
channel_layer = get_channel_layer()


@receiver(post_save, sender=OnlineUser)
def user_online_signal(sender, instance, created, **kwargs):
    """Signal when user comes online."""
    if created:
        # Broadcast user online to all connected clients
        async_to_sync(channel_layer.group_send)(
            "online_users",
            {
                'type': 'user_online',
                'user': {
                    'id': instance.user.id,
                    'username': instance.user.username,
                    'avatar': instance.user.avatar.url if instance.user.avatar else None
                }
            }
        )


@receiver(post_delete, sender=OnlineUser)
def user_offline_signal(sender, instance, **kwargs):
    """Signal when user goes offline."""
    # Broadcast user offline to all connected clients
    async_to_sync(channel_layer.group_send)(
        "online_users",
        {
            'type': 'user_offline',
            'user_id': instance.user.id
        }
    )