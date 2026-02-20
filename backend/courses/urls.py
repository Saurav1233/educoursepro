from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    AdminCourseListCreateView,
    AdminCourseDetailView,
    AdminLectureListCreateView,
    AdminLectureDetailView,
    LectureAccessView,
    StudentPurchasedCoursesView,
)

urlpatterns = [
    # Public
    path('', CourseListView.as_view(), name='course_list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course_detail'),
    # Student
    path('my-courses/', StudentPurchasedCoursesView.as_view(), name='my_courses'),
    path('<int:course_pk>/lectures/<int:lecture_pk>/access/', LectureAccessView.as_view(), name='lecture_access'),
    # Admin
    path('admin/', AdminCourseListCreateView.as_view(), name='admin_course_list_create'),
    path('admin/<int:pk>/', AdminCourseDetailView.as_view(), name='admin_course_detail'),
    path('admin/<int:course_pk>/lectures/', AdminLectureListCreateView.as_view(), name='admin_lecture_list_create'),
    path('admin/<int:course_pk>/lectures/<int:pk>/', AdminLectureDetailView.as_view(), name='admin_lecture_detail'),
]
