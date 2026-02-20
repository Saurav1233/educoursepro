from django.contrib import admin
from .models import Course, Lecture


class LectureInline(admin.TabularInline):
    model = Lecture
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'is_active', 'created_by', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title']
    inlines = [LectureInline]


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'is_free', 'order']
    list_filter = ['is_free']
    search_fields = ['title', 'course__title']
