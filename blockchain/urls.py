from django.urls import path
from . import views

urlpatterns = [
    # التوقعات والتنبؤات
    path('predict/', views.PredictView.as_view(), name='predict'),
    path('predictions/', views.PredictionListView.as_view(), name='predictions-list'),
    
    # المعاملات والسجل
    path('transactions/', views.TransactionListView.as_view(), name='transactions-list'),
]