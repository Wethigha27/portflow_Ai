from django.urls import path
from . import views

urlpatterns = [
    # الموانئ
    path('ports/', views.PortListCreateView.as_view(), name='port-list'),
    path('ports/<int:pk>/', views.PortDetailView.as_view(), name='port-detail'),
    
    # السفن
    path('ships/', views.ShipListCreateView.as_view(), name='ship-list'),
    path('ships/<int:pk>/', views.ShipDetailView.as_view(), name='ship-detail'),
    
    # البحث والتتبع
    path('search/', views.SearchShipView.as_view(), name='search-ship'),
    path('track/<int:ship_id>/', views.TrackShipView.as_view(), name='track-ship'),
    path('untrack/<int:ship_id>/', views.UntrackShipView.as_view(), name='untrack-ship'),
    path('my-tracking/', views.UserTrackedShipsView.as_view(), name='my-tracking'),
    
    # MarineTraffic
    path('positions/update/', views.UpdateShipPositionsView.as_view(), name='update-positions'),
    path('positions/<str:imo_number>/', views.ShipPositionView.as_view(), name='ship-position'),
    path('tracking/<int:ship_id>/', views.ShipTrackingView.as_view(), name='ship-tracking'),
    
    # إحصائيات
    path('stats/', views.ShippingStatsView.as_view(), name='shipping-stats'),
    path('ports/stats/', views.PortStatsView.as_view(), name='port-stats'),

    # MyShipTracking proxy
    path('mst/vessel-status/', views.MSTVesselStatusView.as_view(), name='mst-vessel-status'),
    path('mst/vessels-in-zone/', views.MSTVesselsInZoneView.as_view(), name='mst-vessels-in-zone'),
    path('mst/vessel-history/', views.MSTVesselHistoryView.as_view(), name='mst-vessel-history'),
    path('mst/port-search/', views.MSTPortSearchView.as_view(), name='mst-port-search'),
    path('mst/port-details/', views.MSTPortDetailsView.as_view(), name='mst-port-details'),
]