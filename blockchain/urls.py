from django.urls import path
from . import views

urlpatterns = [

    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),

   # التوقعات والتنبؤات
   path('predict/', views.predict_view, name='predict'),
    path('predictions/', views.predictions_list, name='predictions_list'),

    # المعاملات والسجل
    # path('transactions/', views.TransactionListView.as_view(), name='transactions-list'),
    # path('api/points/award/', views.award_points, name='award_points'),


]