
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class TransactionListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "Hedera Blockchain integration will be implemented soon",
            "status": "development"
        })

# blockchain/views.py
import json, hashlib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Prediction
from .serializers import PredictionSerializer
from .hedera_client import publish_prediction

def _sha256_hex(obj: dict) -> str:
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    import hashlib
    return hashlib.sha256(data).hexdigest()

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_view(request):
    data = request.data
    risk_score = 0.85
    payload = {
        "ship_name": data.get("ship_name", "Unknown Ship"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
        "risk_score": risk_score,
    }
    publish_res = publish_prediction(payload)
    pred = Prediction.objects.create(
        ship_name=payload["ship_name"],
        lat=payload["lat"],
        lon=payload["lon"],
        risk_score=payload["risk_score"],
        hcs_tx=publish_res.get("txId") or publish_res.get("status"),
    )
    return Response({
        "status": "ok" if publish_res.get("ok") else "error",
        "hedera": publish_res,
        "prediction": PredictionSerializer(pred).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def predictions_list(request):
    limit = int(request.query_params.get('limit', 20))
    qs = Prediction.objects.all()[:limit]
    return Response(PredictionSerializer(qs, many=True).data)

