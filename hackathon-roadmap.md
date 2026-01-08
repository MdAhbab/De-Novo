# Unified Social Platform for Accessible Communication
## Hackathon Development Roadmap (36-48 Hours)

---

## 🎯 Hackathon Reality Check

**You are a BEGINNER** in these technologies. This means:
- ✅ **DO** focus on working MVP over perfection
- ✅ **DO** leverage pre-built libraries heavily
- ✅ **DO** cut scope aggressively
- ❌ **DON'T** build AI models from scratch during hackathon
- ❌ **DON'T** implement all accessibility features perfectly
- ❌ **DON'T** worry about production-grade security yet

**Winning Hackathon Formula:** Working demo > Perfect code

---

## 📊 Feature Prioritization (MoSCoW Method)

### **MUST-HAVE (Core MVP - Deploy These)**
1. ✅ User authentication (signup/login - Django)
2. ✅ Text-based chat interface (Django backend + React frontend)
3. ✅ Basic accessibility UI toggle (light/dark mode + large text)
4. ✅ Simple message storage (SQLite for local hackathon, MySQL optional)

### **SHOULD-HAVE (If Time Permits - Next 12-24 Hours)**
1. 🔷 Text-to-Speech for chat messages (use Web Speech API - frontend only)
2. 🔷 Speech-to-Text input (use Web Speech API - no ML needed)
3. 🔷 Basic sentiment indicator (emoji reaction system, no AI needed)
4. 🔷 Color-blind friendly UI option (built-in CSS themes)

### **COULD-HAVE (Dream Features - Ignore for Hackathon)**
1. 💭 End-to-End encryption (too complex for 48 hours)
2. 💭 Mood-based music recommendations (requires APIs you don't have time to integrate)
3. 💭 "Peeping Tom" detection (requires hardware + CV training)
4. 💭 Gemma-3 AI integration (requires API setup + token management)
5. 💭 MongoDB database (stick with SQLite/PostgreSQL for speed)

### **WON'T-HAVE (For This Hackathon)**
1. 🚫 Computer Vision security features (too time-consuming)
2. 🚫 Custom AI model training (use APIs instead)
3. 🚫 Mobile app (web-only for speed)
4. 🚫 Advanced encryption (basic HTTPS is enough for demo)

---

## ⏱️ TIMELINE: 48-Hour Hackathon Breakdown

### **PHASE 1: Project Setup & Infrastructure (0-2 Hours)**

#### Hour 0-0.5: Environment Setup
```bash
# Backend setup (Django)
mkdir accessible-social-platform
cd accessible-social-platform
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install django djangorestframework django-cors-headers python-dotenv

# Frontend setup (React)
npx create-vite frontend --template react
cd frontend
npm install axios zustand
```

#### Hour 0.5-1: Django Project Initialization
```bash
# Backend
django-admin startproject config .
python manage.py startapp chat
python manage.py startapp users
python manage.py migrate
```

#### Hour 1-2: Git & Deployment Prep
- Push to GitHub immediately
- Set up Vercel (frontend) and Railway/Render (backend) accounts
- Don't worry about connecting yet—just have accounts ready

**Deliverable:** ✅ Both Django backend and React frontend running locally

---

### **PHASE 2: Backend Foundation (2-6 Hours)**

#### Hour 2-3: User Authentication (Django)
**File: `users/models.py`**
```python
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    is_deaf = models.BooleanField(default=False)
    is_blind = models.BooleanField(default=False)
    is_mute = models.BooleanField(default=False)
    accessibility_preference = models.CharField(
        max_length=20,
        choices=[('normal', 'Normal'), ('large_text', 'Large Text'), 
                 ('high_contrast', 'High Contrast'), ('colorblind', 'Color-blind')],
        default='normal'
    )
```

**File: `users/serializers.py`**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'accessibility_preference']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
```

**File: `users/views.py`**
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer

User = get_user_model()

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
```

**Install JWT:**
```bash
pip install djangorestframework-simplejwt
```

**File: `config/urls.py`**
```python
from django.contrib import admin
from django.urls import path, include
from users.views import register, login

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', register),
    path('api/auth/login/', login),
    path('api/', include('chat.urls')),
]
```

#### Hour 3-4: Chat API (Django)
**File: `chat/models.py`**
```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:50]}"
```

**File: `chat/serializers.py`**
```python
from rest_framework import serializers
from .models import Message
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True)
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_id', 'receiver_id', 'content', 'timestamp', 'is_read']

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        sender_id = validated_data.pop('sender_id')
        receiver_id = validated_data.pop('receiver_id')
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        return Message.objects.create(sender=sender, receiver=receiver, **validated_data)
```

**File: `chat/views.py`**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(sender=user) | Message.objects.filter(receiver=user)

    def create(self, request, *args, **kwargs):
        request.data['sender_id'] = request.user.id
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        # Get all unique conversations for this user
        user = request.user
        senders = Message.objects.filter(receiver=user).values_list('sender', flat=True).distinct()
        receivers = Message.objects.filter(sender=user).values_list('receiver', flat=True).distinct()
        all_users = set(senders) | set(receivers)
        all_users.discard(user.id)
        
        users = User.objects.filter(id__in=all_users)
        return Response(UserSerializer(users, many=True).data)

    @action(detail=False, methods=['get'])
    def with_user(self, request):
        user_id = request.query_params.get('user_id')
        messages = Message.objects.filter(
            (Q(sender=request.user, receiver_id=user_id) | 
             Q(receiver=request.user, sender_id=user_id))
        ).order_by('timestamp')
        return Response(MessageSerializer(messages, many=True).data)
```

**File: `chat/urls.py`**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
```

**File: `config/settings.py` - Add to INSTALLED_APPS**
```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'django_filters',
    'users',
    'chat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

AUTH_USER_MODEL = 'users.CustomUser'
```

```bash
python manage.py makemigrations
python manage.py migrate
```

**Deliverable:** ✅ Working authentication + chat message API

#### Hour 4-6: Test API Endpoints
- Use Postman/Insomnia to test all endpoints
- Create test users
- Send/receive test messages
- Get conversations list

**Deliverable:** ✅ Fully tested backend ready for frontend integration

---

### **PHASE 3: React Frontend (6-14 Hours)**

#### Hour 6-8: Project Structure & Setup
**File: `frontend/src/config.js`**
```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

**File: `frontend/src/store/authStore.js`** (Using Zustand for state)
```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('access_token', token);
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

**File: `frontend/src/pages/Login.jsx`**
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_URL } from '../config';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password,
      });
      setToken(response.data.access);
      setUser(response.data.user);
      navigate('/chat');
    } catch (error) {
      alert('Login failed: ' + error.response.data.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      </form>
      <p>
        No account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
```

**File: `frontend/src/pages/Register.jsx`**
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessibilityPref, setAccessibilityPref] = useState('normal');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register/`, {
        username,
        email,
        password,
        accessibility_preference: accessibilityPref,
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed: ' + JSON.stringify(error.response.data));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <select
          value={accessibilityPref}
          onChange={(e) => setAccessibilityPref(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          <option value="normal">Normal</option>
          <option value="large_text">Large Text</option>
          <option value="high_contrast">High Contrast</option>
          <option value="colorblind">Color-blind Friendly</option>
        </select>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Register
        </button>
      </form>
      <p>
        Already have account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}
```

#### Hour 8-10: Chat UI Component
**File: `frontend/src/pages/Chat.jsx`**
```javascript
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_URL } from '../config';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [accessibility, setAccessibility] = useState('normal');
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations/`, {
        headers,
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  };

  // Fetch messages with selected user
  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/with_user/`, {
        params: { user_id: selectedUser.id },
        headers,
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await axios.post(
        `${API_URL}/messages/`,
        {
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: newMessage,
        },
        { headers }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const speakMessage = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setNewMessage(transcript);
    };
    recognition.start();
  };

  const getTheme = () => {
    const themes = {
      normal: { bg: '#fff', text: '#000', fontSize: '14px' },
      large_text: { bg: '#fff', text: '#000', fontSize: '20px' },
      high_contrast: { bg: '#000', text: '#fff', fontSize: '14px' },
      colorblind: { bg: '#fef5e7', text: '#1a3a3a', fontSize: '14px' },
    };
    return themes[accessibility] || themes.normal;
  };

  const theme = getTheme();

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          borderRight: '1px solid #ddd',
          padding: '10px',
          backgroundColor: theme.bg,
          color: theme.text,
        }}
      >
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <h3>Chats</h3>
          <button onClick={logout} style={{ padding: '5px 10px' }}>
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Accessibility: </label>
          <select
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="normal">Normal</option>
            <option value="large_text">Large Text</option>
            <option value="high_contrast">High Contrast</option>
            <option value="colorblind">Color-blind</option>
          </select>
        </div>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedUser(conv)}
            style={{
              padding: '10px',
              backgroundColor: selectedUser?.id === conv.id ? '#007bff' : '#f0f0f0',
              color: selectedUser?.id === conv.id ? '#fff' : theme.text,
              marginBottom: '5px',
              cursor: 'pointer',
              borderRadius: '5px',
              fontSize: theme.fontSize,
            }}
          >
            {conv.username}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.bg }}>
        {selectedUser ? (
          <>
            <div
              style={{
                padding: '15px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#007bff',
                color: '#fff',
              }}
            >
              <h3>Chat with {selectedUser.username}</h3>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                color: theme.text,
                fontSize: theme.fontSize,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '10px',
                    textAlign: msg.sender.id === user.id ? 'right' : 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: msg.sender.id === user.id ? '#007bff' : '#e0e0e0',
                      color: msg.sender.id === user.id ? '#fff' : theme.text,
                      padding: '10px',
                      borderRadius: '5px',
                      maxWidth: '60%',
                      wordWrap: 'break-word',
                    }}
                  >
                    {msg.content}
                    <button
                      onClick={() => speakMessage(msg.content)}
                      style={{ marginLeft: '5px', padding: '2px 5px', fontSize: '10px' }}
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                padding: '15px',
                borderTop: '1px solid #ddd',
                display: 'flex',
                gap: '5px',
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type message..."
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: theme.fontSize,
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: '1px solid #ddd',
                }}
              />
              <button
                onClick={startVoiceInput}
                style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff' }}
              >
                🎤
              </button>
              <button
                onClick={sendMessage}
                style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff' }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### Hour 10-12: Routing & UI Polish
**File: `frontend/src/App.jsx`**
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </Router>
  );
}
```

**File: `frontend/src/main.jsx`**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Install dependencies:**
```bash
npm install react-router-dom
```

#### Hour 12-14: Testing & Bug Fixes
- Test authentication flow (register → login → chat)
- Test sending/receiving messages
- Test accessibility toggles
- Test voice input/output
- Fix any UI issues
- Test on phone (mobile responsive)

**Deliverable:** ✅ Full working chat application with basic accessibility

---

### **PHASE 4: Final Polish & Deployment (14-20 Hours)**

#### Hour 14-15: README & Documentation
**File: `README.md`**
```markdown
# Unified Social Platform for Accessible Communication

## Features
- 🔐 Secure user authentication
- 💬 Real-time text chat
- 🔊 Text-to-Speech for messages
- 🎤 Speech-to-Text input
- ♿ Accessibility modes (Large Text, High Contrast, Color-blind friendly)
- 🌙 Dark mode support

## Tech Stack
- **Backend:** Django, Django REST Framework, SQLite
- **Frontend:** React, Vite, Zustand
- **Authentication:** JWT

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials (for testing)
- Username: `testuser`
- Password: `testpass123`

## Accessibility Features
- **Large Text Mode:** Increases font size to 20px
- **High Contrast:** Black background with white text
- **Color-blind Friendly:** Uses accessible color palette
- **Voice Input/Output:** Built-in speech recognition and synthesis

## Future Enhancements
- Real-time WebSocket chat
- Group conversations
- Video calling
- Mood-based recommendations
- Advanced security features
```

#### Hour 15-16: Deploy Backend
**Option A: Railway (Recommended for beginners)**
1. Push to GitHub
2. Connect Railway to GitHub repo
3. Add environment variables
4. Deploy with one click

**Option B: Render**
1. Sign up at render.com
2. Connect GitHub
3. Create new web service
4. Select backend folder
5. Add build command: `pip install -r requirements.txt && python manage.py migrate`
6. Deploy

**File: `requirements.txt`** (in root)
```
Django==4.2
djangorestframework==3.14.0
django-cors-headers==4.1.0
djangorestframework-simplejwt==5.2.2
python-dotenv==1.0.0
gunicorn==21.2.0
```

#### Hour 16-18: Deploy Frontend
**Vercel Deployment (1-minute setup)**
1. Push to GitHub
2. Go to vercel.com
3. Import GitHub repo
4. Select frontend folder
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy

**After deployment, update Django CORS settings:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-frontend-url.vercel.app",
]
```

#### Hour 18-20: Final Testing & Presentation Prep
- Test on deployed URLs
- Create 2-minute demo video
- Prepare pitch:
  - Problem: Accessibility barriers in social communication
  - Solution: Unified platform with built-in accessibility features
  - Key Features: Text-to-speech, speech-to-text, multiple UI modes
  - Impact: Enables 1 billion+ people with disabilities to connect
  - Tech: Django + React + Web Speech API

---

## 🎬 DEMO SCRIPT (2 Minutes)

```
[0:00-0:15] - Problem Statement
"Billions of people with hearing, speech, or visual impairments struggle to 
participate in standard social platforms. Our solution changes that."

[0:15-0:45] - Core Features Demo
1. Quick register/login
2. Start chat with another user
3. Show large text mode
4. Show high contrast mode
5. Send voice message
6. Click speak on received message

[0:45-1:30] - Technical Overview
- Django backend with JWT authentication
- React frontend with Zustand state management
- Web Speech API for accessibility
- Multiple database support (SQLite → MySQL)
- Deployment-ready (Vercel + Railway)

[1:30-2:00] - Future Vision & Impact
- Real-time WebSocket chat
- Group conversations
- AI sentiment analysis
- Computer vision security
- Helps 1B+ people with disabilities participate
```

---

## 📋 SUBMISSION CHECKLIST

- [ ] Both backend and frontend deployed and running
- [ ] 2-minute demo video recorded
- [ ] README with quick start guide
- [ ] GitHub repo with clean code
- [ ] Pitch deck (5-10 slides)
- [ ] Video walkthrough of features
- [ ] Test accounts created for judges
- [ ] Accessibility features working
- [ ] Voice input/output functional
- [ ] Multiple UI theme options working

---

## 🚨 COMMON PITFALLS TO AVOID

1. **❌ Trying to build everything perfectly** → Focus on working MVP
2. **❌ Over-engineering** → Use simple solutions, add complexity later
3. **❌ Forgetting deployment early** → Deploy by hour 18, not 47
4. **❌ No testing before demo** → Test with fresh users 3 hours before presentation
5. **❌ Over-complicated AI** → Use Web Speech API (built-in browser API, free, works instantly)
6. **❌ Database issues** → Use SQLite for hackathon, migrate later if needed
7. **❌ CORS errors at last minute** → Handle CORS setup early
8. **❌ Messy UI** → Simple clean design beats fancy broken design
9. **❌ No accessibility for accessibility project** → Make sure your app IS accessible
10. **❌ Demo failure** → Have offline version ready as backup

---

## 🏆 WINNING TIPS

1. ✅ **Ship early, iterate fast** → First working version by hour 12
2. ✅ **Focus on impact** → Story + data + demo > perfect code
3. ✅ **Accessible by default** → Your app must follow its own principles
4. ✅ **Clean codebase** → Judges check GitHub; clean code impresses
5. ✅ **Real data** → Don't just show mockups; have actual test users
6. ✅ **Practice pitch** → Deliver 2-min pitch 10 times before presentation
7. ✅ **Help users understand** → Clear UI > complex features
8. ✅ **Show passion** → You're solving real problems for real people
9. ✅ **Have a backup plan** → If one feature breaks, have fallback demo
10. ✅ **Rest smartly** → 15-20 hours sleep total across 2 days; don't crash

---

## 📞 RESOURCES

- **Django Docs:** https://docs.djangoproject.com/
- **React Docs:** https://react.dev/
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **JWT Guide:** https://jwt.io/
- **Accessibility (WCAG):** https://www.w3.org/WAI/WCAG21/quickref/

---

**Remember: Your goal is a working demo, not production code. Focus on the user experience and the story. You've got this! 🚀**
