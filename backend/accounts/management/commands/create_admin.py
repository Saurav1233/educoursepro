import os
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Create default admin user'

    def handle(self, *args, **kwargs):
        email = os.environ.get('ADMIN_EMAIL', 'admin@educoursepro.com')
        password = os.environ.get('ADMIN_PASSWORD', '')

        if not password:
            self.stdout.write('❌ ADMIN_PASSWORD not set in environment!')
            return

        if not User.objects.filter(email=email).exists():
            User.objects.create_user(
                email=email,
                username='admin',
                first_name='Admin',
                last_name='User',
                password=password,
                role='ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True,
            )
            self.stdout.write(f'✅ Admin created: {email}')
        else:
            u = User.objects.get(email=email)
            u.set_password(password)
            u.save()
            self.stdout.write(f'✅ Password updated for: {email}')