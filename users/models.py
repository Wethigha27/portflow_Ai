from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Administrator'),
        ('merchant', 'Merchant'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='merchant')
    phone_number = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=100, blank=True)
    points = models.IntegerField(default=0)
    email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, blank=True)
    
    # Ajoute ces lignes pour résoudre les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',  # Change ceci
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',  # Change ceci
        related_query_name='user',
    )
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"