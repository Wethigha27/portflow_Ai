from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Port, Ship
from .serializers import PortSerializer, ShipSerializer
from .services import MarineTrafficService
from django.utils import timezone

class PortListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    
    def get_queryset(self):
        queryset = Port.objects.all()
        
        search = self.request.query_params.get('search', None)
        country = self.request.query_params.get('country', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(city__icontains=search) |
                Q(country__icontains=search)
            )
        
        if country:
            queryset = queryset.filter(country__iexact=country)
            
        return queryset

class PortDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Port.objects.all()
    serializer_class = PortSerializer

class ShipListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Ship.objects.all()
    serializer_class = ShipSerializer
    
    def get_queryset(self):
        queryset = Ship.objects.all()
        
        search = self.request.query_params.get('search', None)
        ship_type = self.request.query_params.get('type', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(imo_number__icontains=search)
            )
        
        if ship_type:
            queryset = queryset.filter(type__iexact=ship_type)
            
        return queryset

class ShipDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Ship.objects.all()
    serializer_class = ShipSerializer

class SearchShipView(APIView):
    """بحث مباشر عن سفينة في MarineTraffic"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        search_type = request.data.get('type', 'imo')  # 'imo' أو 'name'
        query = request.data.get('query', '')
        
        if not query:
            return Response({"error": "يرجى إدخال مصطلح البحث"}, status=400)
        
        # TODO: استيراد ShipSearchService عندما ننشئه
        from .services import MarineTrafficService
        search_service = MarineTrafficService()
        
        if search_type == 'imo':
            ship_data = search_service.get_ship_position(query)
        else:
            # بحث بالاسم - نستخدم IMO مؤقتاً
            ship_data = search_service.get_ship_position(query)
        
        if ship_data:
            # حفظ السفينة في قاعدة البيانات للمستخدم
            ship, created = Ship.objects.get_or_create(
                imo_number=query,
                defaults={
                    'name': ship_data.get('name', f'سفينة {query}'),
                    'type': ship_data.get('type', 'container'),
                    'current_latitude': ship_data.get('latitude'),
                    'current_longitude': ship_data.get('longitude'), 
                    'current_speed': ship_data.get('speed'),
                    'current_heading': ship_data.get('heading'),
                }
            )
            
            # إضافة المستخدم لمتابعي السفينة
            if request.user not in ship.tracked_by.all():
                ship.tracked_by.add(request.user)
            
            return Response({
                "ship": ship_data,
                "saved_to_tracking": created,
                "source": ship_data.get('source', 'demo')
            })
        else:
            return Response({"error": "لم يتم العثور على السفينة"}, status=404)

class TrackShipView(APIView):
    """بدء تتبع سفينة من قبل المستخدم"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ship_id):
        try:
            ship = Ship.objects.get(id=ship_id)
            user = request.user
            
            if user not in ship.tracked_by.all():
                ship.tracked_by.add(user)
                return Response({"message": f"بدأت تتبع السفينة {ship.name}"})
            else:
                return Response({"message": "أنت تتابع هذه السفينة بالفعل"})
                
        except Ship.DoesNotExist:
            return Response({"error": "السفينة غير موجودة"}, status=404)

class UntrackShipView(APIView):
    """إيقاف تتبع سفينة"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ship_id):
        try:
            ship = Ship.objects.get(id=ship_id)
            user = request.user
            
            if user in ship.tracked_by.all():
                ship.tracked_by.remove(user)
                return Response({"message": f"توقفت عن تتبع السفينة {ship.name}"})
            else:
                return Response({"message": "أنت لا تتابع هذه السفينة"})
                
        except Ship.DoesNotExist:
            return Response({"error": "السفينة غير موجودة"}, status=404)

class UserTrackedShipsView(APIView):
    """السفن التي يتعقبها المستخدم"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        tracked_ships = user.tracked_ships.all()
        serializer = ShipSerializer(tracked_ships, many=True)
        return Response(serializer.data)

class ShippingStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.user_type == 'merchant':
            tracked_ships = user.tracked_ships.all()
        else:
            tracked_ships = Ship.objects.all()
        
        stats = {
            'total_tracked_ships': tracked_ships.count(),
            'ships_with_positions': tracked_ships.filter(
                current_latitude__isnull=False
            ).count(),
            'ships_in_transit': tracked_ships.filter(
                status='Underway'
            ).count(),
        }
        
        return Response(stats)

class UpdateShipPositionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=403)
        
        service = MarineTrafficService()
        result = service.update_ship_positions()
        
        return Response({"message": result})

class ShipPositionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, imo_number):
        service = MarineTrafficService()
        position_data = service.get_ship_position(imo_number)
        
        if position_data:
            return Response(position_data)
        else:
            return Response(
                {"error": "Unable to fetch ship position"}, 
                status=404
            )

class ShipTrackingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ship_id):
        try:
            ship = Ship.objects.get(id=ship_id)
            service = MarineTrafficService()
            position_data = service.get_ship_position(ship.imo_number)
            
            response_data = {
                'ship': {
                    'id': ship.id,
                    'name': ship.name,
                    'imo_number': ship.imo_number,
                    'type': ship.type
                },
                'stored_position': {
                    'latitude': ship.current_latitude,
                    'longitude': ship.current_longitude,
                    'speed': ship.current_speed,
                    'heading': ship.current_heading,
                    'last_updated': ship.last_updated
                }
            }
            
            if position_data:
                response_data['current_position'] = position_data
                
                if (position_data.get('latitude') and 
                    position_data['latitude'] != ship.current_latitude):
                    ship.current_latitude = position_data['latitude']
                    ship.current_longitude = position_data['longitude']
                    ship.current_speed = position_data['speed']
                    ship.current_heading = position_data['heading']
                    ship.last_updated = timezone.now()
                    ship.save()
            
            return Response(response_data)
            
        except Ship.DoesNotExist:
            return Response({"error": "Ship not found"}, status=404)

class PortStatsView(APIView):
    """إحصائيات الموانئ والحركة البحرية"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Count, Q
        
        port_stats = Port.objects.annotate(
            incoming_ships_count=Count('incoming_ships')
        ).values('name', 'country', 'incoming_ships_count')
        
        ship_stats = {
            'total_ships': Ship.objects.count(),
            'ships_with_positions': Ship.objects.filter(
                current_latitude__isnull=False
            ).count(),
            'ships_being_tracked': Ship.objects.filter(
                tracked_by__isnull=False
            ).distinct().count(),
        }
        
        return Response({
            'ports': list(port_stats),
            'ships': ship_stats,
            'last_updated': timezone.now()
        })
class TrackShipFromSearchView(APIView):
    """بدء تتبع سفينة من نتائج البحث"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        imo_number = request.data.get('imo')
        ship_data = request.data.get('ship_data', {})
        
        if not imo_number:
            return Response({"error": "رقم IMO مطلوب"}, status=400)
        
        try:
            # حفظ السفينة في التتبع
            ship, created = Ship.objects.get_or_create(
                imo_number=imo_number,
                defaults={
                    'name': ship_data.get('name', f'سفينة {imo_number}'),
                    'type': 'container',  # نوع افتراضي
                    'current_latitude': ship_data.get('latitude'),
                    'current_longitude': ship_data.get('longitude'),
                    'current_speed': ship_data.get('speed'),
                    'current_heading': ship_data.get('heading'),
                    'status': ship_data.get('status', 'Underway'),
                    'destination_name': ship_data.get('destination', ''),
                }
            )
            
            # إضافة المستخدم للمتابعين
            ship.tracked_by.add(request.user)
            
            return Response({
                "message": f"بدأت تتبع السفينة {ship.name}",
                "ship_id": ship.id,
                "new_ship": created
            })
            
        except Exception as e:
            return Response({"error": f"خطأ في حفظ السفينة: {str(e)}"}, status=400)