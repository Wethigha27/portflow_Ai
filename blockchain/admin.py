
from django.contrib import admin

# Register your models here.

# blockchain/admin.py
from django.contrib import admin
from .models import Prediction, PointActivity, UserScore

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("ship_name", "risk_score", "lat", "lon", "created_at")
    search_fields = ("ship_name",)
    list_filter = ("created_at",)

@admin.register(PointActivity)
class PointActivityAdmin(admin.ModelAdmin):
    list_display = ("user", "activity_type", "points", "timestamp", "hcs_status")
    list_filter = ("activity_type", "timestamp")
    search_fields = ("user__username", "activity_type")

@admin.register(UserScore)
class UserScoreAdmin(admin.ModelAdmin):
    list_display = ("user", "total_points", "level")
    search_fields = ("user__username",)

