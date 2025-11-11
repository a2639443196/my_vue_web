from django.urls import path
from . import views

urlpatterns = [
    # Profile endpoints
    path('profile/', views.profile, name='user-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),

    # User management endpoints
    path('', views.user_list, name='user-list'),
    path('<int:user_id>/', views.user_detail, name='user-detail'),
]