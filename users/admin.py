from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'points', 'email_verified')
    list_filter = ('user_type', 'email_verified')
    fieldsets = UserAdmin.fieldsets + (
        ('PortFlow Information', {
            'fields': ('user_type', 'phone_number', 'company_name', 'points', 'email_verified')
        }),
    )