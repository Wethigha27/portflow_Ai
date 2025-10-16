from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Port(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    code = models.CharField(max_length=10, unique=True)
    
    def __str__(self):
        return f"{self.name}, {self.country}"

class Ship(models.Model):
    SHIP_TYPES = (
        ('container', 'حاوية'),
        ('tanker', 'ناقلة'),
        ('cargo', 'بضائع عامة'),
        ('passenger', 'ركاب'),
        ('fishing', 'صيد'),
        ('other', 'أخرى'),
    )
    
    # المعلومات الأساسية
    name = models.CharField(max_length=100)
    imo_number = models.CharField(max_length=10, unique=True)
    type = models.CharField(max_length=20, choices=SHIP_TYPES, default='container')
    
    # الموقع والحركة الحالية
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    current_speed = models.FloatField(null=True, blank=True)  # في العقدة
    current_heading = models.FloatField(null=True, blank=True)  # بالدرجات
    status = models.CharField(max_length=50, blank=True, default='Underway')
    
    # الوجهة والتوقعات
    destination_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_ships')
    destination_name = models.CharField(max_length=100, blank=True)  # اسم الوجهة من MarineTraffic
    expected_arrival = models.DateTimeField(null=True, blank=True)
    
    # التتبع والإدارة
    tracked_by = models.ManyToManyField(User, related_name='tracked_ships', blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # معلومات إضافية
    length = models.FloatField(null=True, blank=True)  # طول السفينة
    width = models.FloatField(null=True, blank=True)   # عرض السفينة
    draft = models.FloatField(null=True, blank=True)   # غاطس السفينة
    
    class Meta:
        ordering = ['-last_updated']
        verbose_name = 'سفينة'
        verbose_name_plural = 'سفن'
    
    def __str__(self):
        return f"{self.name} (IMO: {self.imo_number})"
    
    def get_current_position(self):
        """الحصول على الموقع الحالي كـ tuple"""
        if self.current_latitude and self.current_longitude:
            return (self.current_latitude, self.current_longitude)
        return None
    
    def is_tracked_by_user(self, user):
        """التحقق إذا كان المستخدم يتابع هذه السفينة"""
        return self.tracked_by.filter(id=user.id).exists()

# تم إزالة نموذج Shipment نهائياً