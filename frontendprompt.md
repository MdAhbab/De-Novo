# Google AI Studio Prompt: De-Novo React Frontend

Build a complete React frontend application for "De-Novo" - an accessible social communication platform for people with disabilities (deaf, mute, and blind users). Use React 18+, React Router v6 for navigation, and Tailwind CSS for styling.

## PROJECT STRUCTURE

Create the following folder structure:

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── AccessibilityToolbar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Modal.jsx
│   ├── chat/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── VoiceRecorder.jsx
│   │   ├── SentimentIndicator.jsx
│   │   └── ChatList.jsx
│   ├── accessibility/
│   │   ├── TextToSpeech.jsx
│   │   ├── SpeechToText.jsx
│   │   ├── ColorBlindToggle.jsx
│   │   └── ScreenReaderHelper.jsx
│   ├── mood/
│   │   ├── MoodPlayer.jsx
│   │   ├── SoundWaveVisualizer.jsx
│   │   └── MoodSelector.jsx
│   └── security/
│       ├── PeepingTomWarning.jsx
│       └── PrivacyShield.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── OnboardingPage.jsx
│   ├── DashboardPage.jsx
│   ├── ChatPage.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   ├── MoodZonePage.jsx
│   ├── ContactsPage.jsx
│   └── AccessibilitySettingsPage.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── AccessibilityContext.jsx
│   ├── ThemeContext.jsx
│   └── ChatContext.jsx
├── hooks/
│   ├── useTextToSpeech.js
│   ├── useSpeechToText.js
│   ├── useWebcamDetection.js
│   └── useSentimentAnalysis.js
├── utils/
│   ├── accessibilityHelpers.js
│   ├── colorBlindFilters.js
│   └── api.js
├── styles/
│   └── accessibility.css
├── App.jsx
└── main.jsx
```

---

## PAGE SPECIFICATIONS

### 1. LandingPage.jsx

- Hero section with large, readable text and high contrast
- Animated accessibility icons (eye, ear, speech bubble)
- "Get Started" CTA button with voice announcement on hover
- Features section highlighting: Text-to-Voice, Voice-to-Text, Mood Zone, Secure Chat
- Testimonials carousel (keyboard navigable)
- All images have descriptive alt text
- Skip navigation link at top

### 2. LoginPage.jsx

- Large input fields with clear labels
- Voice login option (speak credentials)
- Biometric login placeholder
- Remember me checkbox
- Forgot password link
- Social login options
- Real-time voice feedback on form errors
- High contrast mode toggle visible

### 3. RegisterPage.jsx

- Multi-step registration wizard:
  - **Step 1:** Basic info (name, email, password)
  - **Step 2:** Disability type selection (checkboxes for: Visual, Hearing, Speech impairments)
  - **Step 3:** Accessibility preferences (color blindness type, preferred font size, TTS speed)
  - **Step 4:** Profile photo (optional) with voice guidance
- Progress indicator with ARIA labels
- Voice-guided registration option

### 4. OnboardingPage.jsx

- Interactive tutorial showing platform features
- Swipeable cards explaining each feature
- Voice narration option
- Skip button
- Accessibility calibration (test TTS, STT, color settings)
- "Take a tour" with guided walkthrough

### 5. DashboardPage.jsx

- Welcome banner with user's name (announced by screen reader)
- Quick action tiles:
  - Start New Chat
  - View Messages
  - Mood Zone
  - Settings
- Recent conversations preview
- Mood status indicator
- Online friends list
- Notification center
- Floating accessibility toolbar

### 6. ChatPage.jsx

- Split view: contacts list (left), chat window (right)
- Message input with:
  - Text field
  - Voice recording button (hold to record)
  - Emoji picker (accessible)
  - Attachment button
- Each message shows:
  - Sender avatar
  - Message content
  - Timestamp
  - Sentiment indicator (happy/neutral/sad emoji based on AI analysis)
  - Read receipt
- Voice message playback with visual waveform
- Real-time "typing..." indicator
- Text-to-Speech button on each message
- Speech-to-Text for composing messages
- E2E encryption badge visible

### 7. ProfilePage.jsx

- Profile photo with change option
- Display name (editable)
- Bio section
- Disability badges (visual indicators of accessibility needs)
- Contact information
- Activity status toggle
- QR code for easy contact sharing
- Block/Report options

### 8. SettingsPage.jsx

**Sections:**
- Account Settings
- Privacy & Security
  - E2E encryption status
  - Peeping Tom detection toggle
  - Two-factor authentication
  - Blocked users
- Notification preferences
- Data & Storage
- Help & Support
- About

### 9. AccessibilitySettingsPage.jsx

**Visual Settings:**
- Font size slider (14px - 32px)
- High contrast mode toggle
- Color blindness filters (Protanopia, Deuteranopia, Tritanopia, Achromatopsia)
- Dark/Light theme toggle
- Reduce motion toggle

**Audio Settings:**
- Text-to-Speech voice selection
- Speech rate slider
- Pitch control
- Volume control
- Test TTS button

**Speech-to-Text Settings:**
- Language selection
- Continuous listening toggle
- Punctuation auto-insert
- Test STT button

**Navigation Settings:**
- Keyboard shortcuts toggle
- Focus indicators style
- Screen reader optimizations

### 10. MoodZonePage.jsx

- Current mood selector (emoji-based or voice input)
- Ambient sound categories:
  - Nature (rain, ocean, forest)
  - Music (lo-fi, classical, meditation)
  - White noise variants
- Visual sound wave animation
- Timer for relaxation sessions
- Mood history/journal
- Recommendations based on mood

### 11. ContactsPage.jsx

- Search bar with voice search
- Alphabetical contact list
- Contact cards showing:
  - Avatar
  - Name
  - Online status
  - Accessibility badges
- Add new contact button
- Import contacts option
- Filter by disability type

---

## NAVIGATION STRUCTURE

```jsx
// App.jsx routing structure
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedLayout />}>
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/chat/:conversationId" element={<ChatPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/profile/:userId" element={<ProfilePage />} />
    <Route path="/contacts" element={<ContactsPage />} />
    <Route path="/mood-zone" element={<MoodZonePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} />
  </Route>
  
  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## NAVBAR COMPONENT

- Logo (links to dashboard when logged in, landing when not)
- Navigation links: Dashboard, Chat, Contacts, Mood Zone
- Accessibility quick toggle button
- User avatar dropdown (Profile, Settings, Logout)
- Mobile hamburger menu
- Skip to main content link
- All links have focus indicators

---

## ACCESSIBILITY TOOLBAR (Floating)

Persistent floating button (bottom-right) that expands to show:
- Increase/Decrease font size
- Toggle high contrast
- Toggle color blind mode
- Enable/Disable TTS
- Enable/Disable STT
- Keyboard shortcuts help

---

## CONTEXT PROVIDERS

### AccessibilityContext

```jsx
{
  fontSize: number,
  highContrast: boolean,
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
  darkMode: boolean,
  ttsEnabled: boolean,
  ttsRate: number,
  sttEnabled: boolean,
  reduceMotion: boolean,
  focusIndicator: 'default' | 'bold' | 'outline'
}
```

### ThemeContext

```jsx
{
  theme: 'light' | 'dark' | 'high-contrast',
  primaryColor: string,
  applyColorBlindFilter: (mode) => void
}
```

---

## CRITICAL ACCESSIBILITY REQUIREMENTS

1. All interactive elements must be keyboard accessible
2. ARIA labels on all buttons and interactive elements
3. Role attributes where semantic HTML is insufficient
4. Focus management on route changes
5. Announce dynamic content changes to screen readers
6. Color contrast ratio minimum 4.5:1 (7:1 for high contrast mode)
7. All form inputs have associated labels
8. Error messages are announced
9. Loading states are communicated
10. No content relies solely on color to convey information

---

## STYLING GUIDELINES

- Use CSS custom properties for theming
- Implement smooth transitions (respect prefers-reduced-motion)
- Large touch targets (minimum 44x44px)
- Visible focus states on all interactive elements
- Responsive design (mobile-first)
- Use rem units for font sizes

---

## SAMPLE COLOR SCHEMES

```css
/* Default Theme */
--primary: #4F46E5;
--secondary: #10B981;
--background: #FFFFFF;
--text: #1F2937;
--accent: #F59E0B;

/* Dark Theme */
--primary: #818CF8;
--secondary: #34D399;
--background: #111827;
--text: #F9FAFB;

/* High Contrast */
--primary: #FFFF00;
--secondary: #00FFFF;
--background: #000000;
--text: #FFFFFF;
```

---

## HOOKS IMPLEMENTATION NOTES

### useTextToSpeech

- Use Web Speech API (window.speechSynthesis)
- Queue management for multiple texts
- Interrupt capability
- Voice selection

### useSpeechToText

- Use Web Speech API (webkitSpeechRecognition)
- Continuous listening mode
- Interim results display
- Error handling

### useWebcamDetection

- Access camera via navigator.mediaDevices
- Placeholder for CV model integration
- Privacy-respecting (user must enable)
- Visual indicator when active

---

## FINAL INSTRUCTIONS

Generate all components with full implementations, proper TypeScript types (if using TS), comprehensive accessibility attributes, and responsive styling. Include placeholder API calls that can be connected to the Django backend later.
