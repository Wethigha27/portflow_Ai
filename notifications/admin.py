from django.contrib import admin
from .models import Notification, Message

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'severity', 'is_read', 'created_at')
    list_filter = ('notification_type', 'severity', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    readonly_fields = ('created_at', 'read_at')
    
    fieldsets = (
        ('المعلومات الأساسية', {
            'fields': ('user', 'title', 'message', 'notification_type', 'severity')
        }),
        ('الحالة والتوقيت', {
            'fields': ('is_read', 'is_actionable', 'created_at', 'read_at', 'expires_at')
        }),
        ('العلاقات', {
            'fields': ('related_ship',)
        }),
        ('البيانات الإضافية', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'from_user', 'to_user', 'message_type', 'is_read', 'is_urgent', 'created_at')
    list_filter = ('message_type', 'is_read', 'is_urgent', 'created_at')
    search_fields = ('subject', 'content', 'from_user__username', 'to_user__username')
    readonly_fields = ('created_at', 'read_at')
    
    fieldsets = (
        ('الرسالة', {
            'fields': ('from_user', 'to_user', 'subject', 'content', 'message_type')
        }),
        ('الحالة', {
            'fields': ('is_read', 'is_urgent', 'created_at', 'read_at')
        }),
        ('العلاقات', {
            'fields': ('related_ship', 'parent_message')
        }),
    )