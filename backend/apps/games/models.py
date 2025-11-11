from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class GameRecord(models.Model):
    """Base model for game records."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_records')
    game_type = models.CharField(
        max_length=20,
        choices=[
            ('schulte', '舒尔特方格'),
            ('memory_flip', '记忆翻牌'),
            ('reaction_time', '反应时间'),
            ('sudoku', '数独'),
        ],
        verbose_name="游戏类型"
    )
    score = models.IntegerField(verbose_name="分数")
    duration = models.IntegerField(null=True, blank=True, verbose_name="用时(秒)")
    details = models.JSONField(default=dict, verbose_name="详细信息")
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="游戏时间")

    class Meta:
        db_table = 'game_records'
        verbose_name = "游戏记录"
        verbose_name_plural = "游戏记录"
        indexes = [
            models.Index(fields=['user', 'game_type']),
            models.Index(fields=['game_type', '-score']),
            models.Index(fields=['played_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_game_type_display()}"


class SchulteRecord(models.Model):
    """Schulte Grid game specific record."""
    base_record = models.OneToOneField(GameRecord, on_delete=models.CASCADE, related_name='schulte_record')
    grid_size = models.IntegerField(verbose_name="网格大小")
    completion_time = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="完成时间(秒)")

    class Meta:
        db_table = 'schulte_records'
        verbose_name = "舒尔特方格记录"
        verbose_name_plural = "舒尔特方格记录"

    def __str__(self):
        return f"{self.base_record.user.username} - {self.grid_size}x{self.grid_size}"


class ReactionTimeRecord(models.Model):
    """Reaction Time game specific record."""
    base_record = models.OneToOneField(GameRecord, on_delete=models.CASCADE, related_name='reaction_record')
    average_time = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="平均反应时间(ms)")
    best_time = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="最佳反应时间(ms)")
    attempts = models.IntegerField(verbose_name="尝试次数")

    class Meta:
        db_table = 'reaction_time_records'
        verbose_name = "反应时间记录"
        verbose_name_plural = "反应时间记录"

    def __str__(self):
        return f"{self.base_record.user.username} - 平均{self.average_time}ms"


class MemoryFlipRecord(models.Model):
    """Memory Flip game specific record."""
    base_record = models.OneToOneField(GameRecord, on_delete=models.CASCADE, related_name='memory_flip_record')
    grid_size = models.IntegerField(verbose_name="网格大小(对数)")
    moves = models.IntegerField(verbose_name="移动次数")
    completion_time = models.IntegerField(verbose_name="完成时间(秒)")

    class Meta:
        db_table = 'memory_flip_records'
        verbose_name = "记忆翻牌记录"
        verbose_name_plural = "记忆翻牌记录"

    def __str__(self):
        return f"{self.base_record.user.username} - {self.grid_size}x{self.grid_size}"


class SudokuRecord(models.Model):
    """Sudoku game specific record."""
    base_record = models.OneToOneField(GameRecord, on_delete=models.CASCADE, related_name='sudoku_record')
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', '简单'),
            ('medium', '中等'),
            ('hard', '困难'),
            ('expert', '专家'),
        ],
        verbose_name="难度"
    )
    completion_time = models.IntegerField(verbose_name="完成时间(秒)")
    hints_used = models.IntegerField(default=0, verbose_name="使用提示次数")
    mistakes = models.IntegerField(default=0, verbose_name="错误次数")

    class Meta:
        db_table = 'sudoku_records'
        verbose_name = "数独记录"
        verbose_name_plural = "数独记录"

    def __str__(self):
        return f"{self.base_record.user.username} - {self.get_difficulty_display()}"