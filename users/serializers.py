from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personnalisé pour accepter email au lieu de username"""
    # Conserver le champ USERNAME_FIELD par défaut du modèle ("username")
    username_field = User.USERNAME_FIELD
    
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)

    def validate(self, attrs):
        # Accepter soit email, soit username
        email = attrs.get('email')
        username = attrs.get('username')
        
        if email:
            try:
                user = User.objects.get(email=email)
                attrs['username'] = user.username
                attrs.pop('email', None)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"email": "Aucun utilisateur trouvé avec cet email."}
                )
        elif not username:
            raise serializers.ValidationError(
                {"email": "Email ou username requis."}
            )
        
        return super().validate(attrs)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'user_type', 'phone_number', 'company_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'user_type', 'phone_number', 
                 'company_name', 'points', 'date_joined')
        read_only_fields = ('points', 'date_joined')
