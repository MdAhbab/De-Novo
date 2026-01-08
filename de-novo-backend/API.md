# De-Novo Backend API Documentation

## Overview

De-Novo is an accessible social communication platform designed for people with disabilities. This backend provides REST APIs and WebSocket support for real-time communication.

## Quick Start

```bash
# Navigate to backend folder
cd de-novo-backend

# Run setup script (creates venv, installs deps, runs migrations)
python setup.py

# Or manual setup:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fixtures/accessibility_presets.json
python manage.py loaddata fixtures/ambient_sounds.json

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
SECRET_KEY=your-secret-key
DEBUG=True
GOOGLE_API_KEY=your-gemini-api-key  # Required for AI features
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register new user |
| POST | `/api/users/login/` | Login (get JWT tokens) |
| POST | `/api/users/logout/` | Logout (blacklist token) |
| POST | `/api/users/token/refresh/` | Refresh access token |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/` | Get current user profile |
| PATCH | `/api/users/me/` | Update profile |
| GET | `/api/users/settings/accessibility/` | Get accessibility settings |
| PATCH | `/api/users/settings/accessibility/` | Update accessibility settings |
| GET | `/api/users/search/` | Search users |

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/contacts/` | List contacts |
| POST | `/api/users/contacts/` | Add contact |
| DELETE | `/api/users/contacts/{id}/` | Remove contact |
| POST | `/api/users/block/` | Block user |
| POST | `/api/users/unblock/` | Unblock user |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations/` | List conversations |
| POST | `/api/chat/conversations/` | Start new conversation |
| GET | `/api/chat/conversations/{id}/` | Get conversation details |
| GET | `/api/chat/conversations/{id}/messages/` | Get messages in conversation |
| POST | `/api/chat/messages/` | Send message |
| POST | `/api/chat/voice/upload/` | Upload voice message |
| POST | `/api/chat/voice/transcribe/` | Transcribe voice message |

### AI Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/tts/` | Text-to-Speech |
| POST | `/api/ai/stt/` | Speech-to-Text |
| POST | `/api/ai/sentiment/` | Analyze sentiment |
| POST | `/api/ai/assistant/` | AI assistant (help, compose) |
| POST | `/api/ai/face-detection/` | Detect faces (privacy) |
| GET | `/api/ai/tts/voices/` | List available TTS voices |
| GET | `/api/ai/status/` | AI services status |

### Mood & Wellness

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/mood/entry/` | Get/Create mood entry |
| GET | `/api/mood/history/` | Mood history |
| GET | `/api/mood/analytics/` | Mood analytics |
| GET | `/api/mood/sounds/` | List ambient sounds |
| GET | `/api/mood/sounds/recommendations/` | Get recommendations |
| POST | `/api/mood/sessions/start/` | Start listening session |
| POST | `/api/mood/sessions/end/` | End listening session |

### Accessibility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accessibility/presets/` | List presets |
| POST | `/api/accessibility/presets/apply/` | Apply preset |
| GET/POST | `/api/accessibility/quick-phrases/` | Quick phrases |
| GET/POST | `/api/accessibility/feedback/` | Submit feedback |
| GET | `/api/accessibility/tips/` | Get tips |

### Security

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/security/alerts/` | Privacy alerts |
| POST | `/api/security/alerts/dismiss/` | Dismiss alert |
| GET | `/api/security/sessions/` | Active sessions |
| POST | `/api/security/sessions/{id}/terminate/` | End session |
| GET | `/api/security/events/` | Security events |
| GET/POST | `/api/security/devices/` | Trusted devices |
| GET | `/api/security/summary/` | Security dashboard |

## WebSocket

Connect to WebSocket for real-time chat:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/{conversation_id}/?token={jwt_token}');

// Send message
ws.send(JSON.stringify({
  type: 'chat_message',
  message: 'Hello!',
  is_encrypted: false
}));

// Receive message
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chat_message') {
    console.log('New message:', data);
  }
};
```

## Request/Response Format

### Successful Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Authentication

Use JWT tokens for authentication:

```
Authorization: Bearer <access_token>
```

Access tokens expire in 60 minutes. Use refresh token to get new access token:

```bash
curl -X POST /api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'
```

## Example: Register and Login

```bash
# Register
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "disability_type": "visual"
  }'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

## Example: Send Message with TTS

```bash
# Send message
curl -X POST http://localhost:8000/api/chat/messages/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": 1,
    "content": "Hello, how are you?"
  }'

# Convert to speech
curl -X POST http://localhost:8000/api/ai/tts/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "voice": "en-US-Neural2-D"
  }'
```

## CORS Configuration

CORS is configured to allow requests from:
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000

For production, update `CORS_ALLOWED_ORIGINS` in settings.

## Running with WebSockets

For WebSocket support, use Daphne (installed with requirements):

```bash
# Install Redis (required for Channels)
brew install redis  # macOS
# or
sudo apt install redis-server  # Ubuntu

# Start Redis
redis-server

# Run with Daphne
daphne -b 0.0.0.0 -p 8000 de_novo.asgi:application
```

## Project Structure

```
de-novo-backend/
├── apps/
│   ├── users/          # User auth, profiles, contacts
│   ├── chat/           # Messaging, WebSocket
│   ├── ai_services/    # TTS, STT, sentiment, AI assistant
│   ├── mood/           # Mood tracking, ambient sounds
│   ├── accessibility/  # Presets, quick phrases
│   └── security/       # Privacy alerts, sessions
├── services/
│   ├── encryption.py   # E2E encryption utilities
│   └── gcp_client.py   # Google Cloud client manager
├── fixtures/           # Initial data
├── de_novo/            # Django project settings
├── requirements.txt
├── manage.py
└── setup.py
```

## Google Cloud Setup

1. Create a Google Cloud project
2. Enable APIs: Speech-to-Text, Text-to-Speech, Cloud Vision
3. Create API key for Gemini (https://aistudio.google.com)
4. Add to `.env`: `GOOGLE_API_KEY=your-api-key`

For service account (optional, for Cloud APIs):
1. Create service account in GCP Console
2. Download JSON key file
3. Add to `.env`: `GCP_CREDENTIALS_FILE=/path/to/credentials.json`
