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
# 🆕 NOUVELLE VIEW: Météo du navire
class ShipWeatherView(APIView):
    """
    get:
    Obtenir la météo actuelle à la position d'un navire
    
    Retourne les conditions météorologiques exactes à l'emplacement actuel du navire
    avec température, vent, visibilité et alertes potentielles.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ship_id):
        from ships.models import Ship
        from notifications.services import NotificationService  # 🆕 IMPORT
        
        try:
            ship = Ship.objects.get(id=ship_id)
            
            # Vérifier que l'utilisateur suit ce navire ou est admin
            if not (request.user.is_staff or ship.is_tracked_by_user(request.user)):
                return Response(
                    {"error": "Vous ne suivez pas ce navire"}, 
                    status=403
                )
            
            service = OpenWeatherService()
            
            if ship.current_latitude and ship.current_longitude:
                weather_data = service.get_weather_by_coordinates(
                    ship.current_latitude, 
                    ship.current_longitude, 
                    ship=ship
                )
                
                if weather_data:
                    # 🆕 INTÉGRATION NOTIFICATIONS - Alertes automatiques
                    notification_service = NotificationService()
                    weather_issues = []
                    
                    if weather_data.get('wind_speed', 0) > 15:
                        weather_issues.append(f"Vents forts: {weather_data['wind_speed']} m/s")
                    
                    if weather_data.get('visibility', 10000) < 2000:
                        weather_issues.append(f"Brouillard: visibilité {weather_data['visibility']}m")
                    
                    if weather_issues:
                        notification_service.send_route_weather_alert(ship, weather_issues)
                    
                    return Response(weather_data)
                else:
                    return Response(
                        {"error": "Impossible de récupérer les données météo"}, 
                        status=404
                    )
            else:
                return Response(
                    {"error": "Position du navire non disponible"}, 
                    status=404
                )
                
        except Ship.DoesNotExist:
            return Response({"error": "Navire non trouvé"}, status=404)

# 🆕 NOUVELLE VIEW: Analyse météo du parcours
class ShipRouteWeatherView(APIView):
    """
    get:
    Analyser la météo sur le parcours complet d'un navire
    
    Évalue les conditions météorologiques sur l'ensemble du trajet
    entre la position actuelle et le port de destination.
    Retourne les problèmes potentiels et l'impact sur le temps de voyage.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ship_id):
        from ships.models import Ship
        
        try:
            ship = Ship.objects.get(id=ship_id)
            
            # Vérifier que l'utilisateur suit ce navire ou est admin
            if not (request.user.is_staff or ship.is_tracked_by_user(request.user)):
                return Response(
                    {"error": "Vous ne suivez pas ce navire"}, 
                    status=403
                )
            
            if not (ship.current_latitude and ship.current_longitude and ship.destination_port):
                return Response(
                    {"error": "Données de parcours incomplètes"}, 
                    status=400
                )
            
            service = OpenWeatherService()
            
            route_analysis = service.get_route_weather_analysis(
                start_lat=ship.current_latitude,
                start_lon=ship.current_longitude,
                end_lat=ship.destination_port.latitude,
                end_lon=ship.destination_port.longitude
            )
            
            if route_analysis:
                # 🆕 Les notifications sont déjà gérées dans get_route_weather_analysis
                return Response(route_analysis)
            else:
                return Response(
                    {"error": "Impossible d'analyser la météo du parcours"}, 
                    status=404
                )
                
        except Ship.DoesNotExist:
            return Response({"error": "Navire non trouvé"}, status=404)

# 🆕 NOUVELLE VIEW: Alertes météo pour un navire
class ShipWeatherAlertsView(APIView):
    """
    get:
    Obtenir les alertes météo actives pour un navire
    
    Retourne les alertes météorologiques spécifiques à la zone
    où se trouve le navire et sur son parcours.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ship_id):
        from ships.models import Ship
        
        try:
            ship = Ship.objects.get(id=ship_id)
            
            # Vérifier que l'utilisateur suit ce navire ou est admin
            if not (request.user.is_staff or ship.is_tracked_by_user(request.user)):
                return Response(
                    {"error": "Vous ne suivez pas ce navire"}, 
                    status=403
                )
            
            # Récupérer les données météo récentes pour ce navire
            recent_weather = WeatherData.objects.filter(
                ship=ship
            ).order_by('-recorded_at').first()
            
            alerts = []
            
            if recent_weather:
                # Vérifier les conditions pour des alertes
                if recent_weather.wind_speed > 15:
                    alerts.append({
                        'type': 'high_wind',
                        'severity': 'high',
                        'message': f'Vents forts: {recent_weather.wind_speed} m/s',
                        'ship_position': f"{ship.current_latitude}, {ship.current_longitude}"
                    })
                
                if recent_weather.visibility < 2000:
                    alerts.append({
                        'type': 'fog', 
                        'severity': 'medium',
                        'message': f'Brouillard - Visibilité: {recent_weather.visibility}m',
                        'ship_position': f"{ship.current_latitude}, {ship.current_longitude}"
                    })
            
            return Response({
                'ship_id': ship.id,
                'ship_name': ship.name,
                'current_position': f"{ship.current_latitude}, {ship.current_longitude}",
                'active_alerts': alerts,
                'alert_count': len(alerts)
            })
                
        except Ship.DoesNotExist:
            return Response({"error": "Navire non trouvé"}, status=404)
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