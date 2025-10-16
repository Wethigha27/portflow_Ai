from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WeatherData, WeatherAlert
from .serializers import WeatherDataSerializer, WeatherAlertSerializer
from .services import OpenWeatherService

class PortWeatherView(APIView):
    """جلب بيانات الطقس لميناء معين"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, port_id):
        from ships.models import Port
        
        try:
            port = Port.objects.get(id=port_id)
            service = OpenWeatherService()
            weather_data = service.get_port_weather(port)
            
            if weather_data:
                return Response(weather_data)
            else:
                return Response(
                    {"error": "Unable to fetch weather data"}, 
                    status=404
                )
                
        except Port.DoesNotExist:
            return Response({"error": "Port not found"}, status=404)

class UpdateAllWeatherView(APIView):
    """تحديث طقس جميع الموانئ"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=403)
        
        service = OpenWeatherService()
        result = service.update_all_ports_weather()
        
        return Response({"message": result})

class WeatherAlertsView(APIView):
    """جلب إنذارات الطقس النشطة"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        alerts = WeatherAlert.objects.filter(is_active=True)
        serializer = WeatherAlertSerializer(alerts, many=True)
        return Response(serializer.data)

class PortWeatherHistoryView(APIView):
    """سجل الطقس لميناء معين"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, port_id):
        weather_history = WeatherData.objects.filter(port_id=port_id).order_by('-recorded_at')[:10]
        serializer = WeatherDataSerializer(weather_history, many=True)
        return Response(serializer.data)