import requests
from django.conf import settings
from django.utils import timezone
from .models import WeatherData, WeatherAlert
import random

class OpenWeatherService:
    def __init__(self):
        self.api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'demo_key')
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    def get_port_weather(self, port):
        """جلب بيانات الطقس لميناء معين من OpenWeatherMap الحقيقي"""
        try:
            # استخدام API الحقيقي مع المفتاح الجديد
            url = f"{self.base_url}/weather"
            params = {
                'lat': port.latitude,
                'lon': port.longitude,
                'appid': self.api_key,
                'units': 'metric',  # درجة مئوية
                'lang': 'ar'  # اللغة العربية
            }
            
            print(f"🌤️ جلب بيانات الطقس للميناء: {port.name}")
            print(f"🔗 الرابط: {url}")
            print(f"📍 الإحداثيات: {port.latitude}, {port.longitude}")
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ تم جلب بيانات الطقس بنجاح لـ {port.name}")
                return self._parse_weather_data(data, port)
            else:
                print(f"❌ خطأ في API: {response.status_code} - {response.text}")
                return self._get_demo_weather(port)  # استخدام البيانات الوهمية عند الخطأ
                
        except Exception as e:
            print(f"❌ خطأ في خدمة الطقس: {e}")
            return self._get_demo_weather(port)
    
    def _parse_weather_data(self, data, port):
        """تحويل بيانات API الحقيقية إلى تنسيقنا"""
        try:
            weather_info = {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed'],
                'wind_direction': data['wind'].get('deg', 0),
                'weather_condition': data['weather'][0]['main'],
                'description': data['weather'][0]['description'],
                'visibility': data.get('visibility', 10000),
                'pressure': data['main']['pressure'],
                'feels_like': data['main']['feels_like'],
                'port_id': port.id,
                'source': 'openweathermap',
                'city_name': data.get('name', port.name)
            }
            
            # حفظ في قاعدة البيانات
            weather_data = WeatherData.objects.create(
                port=port,
                temperature=weather_info['temperature'],
                humidity=weather_info['humidity'],
                wind_speed=weather_info['wind_speed'],
                wind_direction=weather_info['wind_direction'],
                weather_condition=weather_info['weather_condition'],
                description=weather_info['description'],
                visibility=weather_info['visibility']
            )
            
            print(f"💾 تم حفظ بيانات الطقس في قاعدة البيانات: {port.name}")
            
            # التحقق من إنذارات الطقس
            self._check_weather_alerts(weather_data, port)
            
            return weather_info
            
        except KeyError as e:
            print(f"❌ خطأ في تحليل بيانات API: {e}")
            return self._get_demo_weather(port)
    
    def _get_demo_weather(self, port):
        """بيانات طقس وهمية للطوارئ فقط"""
        print(f"🔄 استخدام البيانات الوهمية لـ {port.name}")
        
        weather_patterns = [
            {'condition': 'Clear', 'desc': 'صافي', 'temp_range': (25, 35), 'humidity_range': (40, 70)},
            {'condition': 'Clouds', 'desc': 'غائم جزئياً', 'temp_range': (22, 30), 'humidity_range': (50, 80)},
            {'condition': 'Rain', 'desc': 'أمطار خفيفة', 'temp_range': (20, 28), 'humidity_range': (70, 90)},
        ]
        
        pattern = random.choice(weather_patterns)
        temp = random.randint(pattern['temp_range'][0], pattern['temp_range'][1])
        humidity = random.randint(pattern['humidity_range'][0], pattern['humidity_range'][1])
        wind_speed = round(random.uniform(2.0, 12.0), 1)
        
        weather_info = {
            'temperature': temp,
            'humidity': humidity,
            'wind_speed': wind_speed,
            'wind_direction': random.randint(0, 360),
            'weather_condition': pattern['condition'],
            'description': pattern['desc'],
            'visibility': random.randint(5000, 15000),
            'pressure': 1013,
            'feels_like': temp + random.randint(-2, 2),
            'port_id': port.id,
            'source': 'demo_mode',
            'city_name': port.name
        }
        
        # حفظ في قاعدة البيانات
        weather_data = WeatherData.objects.create(
            port=port,
            temperature=weather_info['temperature'],
            humidity=weather_info['humidity'],
            wind_speed=weather_info['wind_speed'],
            wind_direction=weather_info['wind_direction'],
            weather_condition=weather_info['weather_condition'],
            description=weather_info['description'],
            visibility=weather_info['visibility']
        )
        
        self._check_weather_alerts(weather_data, port)
        
        return weather_info
    
    def _check_weather_alerts(self, weather_data, port):
        """التحقق من وجود حالات طقس خطيرة"""
        alerts = []
        
        # رياح عالية
        if weather_data.wind_speed > 15:
            alerts.append(('high_wind', 'high', f"رياح عالية: {weather_data.wind_speed} m/s"))
        
        # ضباب (رؤية منخفضة)
        if weather_data.visibility < 1000:
            alerts.append(('fog', 'medium', f"ضباب - رؤية: {weather_data.visibility}m"))
        
        # أمطار غزيرة
        if 'rain' in weather_data.weather_condition.lower():
            alerts.append(('heavy_rain', 'medium', "أمطار غزيرة"))
        
        # حفظ الإنذارات
        for alert_type, severity, message in alerts:
            WeatherAlert.objects.create(
                port=port,
                alert_type=alert_type,
                severity=severity,
                message=message,
                start_time=timezone.now(),
                end_time=timezone.now() + timezone.timedelta(hours=6),
                is_active=True
            )
            
            print(f"🚨 إنذار طقس: {message} في {port.name}")
    
    def update_all_ports_weather(self):
        """تحديث طقس جميع الموانئ"""
        from ships.models import Port
        
        ports = Port.objects.all()
        updated_count = 0
        results = []
        
        print(f"🌍 بدء تحديث الطقس لـ {ports.count()} موانئ...")
        
        for port in ports:
            weather_data = self.get_port_weather(port)
            if weather_data:
                updated_count += 1
                results.append({
                    'port': port.name,
                    'temperature': weather_data['temperature'],
                    'condition': weather_data['weather_condition'],
                    'source': weather_data.get('source', 'unknown')
                })
        
        print(f"✅ تم تحديث طقس {updated_count} من أصل {ports.count()} ميناء")
        
        return {
            'updated_count': updated_count,
            'total_ports': ports.count(),
            'results': results
        }