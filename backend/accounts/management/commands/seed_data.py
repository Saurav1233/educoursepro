"""
Management command to seed the database with initial data.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from accounts.models import User
from courses.models import Course, Lecture
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create admin user
        if not User.objects.filter(email='admin@educoursepro.com').exists():
            admin = User.objects.create_user(
                email='admin@educoursepro.com',
                username='admin',
                first_name='Admin',
                last_name='User',
                password='Admin@123',
                role=User.Role.ADMIN,
            )
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Admin user created: admin@educoursepro.com / Admin@123'))

        # Create student user
        if not User.objects.filter(email='student@educoursepro.com').exists():
            User.objects.create_user(
                email='student@educoursepro.com',
                username='student',
                first_name='Student',
                last_name='User',
                password='Student@123',
                role=User.Role.STUDENT,
            )
            self.stdout.write(self.style.SUCCESS('✓ Student user created: student@educoursepro.com / Student@123'))

        # Create sample courses
        admin = User.objects.get(email='admin@educoursepro.com')

        courses_data = [
            {
                'title': 'Complete React Developer Course',
                'description': 'Master React from beginner to advanced. Build real-world projects with hooks, context, Redux, and more. Includes TypeScript and Next.js fundamentals.',
                'price': Decimal('49.99'),
            },
            {
                'title': 'Python & Django REST API Masterclass',
                'description': 'Build production-ready REST APIs with Django and Django REST Framework. Cover authentication, permissions, testing, and deployment.',
                'price': Decimal('59.99'),
            },
            {
                'title': 'Data Science with Python',
                'description': 'Learn data analysis, visualization, and machine learning with Python, Pandas, NumPy, Matplotlib, and Scikit-learn.',
                'price': Decimal('39.99'),
            },
        ]

        for course_data in courses_data:
            if not Course.objects.filter(title=course_data['title']).exists():
                course = Course.objects.create(
                    created_by=admin,
                    is_active=True,
                    **course_data,
                )
                # Add sample lectures
                Lecture.objects.create(
                    course=course, title='Introduction & Setup', is_free=True,
                    order=1, duration_minutes=15,
                    description='Welcome to the course! Set up your development environment.',
                )
                Lecture.objects.create(
                    course=course, title='Core Concepts', is_free=False,
                    order=2, duration_minutes=45,
                    description='Deep dive into the fundamental concepts.',
                )
                Lecture.objects.create(
                    course=course, title='Building Your First Project', is_free=False,
                    order=3, duration_minutes=60,
                    description='Put your knowledge to work with a real project.',
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Course created: {course.title}'))

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('\n📝 Login credentials:')
        self.stdout.write('  Admin:   admin@educoursepro.com / Admin@123')
        self.stdout.write('  Student: student@educoursepro.com / Student@123')
