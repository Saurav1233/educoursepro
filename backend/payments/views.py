import uuid
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Purchase
from .serializers import PurchaseSerializer, PurchaseCourseSerializer, AdminPurchaseSerializer
from courses.models import Course
from accounts.permissions import IsAdminRole


class InitiatePurchaseView(APIView):
    """
    Simulate course purchase.
    In production, integrate with Stripe/Razorpay/PayPal here.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_id = serializer.validated_data['course_id']
        course = get_object_or_404(Course, pk=course_id, is_active=True)

        # Check already purchased
        existing = Purchase.objects.filter(
            user=request.user, course=course, payment_status='COMPLETED'
        ).first()
        if existing:
            return Response(
                {'error': 'You have already purchased this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simulate payment processing
        # In production: call payment gateway API here
        transaction_id = str(uuid.uuid4())

        purchase = Purchase.objects.create(
            user=request.user,
            course=course,
            payment_status=Purchase.PaymentStatus.COMPLETED,  # Auto-complete for demo
            amount_paid=course.price,
            payment_method=serializer.validated_data.get('payment_method', 'CARD'),
            transaction_id=transaction_id,
        )

        return Response({
            'message': 'Course purchased successfully!',
            'purchase': PurchaseSerializer(purchase).data,
        }, status=status.HTTP_201_CREATED)


class UserPurchaseListView(generics.ListAPIView):
    """Student: list their purchases."""
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user).order_by('-purchased_at')


class CheckPurchaseView(APIView):
    """Check if current user has purchased a specific course."""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        is_purchased = Purchase.objects.filter(
            user=request.user, course_id=course_id, payment_status='COMPLETED'
        ).exists()
        return Response({'is_purchased': is_purchased})


# ─── Admin Purchase Management ───────────────────────────────────────────────

class AdminPurchaseListView(generics.ListAPIView):
    """Admin: view all purchases."""
    queryset = Purchase.objects.all().order_by('-purchased_at')
    serializer_class = AdminPurchaseSerializer
    permission_classes = [IsAdminRole]


class AdminPurchaseDetailView(generics.RetrieveUpdateAPIView):
    """Admin: view and update purchase status."""
    queryset = Purchase.objects.all()
    serializer_class = AdminPurchaseSerializer
    permission_classes = [IsAdminRole]
