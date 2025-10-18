from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
import hashlib

from .models import Prediction, PointActivity, UserScore
from .serializers import PredictionSerializer
from .hedera_client import publish_prediction

# ========== SERIALIZERS FOR SWAGGER ==========
class PredictionInputSerializer(serializers.Serializer):
    ship_name = serializers.CharField(
        required=True, 
        max_length=120,
        help_text="اسم السفينة - مطلوب"
    )
    lat = serializers.FloatField(
        required=False, 
        allow_null=True,
        help_text="خط العرض (Latitude)"
    )
    lon = serializers.FloatField(
        required=False, 
        allow_null=True,
        help_text="خط الطول (Longitude)"
    )

class HederaResponseSerializer(serializers.Serializer):
    ok = serializers.BooleanField(help_text="نجاح العملية")
    txId = serializers.CharField(help_text="معرف المعاملة على Hedera", required=False)
    error = serializers.CharField(help_text="رسالة الخطأ", required=False)

class PredictionOutputSerializer(serializers.Serializer):
    status = serializers.CharField(help_text="حالة الطلب: ok أو error")
    hedera = HederaResponseSerializer(help_text="استجابة Hedera")
    prediction = PredictionSerializer(help_text="بيانات التنبؤ المحفوظة")

class TransactionResponseSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="رسالة توضيحية")
    status = serializers.CharField(help_text="حالة التطوير")
    timestamp = serializers.DateTimeField(help_text="وقت الاستجابة")

# ========== VIEWS ==========
class TransactionListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionResponseSerializer

    @swagger_auto_schema(
        operation_description="الحصول على قائمة بالمعاملات من Hedera Blockchain",
        operation_summary="قائمة المعاملات",
        tags=['blockchain'],
        responses={
            200: TransactionResponseSerializer,
            401: "غير مصرح"
        }
    )
    def get(self, request):
        """
        استرجاع معلومات عن تكامل Hedera Blockchain (تحت التطوير)
        """
        data = {
            "message": "Hedera Blockchain integration will be implemented soon",
            "status": "development",
            "timestamp": timezone.now()
        }
        serializer = self.get_serializer(data)
        return Response(serializer.data)

@swagger_auto_schema(
    method='post',
    operation_description="""
    إنشاء تنبؤ جديد للمخاطر وتخزينه على Hedera Blockchain
    
    **عملية التنبؤ:**
    1. استقبال بيانات السفينة
    2. حساب درجة المخاطر
    3. تخزين السجل محلياً
    4. نشر المعاملة على Hedera HCS
    5. إرجاع النتائج
    
    **ملاحظة:** درجة المخاطر تحسب تلقائياً حالياً
    """,
    operation_summary="إنشاء تنبؤ جديد",
    request_body=PredictionInputSerializer,
    tags=['blockchain'],
    responses={
        200: PredictionOutputSerializer,
        400: "بيانات الإدخال غير صالحة"
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def predict_view(request):
    """
    إنشاء تنبؤ جديد للمخاطر البحرية
    
    مثال على البيانات:
    ```json
    {
        "ship_name": "Ever Given",
        "lat": 25.5,
        "lon": 55.3
    }
    ```
    """
    data = request.data
    risk_score = 0.85  # يمكن تغيير هذا لحساب حقيقي لاحقاً
    
    payload = {
        "ship_name": data.get("ship_name", "Unknown Ship"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
        "risk_score": risk_score,
    }
    
    # نشر على Hedera
    publish_res = publish_prediction(payload)
    
    # حفظ في قاعدة البيانات
    pred = Prediction.objects.create(
        ship_name=payload["ship_name"],
        lat=payload["lat"],
        lon=payload["lon"],
        risk_score=payload["risk_score"],
        hcs_status=publish_res.get("status", "unknown"),
        hcs_tx_id=publish_res.get("txId"),
    )
    
    return Response({
        "status": "ok" if publish_res.get("ok") else "error",
        "hedera": publish_res,
        "prediction": PredictionSerializer(pred).data
    })

@swagger_auto_schema(
    method='get',
    operation_description="استرجاع قائمة بأحدث التنبؤات",
    operation_summary="قائمة التنبؤات",
    manual_parameters=[
        openapi.Parameter(
            'limit',
            openapi.IN_QUERY,
            description="عدد التنبؤات المراد استرجاعها (الافتراضي: 20)",
            type=openapi.TYPE_INTEGER,
            default=20
        )
    ],
    tags=['blockchain'],
    responses={
        200: PredictionSerializer(many=True),
        400: "معامل غير صالح"
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def predictions_list(request):
    """
    استرجاع أحدث التنبؤات مع إمكانية تحديد العدد
    
    مثال:
    GET /api/blockchain/predictions/?limit=10
    """
    limit = int(request.query_params.get('limit', 20))
    if limit > 100:  # منع استرجاع عدد كبير جداً
        limit = 100
        
    qs = Prediction.objects.all().order_by('-created_at')[:limit]
    serializer = PredictionSerializer(qs, many=True)
    return Response(serializer.data)

# ========== SYSTEME DE POINTAGE - NOUVELLES APIs ==========

class PointActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PointActivity
        fields = '__all__'

class UserScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScore
        fields = '__all__'

class AddPointsSerializer(serializers.Serializer):
    activity_type = serializers.CharField(
        required=True,
        help_text="نوع النشاط (ex: prediction_created, daily_login, etc.)"
    )
    points = serializers.IntegerField(
        required=True,
        help_text="عدد النقاط الممنوحة"
    )

@swagger_auto_schema(
    method='get',
    operation_description="الحصول على سجل أنشطة النقاط للمستخدم",
    operation_summary="سجل الأنشطة",
    tags=['scoring'],
    responses={
        200: PointActivitySerializer(many=True),
        401: "غير مصرح"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activities(request):
    """
    استرجاع سجل كامل لأنشطة المستخدم ونقاطه
    """
    activities = PointActivity.objects.filter(user=request.user).order_by('-timestamp')
    serializer = PointActivitySerializer(activities, many=True)
    return Response(serializer.data)

@swagger_auto_schema(
    method='get',
    operation_description="الحصول على النقاط الإجمالية ومستوى المستخدم",
    operation_summary="النقاط والمستوى",
    tags=['scoring'],
    responses={
        200: UserScoreSerializer,
        401: "غير مصرح"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_score(request):
    """
    استرجاع النقاط الإجمالية والمستوى الحالي للمستخدم
    """
    score, created = UserScore.objects.get_or_create(user=request.user)
    serializer = UserScoreSerializer(score)
    return Response(serializer.data)

@swagger_auto_schema(
    method='post',
    operation_description="إضافة نقاط للمستخدم بناءً على نشاط معين",
    operation_summary="إضافة نقاط",
    request_body=AddPointsSerializer,
    tags=['scoring'],
    responses={
        200: UserScoreSerializer,
        400: "بيانات غير صالحة",
        401: "غير مصرح"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_points(request):
    """
    إضافة نقاط للمستخدم وتسجيل النشاط
    
    مثال:
    ```json
    {
        "activity_type": "prediction_created",
        "points": 10
    }
    ```
    """
    serializer = AddPointsSerializer(data=request.data)
    if serializer.is_valid():
        activity_type = serializer.validated_data['activity_type']
        points = serializer.validated_data['points']
        
        # تسجيل النشاط
        activity = PointActivity.objects.create(
            user=request.user,
            activity_type=activity_type,
            points=points
        )
        
        # تحديث النقاط الإجمالية
        user_score, created = UserScore.objects.get_or_create(user=request.user)
        user_score.total_points += points
        
        # تحديث المستوى تلقائياً
        if user_score.total_points >= 1000:
            user_score.level = "خبير"
        elif user_score.total_points >= 500:
            user_score.level = "متقدم"
        elif user_score.total_points >= 100:
            user_score.level = "متوسط"
        else:
            user_score.level = "مبتدئ"
            
        user_score.save()
        
        return Response(UserScoreSerializer(user_score).data)
    
    return Response(serializer.errors, status=400)