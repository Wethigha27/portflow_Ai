from rest_framework import generics, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserProfileSerializer, CustomTokenObtainPairSerializer

class EmptySerializer(serializers.Serializer):
    """Serializer vide pour les views sans données"""
    pass

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = EmptySerializer  # ✅ important pour Swagger
    
    def post(self, request):
        return Response({"message": "Email verification will be implemented soon"})

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue personnalisée pour accepter email au lieu de username"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Ajouter les données utilisateur à la réponse
        if response.status_code == 200:
            try:
                from .serializers import UserProfileSerializer
                email = request.data.get('email')
                username = request.data.get('username')
                
                if email:
                    user = User.objects.get(email=email)
                elif username:
                    user = User.objects.get(username=username)
                else:
                    return response
                
                user_data = UserProfileSerializer(user).data
                response.data['user'] = user_data
            except User.DoesNotExist:
                pass
        
        return response

class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user

class AdminUserListView(generics.ListAPIView):
    """List all users (admin only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        # Only allow admin users
        if self.request.user.user_type != 'admin':
            return User.objects.none()
        return User.objects.all().order_by('-date_joined')