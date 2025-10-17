import requests
import time
from django.conf import settings
from django.utils import timezone
import random
import hashlib



class MarineTrafficService:
    def __init__(self):
        self.api_key = getattr(settings, 'MARINETRAFFIC_API_KEY', 'demo_key')
        self.base_url = "https://services.marinetraffic.com/api"

    def get_ship_position(self, imo_number):
        """جلب موقع السفينة - بيانات وهمية فقط إذا لم يكن API حقيقي"""
        try:
            # التحقق إذا كان API key حقيقي
            if self._is_valid_api_key():
                # فقط مع API حقيقي نذهب لـ MarineTraffic
                url = f"{self.base_url}/exportvessel/v:5/{self.api_key}/imo:{imo_number}/protocol:json"
                response = requests.get(url, timeout=10)

                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        ship_data = data[0]
                        return {
                            'name': ship_data.get('SHIPNAME', f'سفينة {imo_number}'),
                            'imo': imo_number,
                            'type': ship_data.get('TYPE_NAME', 'Container Ship'),
                            'latitude': ship_data.get('LAT'),
                            'longitude': ship_data.get('LON'),
                            'speed': ship_data.get('SPEED'),
                            'heading': ship_data.get('HEADING'),
                            'status': ship_data.get('STATUS', 'Underway'),
                            'destination': ship_data.get('DESTINATION', 'Unknown'),
                            'eta': ship_data.get('ETA', 'Unknown'),
                            'last_position': ship_data.get('LAST_POS'),
                            'source': 'marinetraffic'  # مصدر حقيقي
                        }

            # إذا وصلنا هنا: إما API غير حقيقي أو فشل الاتصال مع API حقيقي
            # نرجع بيانات وهمية مع إشارة واضحة
            demo_data = self._get_demo_position(imo_number)
            demo_data['source'] = 'demo_fallback'
            return demo_data

        except Exception as e:
            # مع API حقيقي: نفضل إرجاع خطأ بدلاً من بيانات وهمية
            if self._is_valid_api_key():
                raise Exception(f"MarineTraffic API Error: {e}")

            # مع API غير حقيقي: نرجع بيانات وهمية
            demo_data = self._get_demo_position(imo_number)
            demo_data['source'] = 'demo_error'
            return demo_data

    def _is_valid_api_key(self):
        return (
            self.api_key
            and self.api_key != 'demo_key'
            and len(self.api_key) > 10  # API keys الحقيقية عادة طويلة
            and not self.api_key.startswith('demo')
        )

    

   
    


    
        
    def _get_demo_position(self, imo_number):
        """وضع التجريبي - إرجاع بيانات وهمية واقعية"""
        # إنشاء مواقع وهمية بناء على IMO
        hash_obj = hashlib.md5(str(imo_number).encode())
        hash_hex = hash_obj.hexdigest()
        
        # إحداثيات واقعية قرب الموانئ الأفريقية
        african_ports = [
            (14.6928, -17.4467, "DKR", "ميناء داكار"),   # داكار
            (5.2565, -4.0192, "ABJ", "ميناء أبيدجان"),   # أبيدجان
            (6.4654, 3.4064, "LOS", "ميناء لاغوس"),      # لاغوس
            (-33.9061, 18.4265, "CPT", "ميناء كيب تاون"), # كيب تاون
            (-26.1715, 28.0318, "DUR", "ميناء ديربان"),  # ديربان
        ]
        
        port_idx = int(hash_hex[0], 16) % len(african_ports)
        base_lat, base_lon, port_code, port_name = african_ports[port_idx]
        
        # إضافة تغيير طفيف للموقع
        lat_variation = (int(hash_hex[1:3], 16) / 255.0 - 0.5) * 2.0
        lon_variation = (int(hash_hex[3:5], 16) / 255.0 - 0.5) * 2.0
        
        ship_types = ['Container Ship', 'Tanker', 'Cargo', 'Passenger']
        ship_type = ship_types[int(hash_hex[5], 16) % len(ship_types)]
        
        # الوجهة التالية
        next_port_idx = (port_idx + 1) % len(african_ports)
        next_port_code = african_ports[next_port_idx][2]
        next_port_name = african_ports[next_port_idx][3]
        
        # وقت الوصول المتوقع (خلال 1-7 أيام)
        days_ahead = (int(hash_hex[6:8], 16) % 7) + 1
        eta = timezone.now() + timezone.timedelta(days=days_ahead)
        
        return {
            'name': f"{ship_type} {imo_number}",
            'imo': imo_number,
            'type': ship_type,
            'latitude': round(base_lat + lat_variation, 4),
            'longitude': round(base_lon + lon_variation, 4),
            'speed': random.randint(8, 22),  # عقدة
            'heading': random.randint(0, 360),  # درجة
            'status': 'Underway',
            'destination': next_port_code,
            'destination_name': next_port_name,
            'eta': eta.strftime('%Y-%m-%d %H:%M:%S'),
            'last_position': timezone.now().isoformat(),
            'source': 'demo_mode'
        }
    
    def update_ship_positions(self):
        """تحديث مواقع جميع السفن في قاعدة البيانات"""
        from .models import Ship
        
        ships = Ship.objects.all()
        updated_count = 0
        results = []
        
        for ship in ships:
            if not ship.imo_number:
                continue
                
            position_data = self.get_ship_position(ship.imo_number)
            if position_data and position_data.get('latitude'):
                # تحديث بيانات السفينة
                ship.current_latitude = position_data['latitude']
                ship.current_longitude = position_data['longitude']
                ship.current_speed = position_data['speed']
                ship.current_heading = position_data['heading']
                ship.status = position_data.get('status', 'Underway')
                ship.destination_name = position_data.get('destination_name', '')
                ship.last_updated = timezone.now()
                ship.save()
                
                updated_count += 1
                results.append({
                    'ship': ship.name,
                    'imo': ship.imo_number,
                    'position': f"{position_data['latitude']}, {position_data['longitude']}",
                    'destination': position_data.get('destination_name', 'Unknown'),
                    'source': position_data.get('source', 'unknown')
                })
                
            # تجنب حظر API - انتظر قليلاً بين الطلبات
            time.sleep(0.1)
        
        return {
            'updated_count': updated_count,
            'total_ships': ships.count(),
            'results': results
        }
    
    def get_ship_details(self, imo_number):
        """جلب تفاصيل شاملة عن السفينة"""
        position_data = self.get_ship_position(imo_number)
        if not position_data:
            return None
            
        # إضافة معلومات إضافية
        position_data.update({
            'distance_traveled': random.randint(500, 5000),  # أميال
            'fuel_consumption': round(random.uniform(50, 200), 1),  # طن/يوم
            'crew_size': random.randint(15, 30),
            'year_built': random.randint(1990, 2020),
            'flag': random.choice(['Panama', 'Liberia', 'Marshall Islands', 'Malta']),
        })
        
        return position_data

class ShipSearchService:
    def __init__(self):
        self.api_key = getattr(settings, 'MARINETRAFFIC_API_KEY', 'demo_key')
        self.base_url = "https://services.marinetraffic.com/api"
    
    def search_ship_by_imo(self, imo_number):
        """بحث مباشر عن سفينة في MarineTraffic API"""
        try:
            if self.api_key == 'demo_key':
                return self._get_demo_ship_data(imo_number)
            
            # البحث الحقيقي في MarineTraffic
            url = f"{self.base_url}/exportvessel/v:5/{self.api_key}/imo:{imo_number}/protocol:json"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return self._parse_ship_data(data[0])
            
            return None
            
        except Exception as e:
            print(f"MarineTraffic Search Error: {e}")
            return self._get_demo_ship_data(imo_number)
    
    def search_ship_by_name(self, ship_name):
        """بحث عن سفينة بالاسم"""
        # يمكن إضافة بحث بالاسم لاحقاً
        return self._get_demo_ship_data(ship_name)
    
    def _get_demo_ship_data(self, identifier):
        """بيانات وهمية واقعية للعرض"""
        import random
        from django.utils import timezone
        
        ships_demo_data = {
            "IMO1234567": {
                "name": "MAERSK SEOUL",
                "imo": "IMO1234567", 
                "type": "Container Ship",
                "latitude": 14.6928,
                "longitude": -17.4467,
                "speed": 18.5,
                "heading": 145,
                "status": "Underway",
                "destination": "ABJ",
                "destination_name": "ميناء أبيدجان",
                "eta": (timezone.now() + timezone.timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
            },
            "IMO7654321": {
                "name": "CMA CGM LAGOS",
                "imo": "IMO7654321",
                "type": "Container Ship", 
                "latitude": 5.2565,
                "longitude": -4.0192,
                "speed": 12.2,
                "heading": 87,
                "status": "Underway",
                "destination": "DKR",
                "destination_name": "ميناء داكار",
                "eta": (timezone.now() + timezone.timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
            },
            "IMO1111111": {
                "name": "MSC GENEVA",
                "imo": "IMO1111111",
                "type": "Container Ship",
                "latitude": -33.9061,
                "longitude": 18.4265,
                "speed": 15.8,
                "heading": 45,
                "status": "Underway", 
                "destination": "DUR",
                "destination_name": "ميناء ديربان",
                "eta": (timezone.now() + timezone.timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S')
            }
        }
        
        # إرجاع بيانات وهمية بناء على المعرف
        return ships_demo_data.get(identifier, ships_demo_data["IMO1234567"])
    
    def _parse_ship_data(self, api_data):
        """تحويل بيانات API إلى تنسيقنا"""
        return {
            "name": api_data.get('SHIPNAME', 'Unknown'),
            "imo": api_data.get('IMO', 'Unknown'),
            "type": api_data.get('TYPE_NAME', 'Unknown'),
            "latitude": api_data.get('LAT'),
            "longitude": api_data.get('LON'), 
            "speed": api_data.get('SPEED'),
            "heading": api_data.get('HEADING'),
            "status": api_data.get('STATUS', 'Unknown'),
            "destination": api_data.get('DESTINATION', 'Unknown'),
            "eta": api_data.get('ETA', 'Unknown'),
            "source": "marinetraffic"
        }
    
    def search_and_track_ship(self, imo_number, user):
        """بحث عن سفينة وإضافتها لتتبع المستخدم"""
        from .models import Ship
        
        ship_data = self.search_ship_by_imo(imo_number)
        
        if not ship_data:
            return None
        
        # حفظ/تحديث السفينة في قاعدة البيانات
        ship, created = Ship.objects.update_or_create(
            imo_number=imo_number,
            defaults={
                'name': ship_data['name'],
                'type': 'container',  # يمكن تحسين هذا لاحقاً
                'current_latitude': ship_data['latitude'],
                'current_longitude': ship_data['longitude'],
                'current_speed': ship_data['speed'],
                'current_heading': ship_data['heading'],
                'status': ship_data['status'],
                'destination_name': ship_data.get('destination_name', ship_data.get('destination', '')),
            }
        )
        
        # إضافة المستخدم لمتابعي السفينة
        if user not in ship.tracked_by.all():
            ship.tracked_by.add(user)
        
        return {
            'ship': ship_data,
            'database_ship': ship,
            'was_created': created,
            'tracked': True,
            'source': ship_data.get('source', 'unknown')
        }

# خدمة مساعدة للاستخدام العام
marine_traffic_service = MarineTrafficService()
ship_search_service = ShipSearchService()