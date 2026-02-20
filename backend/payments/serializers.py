from rest_framework import serializers
from .models import Purchase
from courses.serializers import CourseListSerializer
from accounts.serializers import UserProfileSerializer


class PurchaseSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_thumbnail = serializers.ImageField(source='course.thumbnail', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'user_email', 'course_title', 'course_thumbnail',
                  'payment_status', 'amount_paid', 'payment_method',
                  'transaction_id', 'purchased_at']
        read_only_fields = ['purchased_at', 'user_email', 'course_title']


class PurchaseCourseSerializer(serializers.Serializer):
    """Initiate course purchase."""
    course_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50, default='CARD')


class AdminPurchaseSerializer(serializers.ModelSerializer):
    """Admin purchase view with full details."""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'
