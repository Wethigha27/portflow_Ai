from rest_framework import serializers
from .models import Port, Ship

class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = '__all__'

class ShipSerializer(serializers.ModelSerializer):
    destination_port_name = serializers.CharField(source='destination_port.name', read_only=True)
    tracked_by_count = serializers.SerializerMethodField()
    is_tracked_by_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Ship
        fields = [
            'id', 'name', 'imo_number', 'type', 
            'current_latitude', 'current_longitude', 
            'current_speed', 'current_heading', 'status',
            'destination_port', 'destination_port_name', 'destination_name',
            'expected_arrival', 'tracked_by', 'tracked_by_count',
            'is_tracked_by_current_user', 'last_updated', 'created_at',
            'length', 'width', 'draft'
        ]
        read_only_fields = ('last_updated', 'created_at')
    
    def get_tracked_by_count(self, obj):
        return obj.tracked_by.count()
    
    def get_is_tracked_by_current_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.tracked_by.filter(id=request.user.id).exists()
        return False

class ShipSearchResultSerializer(serializers.Serializer):
    """Serializer لنتائج البحث من MarineTraffic"""
    name = serializers.CharField()
    imo = serializers.CharField()
    type = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    speed = serializers.FloatField(required=False)
    heading = serializers.FloatField(required=False)
    status = serializers.CharField(required=False)
    destination = serializers.CharField(required=False)
    eta = serializers.CharField(required=False)
    source = serializers.CharField()
    
    def create(self, validated_data):
        # هذا serializer للقراءة فقط
        return validated_data