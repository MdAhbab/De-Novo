import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'de_novo.settings')
import django
django.setup()
from apps.users.models import User

user = User.objects.get(email='ahbab.md@gmail.com')
user.set_password('!12345678')
user.save()
print('Password reset successfully!')
