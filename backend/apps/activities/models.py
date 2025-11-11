from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Activity(models.Model):
    """Activity tracking model."""
    CATEGORY_CHOICES = [
        ('water', '饮水记录'),
        ('bowel', '排便记录'),
        ('smoking', '抽烟记录'),
        ('slack', '摸鱼记录'),
        ('game', '游戏记录'),
        ('custom', '自定义'),
    ]

    ACTION_CHOICES = [
        ('create', '创建'),
        ('update', '更新'),
        ('delete', '删除'),
        ('complete', '完成'),
        ('start', '开始'),
        ('stop', '停止'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="类别")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name="动作")
    details = models.JSONField(default=dict, verbose_name="详细信息")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        db_table = 'activities'
        verbose_name = "活动记录"
        verbose_name_plural = "活动记录"
        indexes = [
            models.Index(fields=['user', 'category']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_category_display()}"


class WaterIntake(models.Model):
    """Water intake tracking."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_intakes')
    amount = models.IntegerField(verbose_name="饮水量(ml)")
    type = models.CharField(
        max_length=20,
        choices=[
            ('small', '小杯(250ml)'),
            ('medium', '中杯(350ml)'),
            ('large', '大杯(500ml)'),
            ('custom', '自定义'),
        ],
        default='medium',
        verbose_name="杯子类型"
    )
    recorded_at = models.DateTimeField(verbose_name="记录时间")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        db_table = 'water_intakes'
        verbose_name = "饮水记录"
        verbose_name_plural = "饮水记录"
        indexes = [
            models.Index(fields=['user', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.amount}ml"


class BowelMovement(models.Model):
    """Bowel movement tracking."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bowel_movements')
    type = models.CharField(
        max_length=20,
        choices=[
            ('normal', '正常'),
            ('hard', '偏硬'),
            ('soft', '偏软'),
            ('watery', '水样'),
            ('dry', '干燥'),
        ],
        default='normal',
        verbose_name="类型"
    )
    color = models.CharField(
        max_length=20,
        choices=[
            ('brown', '棕色'),
            ('yellow', '黄色'),
            ('green', '绿色'),
            ('black', '黑色'),
            ('red', '红色'),
            ('other', '其他'),
        ],
        default='brown',
        verbose_name="颜色"
    )
    difficulty = models.IntegerField(
        choices=[(i, f'等级{i}') for i in range(1, 6)],
        verbose_name="困难程度"
    )
    notes = models.TextField(null=True, blank=True, verbose_name="备注")
    recorded_at = models.DateTimeField(verbose_name="记录时间")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        db_table = 'bowel_movements'
        verbose_name = "排便记录"
        verbose_name_plural = "排便记录"
        indexes = [
            models.Index(fields=['user', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()}"


class SmokingRecord(models.Model):
    """Smoking tracking."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='smoking_records')
    count = models.IntegerField(default=1, verbose_name="数量")
    mood = models.CharField(
        max_length=20,
        choices=[
            ('relaxed', '放松'),
            ('stressed', '压力大'),
            ('social', '社交'),
            ('habit', '习惯'),
            ('other', '其他'),
        ],
        null=True,
        blank=True,
        verbose_name="心情"
    )
    location = models.CharField(max_length=50, null=True, blank=True, verbose_name="地点")
    notes = models.TextField(null=True, blank=True, verbose_name="备注")
    recorded_at = models.DateTimeField(verbose_name="记录时间")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        db_table = 'smoking_records'
        verbose_name = "抽烟记录"
        verbose_name_plural = "抽烟记录"
        indexes = [
            models.Index(fields=['user', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.count}支"