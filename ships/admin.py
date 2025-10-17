from django.contrib import admin
from .models import Port, Ship

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'code', 'latitude', 'longitude')
    list_filter = ('country',)
    search_fields = ('name', 'country', 'city', 'code')
    ordering = ('name',)

@admin.register(Ship)
class ShipAdmin(admin.ModelAdmin):
    list_display = ('name', 'imo_number', 'type', 'current_latitude', 'current_longitude', 'current_speed', 'last_updated')
    list_filter = ('type',)
    search_fields = ('name', 'imo_number')
    readonly_fields = ('last_updated', 'created_at')
    filter_horizontal = ('tracked_by',)
    
    fieldsets = (
        ('المعلومات الأساسية', {
            'fields': ('name', 'imo_number', 'type')
        }),
        ('الموقع والحركة', {
            'fields': ('current_latitude', 'current_longitude', 'current_speed', 'current_heading', 'status')
        }),
        ('الوجهة والتوقعات', {
            'fields': ('destination_port', 'destination_name', 'expected_arrival')
        }),
        ('المتابعين', {
            'fields': ('tracked_by',)
        }),
        ('المعلومات الإضافية', {
            'fields': ('length', 'width', 'draft', 'last_updated', 'created_at'),
            'classes': ('collapse',)
        }),
    )