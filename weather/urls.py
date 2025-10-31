from django.urls import path
from . import views

urlpatterns = [

    path('port/<int:port_id>/', views.PortWeatherView.as_view(), name='port-weather'),
    path('update-all/', views.UpdateAllWeatherView.as_view(), name='update-all-weather'),
    path('alerts/', views.WeatherAlertsView.as_view(), name='weather-alerts'),
    path('history/<int:port_id>/', views.PortWeatherHistoryView.as_view(), name='weather-history'),

    # Ports
    path('port/<int:port_id>/', views.PortWeatherView.as_view(), name='port-weather'),
    path('history/<int:port_id>/', views.PortWeatherHistoryView.as_view(), name='weather-history'),
    
    # 🆕 NOUVELLES URLs pour les navires
    path('ship/<int:ship_id>/', views.ShipWeatherView.as_view(), name='ship-weather'),
    path('ship/<int:ship_id>/route/', views.ShipRouteWeatherView.as_view(), name='ship-route-weather'),
    path('ship/<int:ship_id>/alerts/', views.ShipWeatherAlertsView.as_view(), name='ship-weather-alerts'),
    
    # Alertes et mise à jour
    path('alerts/', views.WeatherAlertsView.as_view(), name='weather-alerts'),
    path('alerts/active/', views.ActiveWeatherAlertsView.as_view(), name='weather-alerts-active'),
    path('update-all/', views.UpdateAllWeatherView.as_view(), name='update-all-weather'),
    
    # Stats and current weather
    path('current/', views.AllCurrentWeatherView.as_view(), name='weather-current-all'),
    path('stats/', views.WeatherStatsView.as_view(), name='weather-stats'),

]