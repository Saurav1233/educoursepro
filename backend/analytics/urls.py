from django.urls import path
from .views import AdminDashboardStatsView, AdminUserGrowthView

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin_dashboard'),
    path('user-growth/', AdminUserGrowthView.as_view(), name='user_growth'),
]
