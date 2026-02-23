from django.core.mail import send_mail
from django.conf import settings


def send_purchase_email(purchase):
    subject = f'Purchase Confirmed - {purchase.course.title}'
    message = f'''
Hi {purchase.user.first_name},

Your purchase was successful!

Course: {purchase.course.title}
Amount Paid: ₹{purchase.amount_paid}
Transaction ID: {purchase.transaction_id}

Login to start learning:
https://educoursepro.vercel.app/login

Thank you!
EduCoursePro Team
    '''
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [purchase.user.email],
        fail_silently=True,
    )
    