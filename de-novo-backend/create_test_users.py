import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'de_novo.settings')
import django
django.setup()
from apps.users.models import User

# Create a test user
test_email = 'testuser@example.com'
if not User.objects.filter(email=test_email).exists():
    user = User.objects.create_user(
        email=test_email,
        username='testuser',
        password='test12345',
        first_name='Test',
        last_name='User'
    )
    print(f'Created test user: {user.email}')
else:
    print(f'Test user already exists: {test_email}')

# Create another user
test_email2 = 'demo@denovo.com'
if not User.objects.filter(email=test_email2).exists():
    user2 = User.objects.create_user(
        email=test_email2,
        username='demo',
        password='demo12345',
        first_name='Demo',
        last_name='User'
    )
    print(f'Created demo user: {user2.email}')
else:
    print(f'Demo user already exists: {test_email2}')

print('Done!')
