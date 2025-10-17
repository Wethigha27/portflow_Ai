# myapp/views.py
import json, hashlib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from blockchain.hedera_client import publish_prediction
from .models import Prediction
from .serializers import PredictionSerializer

def _sha256_hex(obj: dict) -> str:
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_view(request):
    """
    يستقبل بيانات السفينة -> يحسب risk_score -> ينشر على Hedera -> يحفظ في DB
    """
    data = request.data

    # 1) risk (مؤقت)
    risk_score = 0.85

    # 2) payload للنشر
    payload = {
        "ship_name": data.get("ship_name", "Unknown Ship"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
        "risk_score": risk_score,
    }
    msg_hash = _sha256_hex(payload)

    # 3) نشر على Hedera عبر السيرفر المحلي
    publish_res = publish_prediction(payload)  # {'ok': True/False, 'status': 'SUCCESS'...}

    # 4) حفظ في قاعدة البيانات
    pred = Prediction.objects.create(
        ship_name   = payload["ship_name"],
        lat         = payload["lat"],
        lon         = payload["lon"],
        risk_score  = payload["risk_score"],
        message_hash= msg_hash,
        topic_id    = data.get("topic_id", ""),           # اختياري
        hcs_status  = publish_res.get("status","FAILED"),
        hcs_tx_id   = publish_res.get("txId",""),         # لو أضفناه لاحقًا في الـ server
    )

    return Response({
        "status": "ok" if publish_res.get("ok") else "error",
        "hedra": publish_res,
        "prediction": PredictionSerializer(pred).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def predictions_list(request):
    """
    إرجاع آخر التوقعات (limit عبر ?limit=)
    """
    limit = int(request.query_params.get('limit', 20))
    qs = Prediction.objects.all()[:limit]
    return Response(PredictionSerializer(qs, many=True).data)
