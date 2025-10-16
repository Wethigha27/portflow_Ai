from django.urls import path
from . import views

urlpatterns = [
    path('port/<int:port_id>/', views.PortWeatherView.as_view(), name='port-weather'),
    path('update-all/', views.UpdateAllWeatherView.as_view(), name='update-all-weather'),
    path('alerts/', views.WeatherAlertsView.as_view(), name='weather-alerts'),
    path('history/<int:port_id>/', views.PortWeatherHistoryView.as_view(), name='weather-history'),
]