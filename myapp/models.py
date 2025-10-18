# myapp/models.py

from django.db import models

class Prediction(models.Model):
    ship_name  = models.CharField(max_length=120)
    lat        = models.FloatField(null=True, blank=True)
    lon        = models.FloatField(null=True, blank=True)
    risk_score = models.FloatField()
    hcs_tx     = models.CharField(max_length=120, null=True, blank=True)  # اختيارى لتخزين TxId أو الحالة
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ship_name} ({self.risk_score:.2f}) @ {self.created_at:%Y-%m-%d %H:%M}"
