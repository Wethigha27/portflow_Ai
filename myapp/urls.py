# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Example endpoint, you can add your new ones here
    path('', views.home, name='home'),
]
