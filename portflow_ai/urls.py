"""
URL configuration for portflow_ai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Configuration Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="PortFlow API",
        default_version='v1',
        description="Système de suivi de navires et météo - Documentation complète des APIs",
        terms_of_service="https://www.portflow.com/terms/",
        contact=openapi.Contact(email="support@portflow.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # URLs Swagger - DOIT ÊTRE EN PREMIER
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Vos APIs
    path('api/users/', include('users.urls')),
    path('api/ships/', include('ships.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/blockchain/', include('blockchain.urls')),
]