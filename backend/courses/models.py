from django.db import models
from accounts.models import User
import re


def extract_youtube_embed(url):
    """Convert any YouTube URL format to embed URL."""
    if not url:
        return None
    pattern = r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    if match:
        return f'https://www.youtube.com/embed/{match.group(1)}'
    return None


class Course(models.Model):
    """Main course model with YouTube video support."""
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    intro_video = models.FileField(upload_to='courses/intro_videos/', null=True, blank=True)
    youtube_intro_url = models.URLField(max_length=500, null=True, blank=True,
                                        help_text="YouTube URL for intro preview e.g. https://www.youtube.com/watch?v=xxxxx")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def enrolled_count(self):
        return self.purchases.filter(payment_status='COMPLETED').count()

    @property
    def total_revenue(self):
        from django.db.models import Sum
        result = self.purchases.filter(payment_status='COMPLETED').aggregate(
            total=Sum('amount_paid')
        )
        return result['total'] or 0

    @property
    def youtube_intro_embed(self):
        return extract_youtube_embed(self.youtube_intro_url)


class Lecture(models.Model):
    """Lecture belonging to a course with YouTube video support."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='courses/lectures/videos/', null=True, blank=True)
    youtube_url = models.URLField(max_length=500, null=True, blank=True,
                                  help_text="YouTube URL e.g. https://www.youtube.com/watch?v=xxxxx")
    notes_pdf = models.FileField(upload_to='courses/lectures/notes/', null=True, blank=True)
    is_free = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lectures'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def youtube_embed_url(self):
        return extract_youtube_embed(self.youtube_url)