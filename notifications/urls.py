from django.urls import path
from . import views

urlpatterns = [
    # الإشعارات
    path('notifications/', views.UserNotificationsView.as_view(), name='user-notifications'),
    path('notifications/<int:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/unread-count/', views.UnreadNotificationsCountView.as_view(), name='unread-count'),
    
    # الرسائل
    path('messages/', views.MessageListCreateView.as_view(), name='messages'),
    
    # الإشعارات التلقائية (للالإدارة)
    path('check-delays/', views.CheckDelayedShipsView.as_view(), name='check-delays'),
    path('check-weather-alerts/', views.CheckWeatherAlertsView.as_view(), name='check-weather-alerts'),
]