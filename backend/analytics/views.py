from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from courses.models import Course
from payments.models import Purchase
from accounts.permissions import IsAdminRole


class AdminDashboardStatsView(APIView):
    """Admin dashboard summary statistics."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        # User stats
        total_users = User.objects.count()
        active_students = User.objects.filter(role='STUDENT', is_active=True).count()
        admin_users = User.objects.filter(role='ADMIN').count()

        # New users this month
        this_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = User.objects.filter(created_at__gte=this_month).count()

        # Course stats
        total_courses = Course.objects.count()
        active_courses = Course.objects.filter(is_active=True).count()

        # Purchase stats
        total_purchases = Purchase.objects.filter(payment_status='COMPLETED').count()
        total_revenue = Purchase.objects.filter(payment_status='COMPLETED').aggregate(
            total=Sum('amount_paid')
        )['total'] or 0

        # Monthly revenue (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_revenue = (
            Purchase.objects.filter(
                payment_status='COMPLETED',
                purchased_at__gte=six_months_ago
            )
            .annotate(month=TruncMonth('purchased_at'))
            .values('month')
            .annotate(revenue=Sum('amount_paid'), count=Count('id'))
            .order_by('month')
        )

        monthly_data = [
            {
                'month': item['month'].strftime('%b %Y'),
                'revenue': float(item['revenue']),
                'purchases': item['count'],
            }
            for item in monthly_revenue
        ]

        # Top courses by enrollment
        top_courses = (
            Course.objects.filter(is_active=True)
            .annotate(
                enrollment_count=Count(
                    'purchases',
                    filter=Q(purchases__payment_status='COMPLETED')
                )
            )
            .order_by('-enrollment_count')[:5]
            .values('id', 'title', 'enrollment_count', 'price')
        )

        # Recent purchases
        recent_purchases = (
            Purchase.objects.filter(payment_status='COMPLETED')
            .order_by('-purchased_at')[:10]
            .values(
                'user__email', 'user__first_name', 'user__last_name',
                'course__title', 'amount_paid', 'purchased_at'
            )
        )

        return Response({
            'users': {
                'total': total_users,
                'active_students': active_students,
                'admins': admin_users,
                'new_this_month': new_users_this_month,
            },
            'courses': {
                'total': total_courses,
                'active': active_courses,
            },
            'revenue': {
                'total': float(total_revenue),
                'total_purchases': total_purchases,
                'monthly': monthly_data,
            },
            'top_courses': list(top_courses),
            'recent_purchases': list(recent_purchases),
        })


class AdminUserGrowthView(APIView):
    """Monthly user registration growth."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        twelve_months_ago = timezone.now() - timedelta(days=365)
        monthly_signups = (
            User.objects.filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        data = [
            {
                'month': item['month'].strftime('%b %Y'),
                'users': item['count'],
            }
            for item in monthly_signups
        ]

        return Response({'monthly_growth': data})
