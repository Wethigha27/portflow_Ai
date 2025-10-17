from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification, Message
from .serializers import NotificationSerializer, MessageSerializer, CreateMessageSerializer
from .services import NotificationService

class UserNotificationsView(generics.ListAPIView):
    """جلب إشعارات المستخدم"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class MarkNotificationReadView(APIView):
    """تحديث حالة الإشعار كمقروء"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "تم تحديد الإشعار كمقروء"})
        except Notification.DoesNotExist:
            return Response({"error": "الإشعار غير موجود"}, status=404)

class UnreadNotificationsCountView(APIView):
    """عدد الإشعارات غير المقروءة"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})

class MessageListCreateView(generics.ListCreateAPIView):
    """قائمة الرسائل وإنشاء رسائل جديدة"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateMessageSerializer
        return MessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(to_user=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)

class CheckDelayedShipsView(APIView):
    """فحص السفن المتأخرة وإنشاء إشعارات"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "صلاحية مرفوضة"}, status=403)
        
        service = NotificationService()
        result = service.check_ship_delays()
        return Response({"message": result})

class CheckWeatherAlertsView(APIView):
    """فحص إنذارات الطقس وإنشاء إشعارات"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "صلاحية مرفوضة"}, status=403)
        
        service = NotificationService()
        result = service.check_weather_alerts()
        return Response({"message": result})