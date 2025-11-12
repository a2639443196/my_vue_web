from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='房间名称')),
                ('description', models.TextField(blank=True, null=True, verbose_name='房间描述')),
                ('is_public', models.BooleanField(default=True, verbose_name='是否公开')),
                ('max_members', models.IntegerField(default=100, verbose_name='最大人数')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否活跃')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_rooms', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '聊天室',
                'verbose_name_plural': '聊天室',
                'db_table': 'chat_rooms',
            },
        ),
        migrations.CreateModel(
            name='OnlineUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('channel_name', models.CharField(max_length=255, unique=True, verbose_name='Channel名称')),
                ('last_seen', models.DateTimeField(auto_now=True, verbose_name='最后活跃时间')),
            ],
            options={
                'verbose_name': '在线用户',
                'verbose_name_plural': '在线用户',
                'db_table': 'online_users',
            },
        ),
        migrations.CreateModel(
            name='ChatRoomMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('owner', '房主'), ('admin', '管理员'), ('member', '成员')], default='member', max_length=20, verbose_name='角色')),
                ('joined_at', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('last_read_at', models.DateTimeField(blank=True, null=True, verbose_name='最后阅读时间')),
                ('is_muted', models.BooleanField(default=False, verbose_name='是否禁言')),
                ('is_online', models.BooleanField(default=False, verbose_name='是否在线')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='chat.chatroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='joined_rooms', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '聊天室成员',
                'verbose_name_plural': '聊天室成员',
                'db_table': 'chat_room_members',
                'unique_together': {('room', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='消息内容')),
                ('message_type', models.CharField(choices=[('text', '文本'), ('image', '图片'), ('file', '文件'), ('system', '系统')], default='text', max_length=20, verbose_name='消息类型')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='是否已删除')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('reply_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='replies', to='chat.chatmessage')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.chatroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '聊天消息',
                'verbose_name_plural': '聊天消息',
                'db_table': 'chat_messages',
            },
        ),
        migrations.AddField(
            model_name='onlineuser',
            name='current_room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='chat.chatroom', verbose_name='当前房间'),
        ),
        migrations.AddField(
            model_name='onlineuser',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='online_status', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='chatmessage',
            index=models.Index(fields=['room', '-created_at'], name='chat_messa_room_id_df4f7e_idx'),
        ),
        migrations.AddIndex(
            model_name='chatmessage',
            index=models.Index(fields=['user', '-created_at'], name='chat_messa_user_id_5759ad_idx'),
        ),
        migrations.AddIndex(
            model_name='chatroommember',
            index=models.Index(fields=['room', 'user'], name='chat_room__room_id_680ed5_idx'),
        ),
        migrations.AddIndex(
            model_name='chatroommember',
            index=models.Index(fields=['user', 'is_online'], name='chat_room__user_id_b6c852_idx'),
        ),
        migrations.AddIndex(
            model_name='onlineuser',
            index=models.Index(fields=['last_seen'], name='online_use_last_se_99f8ad_idx'),
        ),
        migrations.AddIndex(
            model_name='onlineuser',
            index=models.Index(fields=['current_room'], name='online_use_current_f9c09d_idx'),
        ),
    ]
