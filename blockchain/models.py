# blockchain/models.py
from django.db import models
from django.conf import settings  # لاستخدام AUTH_USER_MODEL

class Prediction(models.Model):
    ship_name  = models.CharField(max_length=120)
    lat        = models.FloatField(null=True, blank=True)
    lon        = models.FloatField(null=True, blank=True)
    risk_score = models.FloatField()
    hcs_tx     = models.CharField(max_length=120, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ship_name} ({self.risk_score:.2f})"


class PointActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=100)
    points = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    hcs_status = models.CharField(max_length=50, blank=True, null=True)
    hcs_tx_id = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} ({self.points} pts)"


class UserScore(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="score")
    total_points = models.IntegerField(default=0)
    level = models.CharField(max_length=50, default="Débutant")

    def __str__(self):
        return f"{self.user.username}: {self.total_points} pts"
