import razorpay
import uuid
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import send_mail

from .models import Purchase
from .serializers import PurchaseSerializer, PurchaseCourseSerializer, AdminPurchaseSerializer
from courses.models import Course
from accounts.permissions import IsAdminRole


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def send_purchase_email(purchase):
    """Send confirmation email after successful purchase."""
    try:
        subject = f'Purchase Confirmed - {purchase.course.title}'
        message = f'''
Hi {purchase.user.first_name},

Your purchase was successful! 🎉

Course:         {purchase.course.title}
Amount Paid:    ₹{purchase.amount_paid}
Transaction ID: {purchase.transaction_id}

Login to start learning:
https://educoursepro.vercel.app/login

Thank you for choosing EduCoursePro!
Team EduCoursePro
        '''
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [purchase.user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f'Email error: {e}')


class InitiatePurchaseView(APIView):
    """
    Step 1: Create Razorpay order and return order details to frontend.
    Frontend opens Razorpay popup with these details.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_id = serializer.validated_data['course_id']
        course = get_object_or_404(Course, pk=course_id, is_active=True)

        # Check already purchased
        existing = Purchase.objects.filter(
            user=request.user,
            course=course,
            payment_status='COMPLETED'
        ).first()

        if existing:
            return Response(
                {'error': 'You have already purchased this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create Razorpay order
        client = get_razorpay_client()
        amount_paise = int(float(course.price) * 100)  # Convert to paise

        razorpay_order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'course_id': str(course.id),
                'course_title': course.title,
                'user_id': str(request.user.id),
                'user_email': request.user.email,
            }
        })

        # Create PENDING purchase record
        purchase = Purchase.objects.create(
            user=request.user,
            course=course,
            payment_status=Purchase.PaymentStatus.PENDING,
            amount_paid=course.price,
            payment_method='RAZORPAY',
            transaction_id=razorpay_order['id'],
        )

        return Response({
            'order_id': razorpay_order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
            'course_title': course.title,
            'course_price': str(course.price),
            'purchase_id': purchase.id,
            'user_name': request.user.full_name,
            'user_email': request.user.email,
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """
    Step 2: Verify Razorpay payment signature.
    Called by frontend after successful payment popup.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'Missing payment details.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify signature
        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            # Mark as failed
            Purchase.objects.filter(
                transaction_id=razorpay_order_id
            ).update(payment_status=Purchase.PaymentStatus.FAILED)

            return Response(
                {'error': 'Payment verification failed. Please contact support.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Signature valid — mark purchase COMPLETED
        purchase = get_object_or_404(
            Purchase,
            transaction_id=razorpay_order_id,
            user=request.user
        )
        purchase.payment_status = Purchase.PaymentStatus.COMPLETED
        purchase.save()

        # Send confirmation email
        send_purchase_email(purchase)

        return Response({
            'success': True,
            'message': 'Payment successful! Course unlocked.',
            'purchase': PurchaseSerializer(purchase).data,
        }, status=status.HTTP_200_OK)


class UserPurchaseListView(generics.ListAPIView):
    """Student: list their purchases."""
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Purchase.objects.filter(
            user=self.request.user
        ).order_by('-purchased_at')


class CheckPurchaseView(APIView):
    """Check if current user has purchased a specific course."""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        is_purchased = Purchase.objects.filter(
            user=request.user,
            course_id=course_id,
            payment_status='COMPLETED'
        ).exists()
        return Response({'is_purchased': is_purchased})


# ─── Admin ───────────────────────────────────────────────────────────────────

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