from django.urls import path
from . import views

urlpatterns = [
    # Activity endpoints
    path('', views.activity_list, name='activity-list'),
    path('create/', views.create_activity, name='create-activity'),

    # Water intake endpoints
    path('water/', views.water_intake_list, name='water-intake-list'),
    path('water/create/', views.create_water_intake, name='create-water-intake'),
    path('water/summary/', views.water_summary, name='water-summary'),

    # Bowel movement endpoints
    path('bowel/', views.bowel_movement_list, name='bowel-movement-list'),
    path('bowel/create/', views.create_bowel_movement, name='create-bowel-movement'),

    # Smoking record endpoints
    path('smoking/', views.smoking_record_list, name='smoking-record-list'),
    path('smoking/create/', views.create_smoking_record, name='create-smoking-record'),
    path('slack/', views.slack_record_list, name='slack-record-list'),
    path('slack/create/', views.create_slack_record, name='create-slack-record'),

    # Statistics
    path('statistics/', views.statistics, name='activity-statistics'),

    # Drink options
    path('drinks/', views.drink_options_view, name='drink-options'),
    path('drinks/<int:pk>/', views.drink_option_detail, name='drink-option-detail'),
]
