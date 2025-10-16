from rest_framework import serializers
from .models import WeatherData, WeatherAlert

class WeatherDataSerializer(serializers.ModelSerializer):
    port_name = serializers.CharField(source='port.name', read_only=True)
    
    class Meta:
        model = WeatherData
        fields = '__all__'

class WeatherAlertSerializer(serializers.ModelSerializer):
    port_name = serializers.CharField(source='port.name', read_only=True)
    
    class Meta:
        model = WeatherAlert
        fields = '__all__'