from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WeatherData(models.Model):
    port = models.ForeignKey('ships.Port', on_delete=models.CASCADE)
    temperature = models.FloatField()  # درجة الحرارة (Celsius)
    humidity = models.IntegerField()   # الرطوبة (%)
    wind_speed = models.FloatField()   # سرعة الرياح (m/s)
    wind_direction = models.IntegerField()  # اتجاه الرياح (درجات)
    weather_condition = models.CharField(max_length=100)  # "Clouds", "Rain", etc.
    description = models.CharField(max_length=200)  # وصف مفصل
    visibility = models.IntegerField()  # الرؤية (meters)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.port.name} - {self.temperature}°C - {self.weather_condition}"

class WeatherAlert(models.Model):
    ALERT_TYPES = (
        ('storm', 'عاصفة'),
        ('high_wind', 'رياح عالية'),
        ('fog', 'ضباب'),
        ('heavy_rain', 'أمطار غزيرة'),
        ('heat_wave', 'موجة حر'),
    )
    
    port = models.ForeignKey('ships.Port', on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=[('low', 'منخفض'), ('medium', 'متوسط'), ('high', 'عالٍ')])
    message = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.port.name} - {self.get_alert_type_display()} - {self.severity}"