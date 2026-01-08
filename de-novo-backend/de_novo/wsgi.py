"""
WSGI config for De-Novo project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'de_novo.settings')

application = get_wsgi_application()
