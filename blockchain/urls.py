from django.urls import path
from . import views

urlpatterns = [
    # Blockchain APIs
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('predict/', views.predict_view, name='predict'),
    path('predictions/', views.predictions_list, name='predictions_list'),
    
    # Scoring System APIs
    path('my-activities/', views.user_activities, name='user-activities'),
    path('my-score/', views.user_score, name='user-score'),
    path('add-points/', views.add_points, name='add-points'),
]