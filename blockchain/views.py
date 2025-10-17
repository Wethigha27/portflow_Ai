import json
import hashlib
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Prediction
from .serializers import PredictionSerializer
from .hedera_client import publish_prediction

def _sha256_hex(obj: dict) -> str:
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

class PredictView(APIView):
    """
    post:
    إنشاء توقع جديد ونشره على Hedera Blockchain
    
    يستقبل بيانات السفينة، يحسب درجة المخاطرة، 
    ينشر على Hedera HCS، ويحفظ في قاعدة البيانات.
    
    مثال البيانات:
    ```json
    {
        "ship_name": "MAERSK SEOUL",
        "lat": 33.5731,
        "lon": -7.5898
    }
    ```
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data

        # 1) حساب درجة المخاطرة (مؤقت)
        risk_score = 0.85

        # 2) تحضير البيانات للنشر
        payload = {
            "ship_name": data.get("ship_name", "Unknown Ship"),
            "lat": data.get("lat"),
            "lon": data.get("lon"),
            "risk_score": risk_score,
        }
        msg_hash = _sha256_hex(payload)

        # 3) النشر على Hedera
        publish_res = publish_prediction(payload)

        # 4) الحفظ في قاعدة البيانات
        pred = Prediction.objects.create(
            ship_name=payload["ship_name"],
            lat=payload["lat"],
            lon=payload["lon"],
            risk_score=payload["risk_score"],
            message_hash=msg_hash,
            topic_id=data.get("topic_id", ""),
            hcs_status=publish_res.get("status", "FAILED"),
            hcs_tx_id=publish_res.get("txId", ""),
        )

        return Response({
            "status": "ok" if publish_res.get("ok") else "error",
            "blockchain": publish_res,
            "prediction": PredictionSerializer(pred).data
        })

class PredictionListView(generics.ListAPIView):
    """
    get:
    قائمة بجميع التوقعات المحفوظة
    
    يمكن تحديد عدد النتائج عبر параметر limit:
    مثال: /api/blockchain/predictions/?limit=10
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PredictionSerializer
    queryset = Prediction.objects.all()
    
    def get_queryset(self):
        queryset = Prediction.objects.all()
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        return queryset

class TransactionListView(APIView):
    """
    get:
    عرض سجل المعاملات على Hedera Blockchain
    
    يعرض تاريخ ونشاط التوقعات المنشورة على السلسلة
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "Hedera Blockchain integration - Transaction History",
            "status": "active",
            "network": "Hedera Testnet",
            "features": [
                "Real-time prediction publishing",
                "Immutable transaction records",
                "SHA-256 data hashing"
            ]
        })