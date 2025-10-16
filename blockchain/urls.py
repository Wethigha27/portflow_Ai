from django.urls import path
from . import views

urlpatterns = [
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
]