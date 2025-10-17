from django.utils import timezone
from django.contrib.auth import get_user_model
from ships.models import Ship
from weather.models import WeatherAlert
from .models import Notification
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)
User = get_user_model()

class NotificationService:
    """خدمة الإشعارات التلقائية لنظام تتبع السفن"""
    
    def check_ship_delays(self):
        """التحقق من السفن المتأخرة بناءً على وقت الوصول المتوقع"""
        try:
            # السفن التي تجاوزت وقت الوصول المتوقع
            delayed_ships = Ship.objects.filter(
                expected_arrival__lt=timezone.now(),
                destination_port__isnull=False
            )
            
            notifications_created = 0
            for ship in delayed_ships:
                # لكل مستخدم يتعقب هذه السفينة
                for user in ship.tracked_by.all():
                    # تحقق إذا كان هناك إشعار سابق لنفس التأخير (في آخر 24 ساعة)
                    recent_notification = Notification.objects.filter(
                        user=user,
                        notification_type='delay',
                        related_ship=ship,
                        created_at__gte=timezone.now() - timedelta(hours=24)
                    ).exists()
                    
                    if not recent_notification:
                        # إنشاء إشعار تأخير جديد
                        Notification.objects.create(
                            user=user,
                            title=f"تأخير في السفينة {ship.name}",
                            message=f"السفينة {ship.name} متأخرة عن الوصول المتوقع إلى {ship.destination_port.name if ship.destination_port else 'الوجهة'}",
                            notification_type='delay',
                            severity='high',
                            related_ship=ship,
                            metadata={
                                'expected_arrival': ship.expected_arrival.isoformat() if ship.expected_arrival else None,
                                'current_delay_hours': self._calculate_delay_hours(ship)
                            }
                        )
                        notifications_created += 1
                        logger.info(f"تم إنشاء إشعار تأخير للسفينة {ship.name} للمستخدم {user.username}")
            
            return f"تم إنشاء {notifications_created} إشعار تأخير"
            
        except Exception as e:
            logger.error(f"خطأ في التحقق من تأخيرات السفن: {e}")
            return f"خطأ: {e}"
    
    def _calculate_delay_hours(self, ship):
        """حساب عدد ساعات التأخير"""
        if ship.expected_arrival:
            delay = timezone.now() - ship.expected_arrival
            return max(0, delay.total_seconds() / 3600)  # التحويل لساعات
        return 0
    
    def check_weather_alerts_for_ships(self):
        """إرسال إشعارات إنذارات الطقس للسفن المتأثرة"""
        try:
            active_alerts = WeatherAlert.objects.filter(is_active=True)
            notifications_created = 0
            
            for alert in active_alerts:
                # البحث عن السفن القريبة من منطقة الإنذار (في نطاق 3 درجات)
                nearby_ships = Ship.objects.filter(
                    current_latitude__isnull=False,
                    current_longitude__isnull=False,
                    current_latitude__range=(alert.port.latitude-3, alert.port.latitude+3),
                    current_longitude__range=(alert.port.longitude-3, alert.port.longitude+3)
                )
                
                for ship in nearby_ships:
                    # لكل مستخدم يتعقب هذه السفينة
                    for user in ship.tracked_by.all():
                        # تحقق من عدم وجود إشعار طقس حديث لنفس السفينة
                        recent_weather_notification = Notification.objects.filter(
                            user=user,
                            notification_type='weather',
                            related_ship=ship,
                            created_at__gte=timezone.now() - timedelta(hours=6)
                        ).exists()
                        
                        if not recent_weather_notification:
                            Notification.objects.create(
                                user=user,
                                title=f"إنذار طقس - {ship.name}",
                                message=f"{alert.message} - قد يؤثر على سفينتك المتعقبة {ship.name} في منطقة {alert.port.name}",
                                notification_type='weather',
                                severity=alert.severity,
                                related_ship=ship,
                                metadata={
                                    'alert_type': alert.alert_type,
                                    'port_name': alert.port.name,
                                    'port_country': alert.port.country
                                }
                            )
                            notifications_created += 1
            
            return f"تم إنشاء {notifications_created} إشعار طقس"
            
        except Exception as e:
            logger.error(f"خطأ في إشعارات الطقس للسفن: {e}")
            return f"خطأ: {e}"
    
    def send_ship_position_update(self, ship, old_position=None):
        """إرسال إشعار بتحديث موقع السفينة للمستخدمين المتعقبين"""
        try:
            notifications_created = 0
            
            # فقط أرسل إشعارات إذا كانت السفينة لها متابعين
            if ship.tracked_by.exists():
                for user in ship.tracked_by.all():
                    Notification.objects.create(
                        user=user,
                        title=f"تحديث موقع - {ship.name}",
                        message=f"تم تحديث موقع السفينة {ship.name} - الاتجاه: {ship.current_heading or 'غير معروف'}° - السرعة: {ship.current_speed or 'غير معروف'} عقدة",
                        notification_type='position',
                        severity='low',
                        related_ship=ship,
                        metadata={
                            'latitude': ship.current_latitude,
                            'longitude': ship.current_longitude,
                            'speed': ship.current_speed,
                            'heading': ship.current_heading,
                            'position_changed': old_position is not None
                        }
                    )
                    notifications_created += 1
            
            return f"تم إرسال إشعارات تحديث الموقع لـ {notifications_created} مستخدم"
            
        except Exception as e:
            logger.error(f"خطأ في إشعارات الموقع: {e}")
            return f"خطأ: {e}"
    
    def send_ship_arrival_notification(self, ship):
        """إرسال إشعار وصول السفينة"""
        try:
            notifications_created = 0
            
            for user in ship.tracked_by.all():
                Notification.objects.create(
                    user=user,
                    title=f"وصول السفينة {ship.name}",
                    message=f"السفينة {ship.name} قد وصلت إلى {ship.destination_port.name if ship.destination_port else 'الوجهة'}",
                    notification_type='arrival',
                    severity='medium',
                    related_ship=ship,
                    metadata={
                        'destination': ship.destination_port.name if ship.destination_port else None,
                        'arrival_time': timezone.now().isoformat()
                    }
                )
                notifications_created += 1
            
            return f"تم إرسال إشعارات الوصول لـ {notifications_created} مستخدم"
            
        except Exception as e:
            logger.error(f"خطأ في إشعارات الوصول: {e}")
            return f"خطأ: {e}"
    
    def send_eta_change_notification(self, ship, old_eta, new_eta):
        """إرسال إشعار تغيير وقت الوصول المتوقع"""
        try:
            notifications_created = 0
            
            for user in ship.tracked_by.all():
                Notification.objects.create(
                    user=user,
                    title=f"تغيير وقت الوصول - {ship.name}",
                    message=f"تم تغيير وقت الوصول المتوقع للسفينة {ship.name} من {old_eta.strftime('%Y-%m-%d %H:%M')} إلى {new_eta.strftime('%Y-%m-%d %H:%M')}",
                    notification_type='eta_change',
                    severity='medium',
                    related_ship=ship
                )
                notifications_created += 1
            
            return f"تم إرسال إشعارات تغيير وقت الوصول لـ {notifications_created} مستخدم"
            
        except Exception as e:
            logger.error(f"خطأ في إشعارات تغيير وقت الوصول: {e}")
            return f"خطأ: {e}"
    
    def send_departure_notification(self, ship, departure_port):
        """إرسال إشعار مغادرة السفينة"""
        try:
            notifications_created = 0
            
            for user in ship.tracked_by.all():
                Notification.objects.create(
                    user=user,
                    title=f"مغادرة السفينة {ship.name}",
                    message=f"السفينة {ship.name} قد غادرت {departure_port.name} متجهة إلى {ship.destination_port.name if ship.destination_port else 'الوجهة التالية'}",
                    notification_type='departure',
                    severity='low',
                    related_ship=ship
                )
                notifications_created += 1
            
            return f"تم إرسال إشعارات المغادرة لـ {notifications_created} مستخدم"
            
        except Exception as e:
            logger.error(f"خطأ في إشعارات المغادرة: {e}")
            return f"خطأ: {e}"