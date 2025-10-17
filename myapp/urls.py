from django.urls import path
from . import views

urlpatterns = [
    path('api/predict/', views.predict_view, name='predict'),
    path('predictions/', views.predictions_list, name='predictions_list'),
]
