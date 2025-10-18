from rest_framework import generics, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserProfileSerializer

class EmptySerializer(serializers.Serializer):
    """Serializer vide pour les views sans données"""
    pass

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = EmptySerializer  # ✅ important pour Swagger
    
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
