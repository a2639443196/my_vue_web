from django.urls import path
from . import views

urlpatterns = [
    # Game records
    path('', views.game_record_list, name='game-record-list'),
    path('create/', views.create_game_record, name='create-game-record'),
    path('leaderboard/', views.game_leaderboard, name='game-leaderboard'),

    # Specific game records
    path('schulte/', views.schulte_records, name='schulte-records'),
    path('reaction-time/', views.reaction_time_records, name='reaction-time-records'),
    path('memory-flip/', views.memory_flip_records, name='memory-flip-records'),
    path('sudoku/', views.sudoku_records, name='sudoku-records'),

    # Statistics
    path('statistics/', views.statistics, name='game-statistics'),
]