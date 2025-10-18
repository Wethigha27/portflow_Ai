from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PointActivity, UserScore
from blockchain.hedera_client import publish_prediction  # نفس الوظيفة التي تستعملها للتنبؤ

@receiver(post_save, sender=PointActivity)
def update_user_score_and_publish(sender, instance, created, **kwargs):
    if created:
        # 1️⃣ تحديث رصيد النقاط
        score_obj, _ = UserScore.objects.get_or_create(user=instance.user)
        score_obj.total_points += instance.points
        if score_obj.total_points > 100:
            score_obj.level = "Intermédiaire"
        if score_obj.total_points > 300:
            score_obj.level = "Expert"
        score_obj.save()

        # 2️⃣ تجهيز الرسالة للنشر على Hedera
        payload = {
            "type": "POINT_ACTIVITY",
            "user": instance.user.username,
            "activity": instance.activity_type,
            "points": instance.points,
            "total_points": score_obj.total_points,
            "level": score_obj.level,
            "timestamp": instance.timestamp.isoformat(),
        }

        res = publish_prediction(payload)  # 🔸 نفس الوظيفة التي استخدمناها للتنبؤ
        if res.get("ok"):
            instance.hcs_status = res.get("status")
            instance.hcs_tx_id = res.get("txId", "")
            instance.save()
