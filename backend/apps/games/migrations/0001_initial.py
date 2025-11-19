from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GameRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_type', models.CharField(choices=[('schulte', '舒尔特方格'), ('memory_flip', '记忆翻牌'), ('reaction_time', '反应时间'), ('sudoku', '数独')], max_length=20, verbose_name='游戏类型')),
                ('score', models.IntegerField(verbose_name='分数')),
                ('duration', models.IntegerField(blank=True, null=True, verbose_name='用时(秒)')),
                ('details', models.JSONField(default=dict, verbose_name='详细信息')),
                ('played_at', models.DateTimeField(auto_now_add=True, verbose_name='游戏时间')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='game_records', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '游戏记录',
                'verbose_name_plural': '游戏记录',
                'db_table': 'game_records',
            },
        ),
        migrations.CreateModel(
            name='SudokuRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('difficulty', models.CharField(choices=[('easy', '简单'), ('medium', '中等'), ('hard', '困难'), ('expert', '专家')], max_length=20, verbose_name='难度')),
                ('completion_time', models.IntegerField(verbose_name='完成时间(秒)')),
                ('hints_used', models.IntegerField(default=0, verbose_name='使用提示次数')),
                ('mistakes', models.IntegerField(default=0, verbose_name='错误次数')),
                ('base_record', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='sudoku_record', to='games.gamerecord')),
            ],
            options={
                'verbose_name': '数独记录',
                'verbose_name_plural': '数独记录',
                'db_table': 'sudoku_records',
            },
        ),
        migrations.CreateModel(
            name='SchulteRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grid_size', models.IntegerField(verbose_name='网格大小')),
                ('completion_time', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='完成时间(秒)')),
                ('base_record', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='schulte_record', to='games.gamerecord')),
            ],
            options={
                'verbose_name': '舒尔特方格记录',
                'verbose_name_plural': '舒尔特方格记录',
                'db_table': 'schulte_records',
            },
        ),
        migrations.CreateModel(
            name='ReactionTimeRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('average_time', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='平均反应时间(ms)')),
                ('best_time', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='最佳反应时间(ms)')),
                ('attempts', models.IntegerField(verbose_name='尝试次数')),
                ('base_record', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='reaction_record', to='games.gamerecord')),
            ],
            options={
                'verbose_name': '反应时间记录',
                'verbose_name_plural': '反应时间记录',
                'db_table': 'reaction_time_records',
            },
        ),
        migrations.CreateModel(
            name='MemoryFlipRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grid_size', models.IntegerField(verbose_name='网格大小(对数)')),
                ('moves', models.IntegerField(verbose_name='移动次数')),
                ('completion_time', models.IntegerField(verbose_name='完成时间(秒)')),
                ('base_record', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='memory_flip_record', to='games.gamerecord')),
            ],
            options={
                'verbose_name': '记忆翻牌记录',
                'verbose_name_plural': '记忆翻牌记录',
                'db_table': 'memory_flip_records',
            },
        ),
        migrations.AddIndex(
            model_name='gamerecord',
            index=models.Index(fields=['user', 'game_type'], name='game_records_user_id_e3b9ad_idx'),
        ),
        migrations.AddIndex(
            model_name='gamerecord',
            index=models.Index(fields=['game_type', '-score'], name='game_records_game_ty_2bd4fc_idx'),
        ),
        migrations.AddIndex(
            model_name='gamerecord',
            index=models.Index(fields=['played_at'], name='game_records_played__dd0d70_idx'),
        ),
    ]
