from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404

from .models import Course, Lecture
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateUpdateSerializer,
    CourseAdminSerializer,
    LectureAdminSerializer,
    LectureProtectedSerializer,
)
from .permissions import IsAdminOrReadOnly, HasCoursePurchased
from accounts.permissions import IsAdminRole


class CourseListView(generics.ListAPIView):
    """Public: list all active courses."""
    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Course.objects.filter(is_active=True).order_by('-created_at')


class CourseDetailView(generics.RetrieveAPIView):
    """Public: course detail with context-aware lecture data."""
    serializer_class = CourseDetailSerializer
    permission_classes = [AllowAny]
    queryset = Course.objects.filter(is_active=True)


# ─── Admin Course Management ────────────────────────────────────────────────

class AdminCourseListCreateView(generics.ListCreateAPIView):
    """Admin: list all courses and create new ones."""
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Course.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseAdminSerializer


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve, update, delete a course."""
    queryset = Course.objects.all()
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CourseCreateUpdateSerializer
        return CourseAdminSerializer


# ─── Lecture Management ──────────────────────────────────────────────────────

class AdminLectureListCreateView(generics.ListCreateAPIView):
    """Admin: manage lectures for a course."""
    serializer_class = LectureAdminSerializer
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Lecture.objects.filter(course_id=self.kwargs['course_pk'])

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs['course_pk'])
        serializer.save(course=course)


class AdminLectureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve, update, delete a lecture."""
    serializer_class = LectureAdminSerializer
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Lecture.objects.filter(course_id=self.kwargs['course_pk'])


# ─── Protected Content Access ────────────────────────────────────────────────

class LectureAccessView(APIView):
    """
    Check if user can access a lecture.
    Returns lecture data based on purchase status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_pk, lecture_pk):
        course = get_object_or_404(Course, pk=course_pk)
        lecture = get_object_or_404(Lecture, pk=lecture_pk, course=course)

        is_admin = request.user.role == 'ADMIN'
        is_purchased = request.user.purchases.filter(
            course=course, payment_status='COMPLETED'
        ).exists()

        if lecture.is_free or is_admin or is_purchased:
            serializer = LectureProtectedSerializer(lecture, context={'request': request})
            return Response(serializer.data)

        return Response(
            {'error': 'Purchase required to access this lecture.'},
            status=status.HTTP_403_FORBIDDEN
        )


class StudentPurchasedCoursesView(generics.ListAPIView):
    """Student: list their purchased courses."""
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        purchased_course_ids = self.request.user.purchases.filter(
            payment_status='COMPLETED'
        ).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=purchased_course_ids)
