from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.ChatRoomViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('rooms/<int:pk>/', views.ChatRoomDetailView.as_view()),
    path('rooms/<int:pk>/messages/', views.ChatMessageListView.as_view()),
    path('online/', views.OnlineUsersView.as_view()),
]