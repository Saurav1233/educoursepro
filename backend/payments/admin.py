from django.contrib import admin
from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'payment_status', 'amount_paid', 'purchased_at']
    list_filter = ['payment_status']
    search_fields = ['user__email', 'course__title', 'transaction_id']
    readonly_fields = ['purchased_at', 'transaction_id']
