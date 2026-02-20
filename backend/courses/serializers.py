from rest_framework import serializers
from .models import Course, Lecture


class LecturePublicSerializer(serializers.ModelSerializer):
    """Public lecture info — hides protected URLs."""
    youtube_embed_url = serializers.CharField(read_only=True)

    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'is_free', 'order',
                  'duration_minutes', 'youtube_embed_url']


class LectureProtectedSerializer(serializers.ModelSerializer):
    """Full lecture info for purchased users."""
    youtube_embed_url = serializers.CharField(read_only=True)

    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'video_file', 'youtube_url',
                  'youtube_embed_url', 'notes_pdf', 'is_free', 'order',
                  'duration_minutes', 'created_at']


class LectureAdminSerializer(serializers.ModelSerializer):
    """Full lecture serializer for admin CRUD."""
    youtube_embed_url = serializers.CharField(read_only=True)

    class Meta:
        model = Lecture
        fields = '__all__'


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight course serializer for listings."""
    lectures_count = serializers.SerializerMethodField()
    enrolled_count = serializers.IntegerField(read_only=True)
    is_purchased = serializers.SerializerMethodField()
    youtube_intro_embed = serializers.CharField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'thumbnail',
                  'is_active', 'lectures_count', 'enrolled_count',
                  'is_purchased', 'youtube_intro_url', 'youtube_intro_embed',
                  'created_at']

    def get_lectures_count(self, obj):
        return obj.lectures.count()

    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.purchases.filter(
                user=request.user, payment_status='COMPLETED'
            ).exists()
        return False


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed course with lectures — respects purchase status."""
    lectures = serializers.SerializerMethodField()
    lectures_count = serializers.SerializerMethodField()
    enrolled_count = serializers.IntegerField(read_only=True)
    is_purchased = serializers.SerializerMethodField()
    youtube_intro_embed = serializers.CharField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'thumbnail',
                  'intro_video', 'youtube_intro_url', 'youtube_intro_embed',
                  'is_active', 'lectures', 'lectures_count', 'enrolled_count',
                  'is_purchased', 'created_at', 'updated_at']

    def get_lectures(self, obj):
        request = self.context.get('request')
        is_admin = False
        is_purchased = False

        if request and request.user.is_authenticated:
            is_admin = request.user.role == 'ADMIN'
            is_purchased = obj.purchases.filter(
                user=request.user, payment_status='COMPLETED'
            ).exists()

        if is_admin:
            return LectureAdminSerializer(obj.lectures.all(), many=True, context=self.context).data
        elif is_purchased:
            return LectureProtectedSerializer(obj.lectures.all(), many=True, context=self.context).data
        else:
            return LecturePublicSerializer(obj.lectures.all(), many=True, context=self.context).data

    def get_lectures_count(self, obj):
        return obj.lectures.count()

    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.purchases.filter(
                user=request.user, payment_status='COMPLETED'
            ).exists()
        return False


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Admin course create/update serializer."""

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'thumbnail',
                  'intro_video', 'youtube_intro_url', 'is_active']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class CourseAdminSerializer(serializers.ModelSerializer):
    """Full admin course serializer with stats."""
    lectures_count = serializers.SerializerMethodField()
    enrolled_count = serializers.IntegerField(read_only=True)
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    lectures = LectureAdminSerializer(many=True, read_only=True)
    youtube_intro_embed = serializers.CharField(read_only=True)

    class Meta:
        model = Course
        fields = '__all__'

    def get_lectures_count(self, obj):
        return obj.lectures.count()