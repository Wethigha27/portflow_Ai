from rest_framework import serializers
from .models import Notification, Message

class NotificationSerializer(serializers.ModelSerializer):
    shipment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)
    
    def get_shipment_info(self, obj):
        if obj.related_shipment:
            return {
                'id': obj.related_shipment.id,
                'ship_name': obj.related_shipment.ship.name,
                'status': obj.related_shipment.status
            }
        return None

class MessageSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    to_user_name = serializers.CharField(source='to_user.username', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('created_at',)

class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('to_user', 'subject', 'content')