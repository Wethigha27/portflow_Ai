# blockchain/serializers.py
from rest_framework import serializers
from .models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'
from .models import PointActivity, UserScore

class PointActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PointActivity
        fields = '__all__'

class UserScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScore
        fields = '__all__'