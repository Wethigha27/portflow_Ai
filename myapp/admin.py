# myapp/admin.py

from django.contrib import admin
from .models import Prediction

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("ship_name", "risk_score", "lat", "lon", "created_at")
    search_fields = ("ship_name",)
    list_filter = ("created_at",)

