#!/usr/bin/env python
"""
Setup script for De-Novo backend.
Run this after cloning to set up the environment.
"""

import os
import shutil
import subprocess
import sys


def main():
    print("=" * 50)
    print("De-Novo Backend Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")
    
    # Create .env from example if it doesn't exist
    if not os.path.exists('.env'):
        if os.path.exists('.env.example'):
            shutil.copy('.env.example', '.env')
            print("✅ Created .env from .env.example")
            print("⚠️  Please edit .env with your configuration")
        else:
            print("⚠️  No .env.example found, please create .env manually")
    else:
        print("✅ .env already exists")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'])
        print("✅ Virtual environment created")
    
    # Determine pip path
    if os.name == 'nt':  # Windows
        pip_path = os.path.join('venv', 'Scripts', 'pip')
        python_path = os.path.join('venv', 'Scripts', 'python')
    else:  # Unix/macOS
        pip_path = os.path.join('venv', 'bin', 'pip')
        python_path = os.path.join('venv', 'bin', 'python')
    
    # Install requirements
    print("Installing requirements...")
    subprocess.run([pip_path, 'install', '-r', 'requirements.txt'])
    print("✅ Requirements installed")
    
    # Run migrations
    print("Running migrations...")
    subprocess.run([python_path, 'manage.py', 'makemigrations'])
    subprocess.run([python_path, 'manage.py', 'migrate'])
    print("✅ Migrations complete")
    
    # Load fixtures
    print("Loading initial data...")
    fixtures = [
        'fixtures/accessibility_presets.json',
        'fixtures/ambient_sounds.json',
    ]
    for fixture in fixtures:
        if os.path.exists(fixture):
            subprocess.run([python_path, 'manage.py', 'loaddata', fixture])
            print(f"  ✅ Loaded {fixture}")
    
    print("\n" + "=" * 50)
    print("Setup Complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Edit .env with your configuration (especially GOOGLE_API_KEY)")
    print("2. Create a superuser: python manage.py createsuperuser")
    print("3. Run the server: python manage.py runserver")
    print("\nFor WebSocket support (optional):")
    print("  - Install Redis: brew install redis (macOS)")
    print("  - Start Redis: redis-server")
    print("  - Run with Daphne: daphne -b 0.0.0.0 -p 8000 de_novo.asgi:application")


if __name__ == '__main__':
    main()
