from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserProfileSerializer
# Ajoutez en haut du fichier users/views.py
from rest_framework import serializers

class EmptySerializer(serializers.Serializer):
    """Serializer vide pour les views sans données"""
    pass

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = EmptySerializer  # 🆕 UTILISEZ CE SERIALIZER
    
    def post(self, request):
        return Response({"message": "Email verification will be implemented soon"})
User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        return Response({"message": "Email verification will be implemented soon"})