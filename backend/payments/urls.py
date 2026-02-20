from django.urls import path
from .views import (
    InitiatePurchaseView,
    UserPurchaseListView,
    CheckPurchaseView,
    AdminPurchaseListView,
    AdminPurchaseDetailView,
)

urlpatterns = [
    path('purchase/', InitiatePurchaseView.as_view(), name='initiate_purchase'),
    path('my-purchases/', UserPurchaseListView.as_view(), name='my_purchases'),
    path('check/<int:course_id>/', CheckPurchaseView.as_view(), name='check_purchase'),
    # Admin
    path('admin/purchases/', AdminPurchaseListView.as_view(), name='admin_purchases'),
    path('admin/purchases/<int:pk>/', AdminPurchaseDetailView.as_view(), name='admin_purchase_detail'),
]
