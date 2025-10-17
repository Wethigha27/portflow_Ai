from django.contrib import admin
from .models import WeatherData, WeatherAlert

@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ('port', 'temperature', 'weather_condition', 'recorded_at')
    list_filter = ('weather_condition', 'port__country')
    search_fields = ('port__name',)

@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ('port', 'alert_type', 'severity', 'is_active', 'created_at')
    list_filter = ('alert_type', 'severity', 'is_active')
    search_fields = ('port__name', 'message')