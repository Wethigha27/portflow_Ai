from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('delay', 'تأخير السفينة'),
        ('weather', 'تحذير طقس'),
        ('position', 'تحديث موقع'),
        ('arrival', 'وصول السفينة'),
        ('departure', 'مغادرة السفينة'),
        ('eta_change', 'تغيير وقت الوصول'),
        ('system', 'إشعار نظام'),
    )
    
    SEVERITY_LEVELS = (
        ('low', 'منخفض'),
        ('medium', 'متوسط'),
        ('high', 'عالي'),
        ('critical', 'حرج'),
    )
    
    # المستخدم المستهدف
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # محتوى الإشعار
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='medium')
    
    # حالة الإشعار
    is_read = models.BooleanField(default=False)
    is_actionable = models.BooleanField(default=True)  # إذا كان يحتاج إجراء من المستخدم
    
    # التوقيت
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # العلاقة بالسفينة (بدلاً من الشحنة)
    related_ship = models.ForeignKey('ships.Ship', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    # بيانات إضافية (للتخزين المرن)
    metadata = models.JSONField(default=dict, blank=True)  # لتخزين بيانات إضافية
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
        verbose_name = 'إشعار'
        verbose_name_plural = 'إشعارات'
    
    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.get_notification_type_display()})"
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save()
    
    def get_related_ship_info(self):
        """الحصول على معلومات السفينة المرتبطة"""
        if self.related_ship:
            return {
                'id': self.related_ship.id,
                'name': self.related_ship.name,
                'imo': self.related_ship.imo_number,
                'type': self.related_ship.get_type_display(),
            }
        return None

class Message(models.Model):
    MESSAGE_TYPES = (
        ('inquiry', 'استفسار'),
        ('support', 'دعم فني'),
        ('alert', 'تنبيه'),
        ('general', 'عام'),
    )
    
    # المرسل والمستلم
    from_user = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    
    # محتوى الرسالة
    subject = models.CharField(max_length=200)
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='general')
    
    # حالة الرسالة
    is_read = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # التوقيت
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # العلاقة بالسفينة (اختياري)
    related_ship = models.ForeignKey('ships.Ship', on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    
    # ردود الرسائل (لإنشاء سلاسل محادثات)
    parent_message = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'رسالة'
        verbose_name_plural = 'رسائل'
    
    def __str__(self):
        return f"{self.subject} - {self.from_user} to {self.to_user}"
    
    def mark_as_read(self):
        """تحديد الرسالة كمقروءة"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save()
            
            # إنشاء إشعار بالرسالة المقروءة
            Notification.objects.create(
                user=self.from_user,
                title="تم قراءة رسالتك",
                message=f"قام {self.to_user.username} بقراءة رسالتك: {self.subject}",
                notification_type='system',
                severity='low'
            )
    
    def reply(self, from_user, content):
        """إنشاء رد على هذه الرسالة"""
        return Message.objects.create(
            from_user=from_user,
            to_user=self.from_user,  # الرد يذهب لمرسل الرسالة الأصلية
            subject=f"Re: {self.subject}",
            content=content,
            parent_message=self,
            related_ship=self.related_ship
        )