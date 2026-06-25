# De-Novo — Full-Stack Engineering, UX & Accessibility Audit

**Product:** De-Novo — *Unified Social Platform for Accessible Communication* (Django REST + Channels backend, React 19 + Vite + Tailwind frontend).
**Audit scope:** Backend, frontend, API contract, security/privacy, accessibility (WCAG), UI/UX & visual design, performance, code quality, DevOps.
**Audit date:** 2026-06-25
**Auditor persona:** Senior full-stack + UI/UX reviewer.

> **How to read this document.** Findings are grouped by domain and tagged with a severity and a stable ID (e.g. `SEC-01`, `API-03`, `A11Y-02`). Each finding lists *Where*, *Problem*, *Impact*, and *Recommended fix*. Section 1 is the executive summary; Section 16 is a prioritized remediation roadmap you can hand straight to an implementing agent. File references use `path:line` form.

---

## 1. Executive Summary

De-Novo is an ambitious, feature-rich accessibility platform with a genuinely strong *visual* design language (consistent teal primary, Manrope type, Material Symbols, dark mode, thoughtful empty states). The frontend component craft is high. **However, the application is currently non-functional end-to-end for most of its advertised features**, and several of its headline security/privacy claims are not implemented.

The single most damaging class of problem is a **systemic API contract mismatch**: the frontend `utils/api.js` calls URLs and payload shapes that do not match the Django `urls.py`/serializers in roughly half the app (mood, contacts, profile update, accessibility quick-phrases/feedback, security, logout). Because of this, **Mood Zone, Contacts, profile editing, quick phrases, accessibility persistence, and the security/sessions screens cannot work even when the backend is running.**

The second class is **"demo-ware" pages**: Dashboard, Settings, Profile, Accessibility, and large parts of Mood Zone render hardcoded placeholder data (fake conversations, fake friends, fake journal, fake audio player, "Jane Doe / Alex M." identities) that ignore the real authenticated user and the real backend. These look finished but do nothing.

The third class is **security & honesty**: live Google API keys are committed to the repo; the "End-to-End Encryption" service exists but is never wired in (messages are stored as plaintext and read server-side for sentiment), so the "developers have zero access" / "E2E Encrypted" claims are currently false; and the privacy webcam turns itself on for every authenticated page without consent.

### Severity scorecard

| Severity | Count | Examples |
|---|---|---|
| 🔴 Critical | 8 | Committed API keys + a real personal credential, false E2E claim, broken auth/profile contract, non-consensual camera |
| 🟠 High | 19 | Mood/contacts/security endpoint mismatches, security app 500s on wrong field names, dead WebSocket layer, `user.name` undefined everywhere, DB config mismatch |
| 🟡 Medium | 23 | Hardcoded UI data, a11y regressions, toast/alert UX, settings not persisted, no error boundaries |
| 🟢 Low / Polish | 20+ | Copy bugs, invalid Tailwind classes, `class` vs `className`, dead code, `© 2023` |

### Top 10 things to fix first
1. **Rotate and remove the committed Google API keys** (`SEC-01`).
2. **Establish one source of truth for the API contract** and fix every mismatch (`API-*`).
3. **Decide on the E2E story** — either implement it or stop claiming it (`SEC-02`).
4. **Make the camera opt-in with explicit consent** (`SEC-04`).
5. **Fix the user identity field** (`user.name` is undefined app-wide) (`FE-01`).
6. **Pick one DB** (settings say MySQL, repo ships SQLite) so the app boots (`BE-01`).
7. **Wire real data into Dashboard / Mood / Settings / Profile / Accessibility** (`FE-10`–`FE-14`).
8. **Replace `alert()` and silent failures with a real toast/notification system** (`UX-01`).
9. **Fix the WebSocket auth** or formally commit to polling and delete the dead WS layer (`BE-04`).
10. **Add a global error boundary + consistent API error handling** (`FE-04`).

---

## 2. Architecture Overview (as-built)

```
frontend/ (React 19, Vite 7, Tailwind 4, react-router 7)
  ├─ context/  AuthContext, ThemeContext, AccessibilityContext, ChatContext
  ├─ hooks/    useSpeechToText, useTextToSpeech, useSentimentAnalysis, useWebcamDetection
  ├─ pages/    Landing, Login, Register, Onboarding, Dashboard, Chat, MoodZone,
  │            Contacts(stub), Settings, Profile, Accessibility
  ├─ components/common/  Navbar, Footer, LoadingSpinner, AccessibilityToolbar, PrivacyMonitor
  └─ utils/api.js  ← single fetch wrapper (the contract surface)

de-novo-backend/ (Django 4.2, DRF, SimpleJWT, Channels/Daphne)
  ├─ apps/users         auth, profile, contacts, blocking, search
  ├─ apps/chat          conversations, messages, read receipts, voice, WS consumer
  ├─ apps/accessibility presets, quick phrases, feedback, tips
  ├─ apps/mood          mood entries, ambient sounds, sessions, analytics
  ├─ apps/security      alerts, sessions, devices, events
  ├─ apps/ai_services   TTS, STT, sentiment, Gemma assistant, face detection
  └─ services/          gcp_client (REST to Google APIs), encryption (unused)
```

**Cross-cutting observations**
- The frontend talks to the backend **only via polling** (`ChatContext` `setInterval`), yet a full **Channels WebSocket stack** (Daphne, Redis, consumer, routing) is configured but unused and, as written, non-functional with JWT auth. This is significant dead weight and operational cost.
- The response envelope is *mostly* consistent (`{success, data, message}` / `{success:false, error:{message}}`), which is good — but several list endpoints wrap data in nested objects (`data.sounds`, `data.presets`, `data.phrases`) that the frontend does not unwrap, and DRF pagination silently changes the shape of `MessageListView`.
- There is **no automated test** anywhere (frontend or backend), **no CI**, and **no API schema** (OpenAPI) to keep the two sides honest.

---

## 3. 🔴 Critical Security & Privacy Findings

### SEC-01 — Live Google API keys committed to the repository 🔴
**Where:** `de-novo-backend/.env:12` (`GOOGLE_API_KEY=AIza…`), `.env:15` (`GCP_API_KEY=AIza…`); `.env` is git-tracked (confirmed via `git ls-files`). `settings.py:99` also hardcodes a default DB password `'12345678'`. **Additionally `reset_password.py:7-9` commits a real personal email (`ahbab.md@gmail.com`) and resets it to a known password (`!12345678`)**, and `create_test_users.py` commits test credentials (`test12345`, `demo12345`).
**Problem:** Real, working secrets *and a real personal account credential* are in version control. Anyone with repo access (or anyone who ever cloned it) can bill your Google Cloud project (Speech, TTS, Vision, NLP, Gemini), log into that personal account, and exfiltrate data.
**Impact:** Financial (unbounded quota abuse), data exposure, and the keys must be treated as permanently compromised.
**Fix:**
1. **Immediately revoke/rotate** both keys in Google Cloud Console.
2. Remove `.env` from git: add `de-novo-backend/.env` (and `*.env`, `db.sqlite3`, `__pycache__/`, `media/`, `staticfiles/`) to a backend `.gitignore` (currently **absent**), then `git rm --cached`.
3. Purge from history (`git filter-repo`/BFG) since the repo will be shared.
4. Restrict keys to specific APIs + HTTP referrers/IPs in GCP.
5. For server-side Google calls, prefer a **service account** (workload identity) over an API key in client-adjacent code.

### SEC-02 — "End-to-End Encryption" is claimed but not implemented 🔴
**Where:** Marketing/claims in `README.md`, `pages/SettingsPage.jsx:99-122` ("End-to-End Encryption is Active", "De-Novo cannot intercept your communications"), chat header "E2E Encrypted" badge (`pages/ChatPage.jsx:497`). Reality: `services/encryption.py` is a complete RSA+AES-GCM module that is **never imported or called**; `Message.content` is stored as **plaintext** (`apps/chat/models.py:107`), and the server reads that plaintext to run sentiment analysis (`apps/chat/views.py:189-195`, `consumers.py:226-239`).
**Problem:** The product asserts zero-access E2E encryption, but admins/DB have full plaintext access and the server actively reads message bodies. The `is_encrypted` field the UI keys off doesn't even exist on `ConversationSerializer`, so the badge logic is also dead.
**Impact:** This is both a **security gap** and a **truth-in-advertising / trust** problem for a product whose entire value proposition is safety for vulnerable users. It could constitute a material misrepresentation.
**Fix (choose one and be consistent):**
- **Option A (honest near-term):** Change all copy to "encrypted in transit (TLS) and at rest" and remove "zero access"/"E2E" claims and the badge until real E2E ships.
- **Option B (real E2E):** Do encryption **client-side** (Web Crypto API), store ciphertext only, exchange public keys via the existing `public_key` field, and **move sentiment analysis client-side** (you already have a local analyzer in `useSentimentAnalysis.js`) since the server can no longer read plaintext. Note this is a real architecture change, not a toggle.

### SEC-03 — `DEBUG=True` and insecure defaults are the shipping default 🔴
**Where:** `settings.py:21` (`DEBUG` defaults True), `:18` insecure `SECRET_KEY` default, `:23` `ALLOWED_HOSTS` localhost, no security middleware hardening.
**Problem:** No production hardening. Missing: `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS`, `SECURE_PROXY_SSL_HEADER`, `X_FRAME_OPTIONS`, secure `SECRET_KEY` enforcement.
**Fix:** Split settings (`base/dev/prod`) or gate hardening on `if not DEBUG:`. Fail fast if `SECRET_KEY` is the insecure default in prod. Add the standard Django deployment-checklist settings; run `python manage.py check --deploy`.

### SEC-04 — Webcam activates without consent on every authenticated page 🔴
**Where:** `components/common/PrivacyMonitor.jsx:131-137` calls `startMonitoring()` in a mount `useEffect`, wrapping the entire `ProtectedLayout` (`App.jsx:33`). It requests `getUserMedia` immediately and then **POSTs a JPEG frame to `/ai/face-detection/` every 2 seconds** indefinitely.
**Problem:** For an app serving privacy-sensitive, disabled users, silently turning on the camera and streaming frames to a server (and Google Vision) without explicit, revocable consent is a serious privacy violation — and likely a GDPR/biometric-consent issue (facial/emotion data). The user setting `peeping_tom_enabled` (default **False**, `users/models.py:68`) is **never consulted**.
**Impact:** Privacy breach, surprise camera light, continuous bandwidth + Vision API cost, battery drain, and emotional-data processing without basis.
**Fix:**
- Gate on an explicit opt-in (respect `peeping_tom_enabled`; show a one-time consent modal explaining what is captured, where it goes, and retention).
- Default OFF. Provide a always-visible "camera on" indicator and a one-click kill switch (the existing mini-cam is a start but it auto-starts).
- Strongly prefer **on-device** face counting (e.g. `FaceDetector`/`MediaPipe`/`face-api.js`) so raw frames never leave the device — this also fixes the cost and latency problems and is more consistent with the privacy brand.
- Never run two camera consumers at once (see `PERF-03`).

### SEC-05 — JWTs stored in `localStorage` (XSS-exfiltratable) 🔴/🟠
**Where:** `utils/api.js:4-13` stores `accessToken`/`refreshToken` in `localStorage`.
**Problem:** Any XSS (and the app injects a lot of untrusted-ish content, plus third-party fonts/scripts) can read tokens. Refresh tokens live 7 days (`settings.py:166`).
**Fix:** Prefer httpOnly, `Secure`, `SameSite` cookies for the refresh token with a short-lived in-memory access token; or at minimum add a strict CSP, Subresource Integrity on the Google Fonts links, and shorten refresh lifetime. Document the trade-off.

### SEC-06 — No rate limiting / brute-force protection on auth 🟠
**Where:** `apps/users/views.py` `LoginView`, `RegisterView`, `UserSearchView`.
**Problem:** Login/registration/search have no throttling → credential stuffing, user enumeration via search, and Google-API-cost amplification on AI endpoints (which are authenticated but unthrottled).
**Fix:** Add DRF throttling (`AnonRateThrottle`/`ScopedRateThrottle`), especially on `login`, `register`, `ai/*`, and `face-detection`. Add account lockout/backoff.

### SEC-07 — User/data enumeration & broad search exposure 🟡
**Where:** `UserSearchView` (`users/views.py:362`) matches `email__icontains` and returns `disability_type` for any 2-char query to any authenticated user.
**Problem:** Searching by email substring is an enumeration vector; **`disability_type` is sensitive health data** and is exposed in search results and `other_participant` payloads to anyone.
**Fix:** Search by username/display name only (not email substring); do not return health/disability data in search or to non-contacts; consider requiring a fuller query and rate-limiting.

### SEC-08 — `print()` used as logging across services 🟡
**Where:** `chat/views.py:197`, `consumers.py:241`, `mood/views.py:245`, `gcp_client.py:289`, `users/signals.py:17`.
**Problem:** Errors (including ones touching message content) go to stdout with no levels/structure; some swallow exceptions silently. The app defines a real `LOGGING` config that these bypass.
**Fix:** Use `logging.getLogger(__name__)`; never log message bodies; surface failures appropriately.

---

## 4. 🟠 API Contract Mismatches (the dominant functional defect)

The frontend `utils/api.js` and the Django `urls.py`/serializers have drifted apart. Below is a concrete map. **Each row marked ❌ is a feature that cannot work today.** Fixing these is the highest-leverage functional work in the whole project.

| ID | Feature | Frontend calls (`utils/api.js`) | Backend actually exposes | Status |
|---|---|---|---|---|
| API-01 | Logout blacklist | POST `/users/logout/` body `{refresh}` | View reads `request.data.get('refresh_token')` (`users/views.py:89`) | ❌ token never blacklisted |
| API-02 | Update profile | PATCH `/users/profile/` | `profile/` is **Retrieve-only**; update is `profile/update/` (`users/urls.py:19`) | ❌ 405/no-op |
| API-03 | Add contact | POST `/users/contacts/` `{contact_id}` | POST `/users/contacts/add/` `{username}` (`users/urls.py:29`) | ❌ 404 + wrong field |
| API-04 | Remove contact | DELETE `/users/contacts/{id}/` | DELETE `/users/contacts/{id}/remove/` | ❌ 404 |
| API-05 | Block/unblock | POST `/users/blocked/` / DELETE `/users/blocked/{id}/` | `/users/contacts/{id}/block/` & `/unblock/` (POST) | ❌ 404 |
| API-06 | Accessibility settings persist | (frontend only writes `localStorage`) | `/users/settings/accessibility/` exists but **is never called** | ❌ never persisted server-side |
| API-07 | Log mood | POST `/mood/entries/` | POST `/mood/entry/` (`mood/urls.py:10`) | ❌ 404 |
| API-08 | Mood history | GET `/mood/entries/?days=` | GET `/mood/history/` | ❌ 404 |
| API-09 | Mood stats | GET `/mood/stats/` | GET `/mood/analytics/` | ❌ 404 |
| API-10 | Recommended sounds | GET `/mood/sounds/recommended/?mood=` | GET `/mood/sounds/recommendations/` | ❌ 404 |
| API-11 | Log sound session | POST `/mood/sound-sessions/` | POST `/mood/sessions/start/` (+`/end/`) | ❌ 404 |
| API-12 | Sounds list shape | expects `data` = array | returns `data:{sounds:[…], categories:[…]}` (`mood/views.py:170`) | ❌ array check fails → empty |
| API-13 | Create quick phrase | `createQuickPhrase(data)` but context calls it `(text, category)` → body = string | POST `/accessibility/quick-phrases/` `{category, phrase}` | ❌ wrong payload |
| API-14 | Submit a11y feedback | `submitFeedback(feature,rating,comment)` but context calls `({feedback_text, feedback_type, current_settings})` | `{feature(choice), rating(1-5), comment}` | ❌ wrong payload + 400 |
| API-15 | Quick phrases list shape | expects `data` = array | returns `data:{phrases:[…], grouped:{…}}` | ❌ array check fails |
| API-16 | Presets list shape | expects `data` = array | returns `data:{presets:[…], grouped:{…}}` | ❌ |
| API-17 | Security alerts dismiss | PATCH `/security/alerts/{id}/` | POST `/security/alerts/dismiss/` | ❌ 404 |
| API-18 | Terminate session | DELETE `/security/sessions/{id}/` | DELETE→ actually `/security/sessions/{id}/terminate/` | ❌ 404 |
| API-19 | Trusted devices | `/security/trusted-devices/` | `/security/devices/` | ❌ 404 |
| API-20 | Messages list shape | reads `response.results || response.data` | `MessageListView` returns **paginated** (`{count,next,results}`) when page param present, else `{success,data}` — two different shapes | ⚠️ fragile, works by luck |
| API-21 | Register name | sends `display_name` | serializer accepts `first_name/last_name` only (`users/serializers.py:23`) → name dropped | ❌ name lost (see FE-01) |
| API-22 | Token refresh response | sets `data.refresh` (rotation) | SimpleJWT refresh returns `access` (+`refresh` only if rotation on — it is) | ⚠️ OK but verify blacklist app installed (see BE-06) |

**Recommended fix (structural, not row-by-row patching):**
1. **Introduce an OpenAPI schema** (`drf-spectacular`) generated from the backend, and **generate the frontend client** (or at least the endpoint constants/types) from it. This makes drift a build error.
2. Until then, create a single `endpoints.js` map and a typed response unwrap helper; align every backend list endpoint to return a **bare array in `data`** (move `categories/grouped` into siblings, not inside `data`).
3. Standardize: `data` is always the primary payload; never nest the collection one level deeper than the consumer expects.
4. Add **contract tests** (one test per endpoint asserting the exact shape the frontend consumes).

---

## 5. 🟠 Backend Findings

### BE-01 — Database configuration vs. shipped DB mismatch (app won't boot as-is) 🟠
**Where:** `settings.py:94-106` hardcodes the **MySQL** engine (`mysqlclient` required, password default `12345678`), but the repo ships `db.sqlite3` and the `.env.example` documents SQLite. `requirements.txt` pulls `mysqlclient`, `pymongo`, `channels-redis`, `celery` — i.e. MySQL + MongoDB + Redis + Celery are all implied but none are actually used by the models (everything is Django ORM; Mongo/Celery are referenced nowhere in code).
**Impact:** A fresh clone cannot `runserver` without a MySQL server and `mysqlclient` build toolchain, despite a SQLite file being present. New contributors will be blocked.
**Fix:** Use `dj-database-url`/`django-environ` to read a single `DATABASE_URL`, default to SQLite for dev. Remove `pymongo`, `celery`, and (if you commit to polling) `channels*`/`daphne`/`redis` from requirements, or actually use them. The README's "MySQL for core data, MongoDB for messages, Facebook-level security" description does not match the implementation (all data is in one relational DB) — reconcile docs with reality.

### BE-02 — `get_unread_count` / `get_last_message` cause N+1 queries 🟠
**Where:** `chat/serializers.py:70-92` runs `obj.messages.order_by().first()` and a `.exclude().count()` **per conversation**, inside a list serializer. `ConversationListView` prefetches `messages` but the serializer's `.order_by('-created_at')` re-queries.
**Impact:** Conversation list is O(N) queries; with the 10s polling loop this multiplies. Will not scale past a handful of conversations.
**Fix:** Annotate `unread_count` and last-message fields at the queryset level (`Subquery`/`annotate`), or maintain `last_message_*` denormalized fields already on `Conversation` (you have them — `models.py:42-50` — but the serializer ignores them and recomputes).

### BE-03 — `MarkConversationAsReadView` bulk-creates receipts for ALL messages, every poll 🟠
**Where:** `chat/views.py:232-261`, called by `ChatContext` on every conversation open and indirectly via polling.
**Problem:** It scans all unread messages and bulk-inserts receipts each call. Combined with the 3s message poll and 10s conversation poll, this is heavy write traffic. `get_is_read` (`serializers.py:31`) also does a per-message existence query (N+1 again).
**Fix:** Track a per-participant `last_read_at` timestamp on a `ConversationParticipant` through-model; compute unread as `messages.filter(created_at__gt=last_read_at)`. Far cheaper and avoids the receipt table exploding.

### BE-04 — WebSocket layer is configured but non-functional and unused 🟠
**Where:** `asgi.py` uses `AuthMiddlewareStack` (cookie/session auth), but clients authenticate via **JWT in localStorage** and the frontend **never opens a socket** (it polls). So `scope['user']` is always `AnonymousUser` → `consumers.py:21` closes the connection.
**Impact:** Dead, misleading infrastructure that still imposes Daphne/Redis as deploy dependencies; real-time typing indicators / instant delivery the consumer implements are never delivered.
**Fix:** Either (a) commit to real-time: add JWT auth middleware for Channels, switch the frontend `ChatContext` to a WebSocket and drop polling; or (b) commit to polling: delete `consumers.py`, `routing.py`, the Channels/Daphne/Redis deps, and use WSGI. Don't ship both.

### BE-05 — `AddContactView` ignores the unused `nickname`/contact relationship is one-directional 🟡
**Where:** `users/views.py:227`, `models.py:107`. Contacts are one-directional (`user → contact`) with no reciprocal/confirmation flow, no friend-request acceptance. `BlockUserView` (`:295`) and the URL `contacts/<id>/block/` use the **User id**, while `RemoveContactView` uses the `UserContact.contact_id` — inconsistent identifier semantics that will confuse the frontend.
**Fix:** Decide on a contact/friendship model (request → accept), make identifiers consistent (always operate on user id), and document it.

### BE-06 — JWT blacklist app may not be installed; logout can 500 🟡
**Where:** `LogoutView` calls `token.blacklist()` (`users/views.py:92`) and `SIMPLE_JWT` sets `BLACKLIST_AFTER_ROTATION=True` (`settings.py:168`), but `rest_framework_simplejwt.token_blacklist` is **not in `INSTALLED_APPS`** (`settings.py:26-48`).
**Impact:** `.blacklist()` raises if the blacklist app/migrations aren't present; rotation blacklisting silently no-ops. (Masked today only because API-01 means logout sends the wrong field and never reaches `.blacklist()`.)
**Fix:** Add `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS`, migrate, and fix the field name (API-01).

### BE-07 — Inconsistent success envelope + DRF pagination breaks the envelope 🟡
**Where:** Most views hand-roll `{success, data}`, but paginated `MessageListView` returns DRF's `{count, next, previous, results}` with no `success`. `AvatarUploadView`/`UpdatePublicKeyView` etc. vary.
**Fix:** Implement a custom DRF renderer or pagination class that always wraps in the standard envelope, so the frontend can rely on one shape. Remove per-view envelope boilerplate.

### BE-08 — No object-level permissions on several endpoints 🟡
**Where:** `UserProfileView` (`/users/profile/<id>/`) returns **any** user's full `UserProfileSerializer` including `public_key`, `phone_number`, `date_of_birth`, `disability_type` to any authenticated user. `ConversationDetailView`/message views correctly scope by participant, but profile-by-id does not.
**Fix:** Return a reduced public serializer for other users; restrict PII/health fields to self or accepted contacts.

### BE-09 — `analyze_conversation_mood` reads keys that the analyzer never returns 🟡
**Where:** `mood/views.py:239-242` reads `ai_result.get('recommended_sound_category')` / `'specific_recommendation'`, but `sentiment_analyzer.analyze_conversation_mood` (`sentiment_analyzer.py:185`) returns only `overall_mood/average_score/message_count/emoji`. So `ai_recommendation` is always `{category:None, specific:None,…}`.
**Fix:** Either implement those fields or remove the dead recommendation block.

### BE-10 — Synchronous Google API calls inside the request/WS path 🟡
**Where:** `SendMessageView` and the WS `save_message` call `sentiment_analyzer.analyze()` → blocking HTTPS round-trip to Google NLP **inside** the send path (`chat/views.py:189`, `consumers.py:229`). TTS/STT/Vision are likewise synchronous.
**Impact:** Every message send waits on an external API (added latency, failure coupling). `requests` has **no timeout** set anywhere in `gcp_client.py` → a slow Google response hangs the worker.
**Fix:** Add explicit timeouts to all `requests.post` calls; move sentiment to async (Celery — which is already in requirements — or a background thread), or compute it client-side; degrade gracefully.

### BE-12 — Security app crashes (HTTP 500) on three endpoints due to wrong field names 🟠
**Where:** `apps/security/views.py` references `user.peeping_tom_detection` (`:304,326,372,385`) and `user.encryption_enabled` (`:305,328,371,381`), but the `User` model defines neither — it has **`peeping_tom_enabled`** and **no encryption flag at all** (`users/models.py:68`; confirmed via grep). Affected views: `SecuritySettingsView.get/patch`, `SecuritySummaryView`, and `_calculate_security_score`.
**Impact:** `GET /security/settings/`, `GET /security/summary/`, and the security-score logic raise `AttributeError` → **500** for every user. The entire "Security Settings/Summary" surface is dead on the server even before the frontend URL mismatches (`API-17..19`).
**Fix:** Rename to `peeping_tom_enabled`; add an `encryption_enabled` boolean to the `User` model (and migration) or derive it from `bool(user.public_key)`. Add a serializer/test so this can't regress.

### BE-13 — `ApplyPresetView` writes a non-existent `tts_speed` attribute (silent no-op) 🟡
**Where:** `accessibility/views.py:106-107` does `user.tts_speed = settings['tts_speed']`, and `fixtures/accessibility_presets.json` uses the key `tts_speed`. The model field is **`tts_rate`** (`users/models.py:59`).
**Impact:** Django lets you set the stray attribute, so it doesn't crash, but `user.save()` never persists it — applying a preset silently fails to change TTS speed. The fixture key is also wrong.
**Fix:** Use `tts_rate` consistently in the view and the fixtures.

### BE-14 — Privacy alerts can persist raw camera images server-side 🟡
**Where:** `security/models.py:30-33` — `PrivacyAlert.image_data` stores a **base64 image of the user's surroundings**.
**Impact:** Compounds `SEC-04`: captured frames of the user (and bystanders) could be written to the database with no stated retention/encryption, for an emotion/face-surveillance feature.
**Fix:** Don't store raw frames; if an evidence thumbnail is truly needed, store on-device only or store a hash/metadata, with explicit consent and a retention/purge policy.

### BE-11 — `create_test_users.py`, `reset_password.py`, `setup.py` and `db.sqlite3` committed 🟢
**Where:** repo root of backend.
**Problem:** A populated SQLite DB and ad-hoc scripts (likely with test creds) are in version control.
**Fix:** Remove `db.sqlite3` from git, fold setup scripts into management commands or fixtures, document seed flow.

---

## 6. 🟠 Frontend Architecture & State Findings

### FE-01 — `user.name` does not exist → the user's name is undefined everywhere 🟠
**Where:** Backend `UserProfileSerializer` exposes `first_name`/`last_name`, **never** `name` or `display_name` (`users/serializers.py:74-86`). The frontend reads `user?.name` in `DashboardPage.jsx:74,96`, `Navbar.jsx:34`, and registration maps `display_name: data.name` which the registration serializer drops (`API-21`). `RegisterPage` also collects "Full Name" into `name`, never into `first_name/last_name`.
**Impact:** "Good Morning, **User**" for everyone; greeting/personalization broken; the entire onboarding "name" step is discarded.
**Fix:** Add a `display_name`/computed `name` (`SerializerMethodField`) to the profile serializer, accept it on register/update, and split or store the full name. Make the frontend read one canonical field.

### FE-02 — `OnboardingPage` calls a context function that doesn't exist + is a public route 🟠
**Where:** `OnboardingPage.jsx:7` destructures `updateSettings` from `useAccessibility()`, but the context exposes `updateSetting` (singular) and `settings` — there is **no `updateSettings`**. Onboarding is also registered as a **public** route (`App.jsx:67`), reachable without auth, and `RegisterPage` navigates to it after signup. None of its calibration toggles/font slider are wired to anything (all are `defaultChecked` static inputs).
**Impact:** Latent runtime error if `updateSettings` is ever called; the entire onboarding is decorative and saves nothing.
**Fix:** Wire onboarding controls to `updateSetting`/the accessibility API, fix the function name, and gate the route appropriately.

### FE-03 — Two contexts manage overlapping accessibility/theme state inconsistently 🟠
**Where:** `ThemeContext` owns `theme` (`light/dark/high-contrast`) and writes `data-theme` + `.dark`; `AccessibilityContext` **independently** owns `highContrast`, `reduceMotion`, `colorBlindMode`, `fontSize` and writes `.high-contrast`, `.reduce-motion`, `data-color-blind-mode`. `AccessibilityToolbar` toggles `setHighContrast` on **ThemeContext** (sets `theme='high-contrast'`) while `AccessibilityPage` toggles a **local** `highContrast` state, and `SettingsPage` toggles yet another **local** `peepToggle/blurToggle`. There is no single source of truth.
**Impact:** High-contrast can be "on" in three different places that don't agree; color-blind filters set a `data-` attribute but **no CSS filter implements protanopia/deuteranopia/etc.** (the attribute is never consumed in `accessibility.css`), so the color-blind feature is visually a no-op.
**Fix:** Consolidate all a11y + theme state into **one** provider, persist to backend (`API-06`), and actually implement the color-blind SVG filters and high-contrast theme variables that the attributes promise.

### FE-04 — No error boundaries, no global API error handling, errors swallowed 🟠
**Where:** `App.jsx` has no `ErrorBoundary`; `api.get/post` call `response.json()` unconditionally (`utils/api.js:75`) — a 500/HTML/empty body throws `Unexpected token <`. Many callers `catch` and `console.error` without surfacing anything (`ChatContext`, `AccessibilityContext`, etc.).
**Impact:** A single thrown render error blanks the whole app; network failures are invisible to users (especially bad for screen-reader users who get no feedback).
**Fix:** Add a top-level `ErrorBoundary` with an accessible fallback; make `fetchWithAuth` check `response.ok`/content-type before parsing; centralize error → toast + `aria-live` announcement.

### FE-05 — Token refresh has races and loses the new refresh token logic edge cases 🟡
**Where:** `utils/api.js:40-69`. Concurrent 401s each trigger an independent `refreshAccessToken` (no single-flight lock), so several refreshes race and rotation (`ROTATE_REFRESH_TOKENS=True`) can invalidate each other → user gets logged out under load (e.g. the multiple polling loops firing together).
**Fix:** Single-flight the refresh (a shared in-flight promise); queue requests during refresh; on refresh failure, broadcast a logout event the `AuthContext` listens to (today a failed refresh just returns a 401 body that gets `.json()`-ed).

### FE-06 — Polling architecture is wasteful and stacks intervals 🟡
**Where:** `ChatContext.jsx:96-135`. Conversations poll every 10s, active messages every 3s, regardless of tab visibility or focus. No `document.visibilityState` check; effased intervals can briefly overlap on `activeConversation` change. Each poll re-fetches and re-renders the full list.
**Fix:** Pause polling when the tab is hidden; back off when idle; or replace with WebSockets (`BE-04`). De-dupe with an `AbortController`.

### FE-07 — Optimistic send + 3s poll can duplicate or drop messages 🟡
**Where:** `ChatContext.jsx:138-198` adds a temp message with `id = Date.now()`, then a concurrent `fetchMessages` poll can replace the whole array (`setMessages[...] = formatted`) and **wipe the optimistic/pending message** before the POST resolves, or show a duplicate after. There's no merge/reconciliation by server id.
**Fix:** Reconcile by server id; keep pending messages out of the replace; or pause the poll while a send is in flight.

### FE-08 — `useSpeechToText` recreates the recognition object and double-appends transcripts 🟡
**Where:** `useSpeechToText.js`: the browser recognizer appends final results to `transcript` internally (`:44`), and `ChatPage`/`MoodZone` **also** append `transcript` to the input then `clearTranscript()` (`ChatPage.jsx:69-74`). Re-running the init effect on `options` change tears down the recognizer mid-session. `ChatWindow.jsx` uses a *different* pattern (`setTranscript(value)`) — two inconsistent integrations of the same hook.
**Fix:** Decide one transcript-ownership model; memoize `options`; guard against duplicate appends.

### FE-09 — `ChatWindow`/`ChatList`/`MessageBubble` are an unused, conflicting second chat UI 🟡
**Where:** `components/chat/*` implement a full alternate chat interface (`MessageBubble` hardcodes `isOwn={msg.senderId === 1}` in `ChatWindow.jsx:90`) but the app routes to the standalone `pages/ChatPage.jsx`. Dead, divergent code that uses `senderId === 1` (wrong — id 1 isn't "me").
**Fix:** Delete the unused components or refactor `ChatPage` to compose them; remove the `=== 1` assumption.

### FE-10–FE-14 — "Demo-ware": pages render hardcoded data, ignoring the user & backend 🟠
The following screens look complete but are static mockups disconnected from state/API:

- **FE-10 Dashboard (`DashboardPage.jsx`):** Hardcoded "Sarah Jenkins / Michael Chen / Design Team" conversations, "Anita Roy / David Kim" online friends, fake notification badge "3", fixed "Good Morning" (no time-of-day logic), Quick Action buttons have **no `onClick`** (Start New Chat/View Messages/Mood/Settings do nothing), profile avatar is a hardcoded stranger's photo. None of `ChatContext`'s real `conversations` are used.
- **FE-11 Settings (`SettingsPage.jsx`):** "Jane Doe / ID #8821", "2 other devices", "14 contacts blocked", "Version 2.4.1" — all hardcoded. Toggles (`peepToggle`, `blurToggle`) are local-only and persist nothing. The inline `<style>` toggle hack is fragile and partially broken.
- **FE-12 Profile (`ProfilePage.jsx`):** Entirely hardcoded "Alex M.", bio, badges, QR code image, email `alex.m@example.com`. No `useAuth()` usage at all; no save handlers; `class=` typo at `:188` (invalid in JSX, should be `className`).
- **FE-13 Accessibility (`AccessibilityPage.jsx`):** All controls are **local `useState`** with no persistence, no connection to `AccessibilityContext` or backend. "Save Changes"/"Reset Defaults" buttons have no handlers. Theme buttons here don't talk to `ThemeContext`. "Undo Last Change" just hard-resets two fields.
- **FE-14 Mood Zone (`MoodZonePage.jsx`):** The audio player is **100% fake** — there is no `<audio>` element anywhere; play/pause/skip/volume/timer (`14:23`, `45%`) are static; `currentSound/isPlaying` state is set but never drives playback. The Journal list and "Weekly Mood Flow" chart are hardcoded; the real `moodHistory` fetched from the API is stored in state and **never rendered**. Sound list never populates due to `API-12`.

**Impact:** Gives a false impression of completeness; none of these deliver user value; the real authenticated user is invisible.
**Fix:** Wire each page to its context/API; render fetched data; add the missing handlers; for Mood Zone implement a real `HTMLAudioElement` with `AmbientSound.file_url`.

### FE-15 — Invalid/incorrect Tailwind utilities silently no-op 🟢
**Where:** `App.jsx:34,47` use `bg-background` and `text-text` — **not defined** in `tailwind.config.js` (only `background-light/dark`, `text-main/muted` exist). `MoodZonePage` uses `animate-wave-1…5` (not defined in config keyframes). `RegisterPage.jsx:317` builds dynamic class names like `bg-${option.color}-50` which Tailwind's JIT **cannot see** (purged) → those colors won't render.
**Fix:** Use defined tokens; add the wave keyframes to config (or remove); replace dynamic color interpolation with a static map of full class strings.

### FE-16 — `useEffect` mount effects miss dependencies / use empty arrays with referenced callbacks 🟢
**Where:** `MoodZonePage.jsx:33` calls `fetchSounds/fetchMoodHistory` with `[]` deps (functions defined inline each render — fine but eslint-exhaustive-deps off); `PrivacyMonitor.jsx:131` and `useWebcamDetection` cleanup depend on `stream` closures that can be stale. Generally the project disables/ignores `react-hooks/exhaustive-deps`.
**Fix:** Enable the lint rule and resolve, or wrap fetchers in `useCallback`.

### FE-17 — `OnboardingPage` slide animation key bug + reused images 🟢
**Where:** `OnboardingPage.jsx:179` — `className="animate-fade-in key={currentSlide}"` puts a JSX expression **inside a string literal**, so `key` is literally part of the class name and never re-triggers the animation. Slides 2 & 4 reuse slides 1 & 3's images (comments admit it).
**Fix:** `key={currentSlide} className="animate-fade-in"`; supply real images.

---

## 7. ♿ Accessibility Audit (WCAG 2.1) — critical for *this* product

For an accessibility-first product, the bar is AA minimum, ideally AAA on core flows. Several gaps are ironic given the mission.

- **A11Y-01 (High):** **Color-blind modes do nothing.** `data-color-blind-mode` is set (`AccessibilityContext.jsx:82`) but no SVG/CSS filter consumes it. Implement the standard SVG `feColorMatrix` filters (protanopia/deuteranopia/tritanopia) and apply via the attribute. This is a headline advertised feature (README, Accessibility page).
- **A11Y-02 (High):** **High-contrast theme is incomplete.** `accessibility.css:3-8` defines `--primary/--text/...` variables for `[data-theme='high-contrast']`, but the Tailwind UI uses hardcoded utility colors (`text-slate-500`, `bg-white`) that ignore those variables. High-contrast visually changes almost nothing.
- **A11Y-03 (High):** **Icon-only buttons without accessible names.** Many Material-Symbols buttons rely on the glyph text node and lack `aria-label` (e.g. several in `ChatPage` footer have labels, but `DashboardPage` search has `sr-only` label ✓, while emoji/attachment in places, MoodZone header contrast button has label ✓ — but the message TTS buttons announce "volume_up"/"stop" glyph text to screen readers). Audit every `<span className="material-symbols-outlined">` inside a button: the glyph name leaks to the a11y tree. Add `aria-hidden="true"` to decorative icon spans and an explicit `aria-label` on the button.
- **A11Y-04 (High):** **Decorative icon font read aloud.** Material Symbols ligatures render as words ("home", "chat_bubble", "sentiment_satisfied") that screen readers may announce. Add `aria-hidden="true"` to all decorative icon spans globally.
- **A11Y-05 (Med):** **Focus management in modals.** The New Chat and Camera modals (`ChatPage.jsx:727,821`) don't trap focus, aren't `role="dialog"`/`aria-modal`, don't restore focus on close, and aren't dismissible via `Esc`. Same for `AccessibilityToolbar` dialog (it sets `role="dialog"` but no focus trap).
- **A11Y-06 (Med):** **`onKeyPress` is deprecated** and won't fire for some keys; used for send-on-Enter (`ChatPage.jsx:684`). Use `onKeyDown`.
- **A11Y-07 (Med):** **Forms lack `aria-invalid`/`aria-describedby`.** Login/Register errors are visually shown but not programmatically associated with fields; the error block isn't an `aria-live` region, so screen-reader users aren't told login failed.
- **A11Y-08 (Med):** **Reduced-motion** is honored via media query (`accessibility.css:10`) but the in-app `reduceMotion` toggle adds `.reduce-motion` with **no CSS rule** behind it. Many `animate-*`/`animate-pulse` run regardless.
- **A11Y-09 (Med):** **Contrast.** `text-slate-400`/`text-gray-400` on light backgrounds (used heavily for secondary text, timestamps, placeholders) fails 4.5:1. The primary `#008c9e` on white is ~3.3:1 — **fails AA for normal text** when used as body/link color (it's used for links and small labels widely).
- **A11Y-10 (Low):** **Heading order & landmarks.** Several pages have multiple `<h1>`/skipped levels (e.g. brand `<h1>` + page `<h1>`), and protected pages render their own headers since the global `Navbar` was commented out (`App.jsx:35`), so landmark structure varies per page.
- **A11Y-11 (Low):** **`tabIndex="0"` on non-interactive `<li>`** (`DashboardPage.jsx:259`) without a role/handler creates confusing focus stops.
- **A11Y-12 (Low):** Language/`lang` is fixed `en` (`index.html:2`) even though TTS/STT advertise multi-language; dynamic content language isn't marked.

**Recommendation:** Run axe-core/Lighthouse in CI, add `eslint-plugin-jsx-a11y`, and treat the accessibility features as *functional requirements with tests* (e.g. "enabling protanopia changes rendered colors"), not decorative toggles.

---

## 8. 🎨 UI/UX & Premium Visual Design Improvements

The visual foundation is good. To reach a **premium, cohesive, trustworthy** feel:

### UX-01 — Replace `alert()` and silent failures with a real notification system 🟡
`MoodZonePage` uses `alert('Mood logged successfully!')` (`:128`); most other flows fail silently. Build a single accessible **toast** system (with `role="status"`/`aria-live="polite"`, auto-dismiss, and a stacking region) and route all success/error feedback through it. This alone makes the app feel finished.

### UX-02 — Unify the design system into tokens & components
There are at least **four different header/navbar implementations** (Landing, Dashboard, MoodZone, Settings sidebar, Accessibility sidebar, Profile) and **three toggle-switch implementations** (the broken inline-`<style>` one in Settings, the `peer` one in Profile/Accessibility, the manual one in AccessibilityToolbar). Extract: `<Button>`, `<Toggle>`, `<Card>`, `<Input>`, `<Modal>`, `<PageHeader>`, `<Avatar>`. This removes hundreds of lines of duplicated Tailwind and guarantees consistency.

### UX-03 — Avatars & identity
- Real avatars fall back to **DiceBear** (`ChatContext.jsx:40`) on chat but to **hardcoded Google-hosted stock photos** on Dashboard/Profile/Settings. Standardize on one initial-based/`<Avatar>` component with deterministic color from the user id.
- Remove all `lh3.googleusercontent.com/aida-public/...` placeholder image URLs — these are Stitch/AI-export artifacts and look unprofessional/will rot.

### UX-04 — Premium polish details
- **Motion:** Add subtle, *reduced-motion-aware* entrance transitions (stagger lists, `framer-motion` or CSS) instead of the current ad-hoc `animate-float`. Ensure all motion respects the reduce-motion toggle.
- **Depth & color:** The single teal accent is heavily used; introduce a restrained secondary accent + neutral scale for hierarchy. Use the existing `shadow-soft`/`shadow-glow` tokens consistently (currently inconsistent: mix of `shadow-sm/md/lg/xl/2xl`).
- **Skeleton loaders:** Replace spinners (and the Accessibility page's permanent skeleton "preview") with content-shaped skeletons during fetch.
- **Empty states:** Chat has nice ones; add equally polished empty states for Mood history, Contacts, Search, and Sessions.
- **Consistent corner radius / spacing scale:** radii vary (`rounded-lg/xl/2xl/3xl/full`) without a rule; define 2–3 radii roles.
- **Iconography:** You depend on the Material Symbols web font (FOUT, network dependency, a11y noise). Consider migrating to `lucide-react` (already a dependency) for tree-shaken inline SVGs — better performance, no ligature-read-aloud problem, consistent stroke.

### UX-05 — Information feedback & states
- Buttons that perform async work need loading/disabled states everywhere (Login/Register have them; Dashboard/Settings/Profile/Accessibility actions don't even have handlers).
- "Voice Login" and "Biometric" buttons (`LoginPage.jsx:106-113`) are non-functional — either implement or remove; presenting fake auth methods erodes trust.
- "Download App", "Learn How It Works", testimonial carousel arrows (`LandingPage`) are non-functional. Either wire or remove.

### UX-06 — Copy & content correctness
- Footer says **© 2023** in `LandingPage.jsx:324` (the shared `Footer.jsx` correctly says 2026 — inconsistent).
- Login left panel: "Experience existing inclusivity." (`LoginPage.jsx:66`) reads like a typo for "exceptional/effortless".
- "10k+ Users / Trust De-Novo daily" and 5-star testimonials are fabricated social proof — risky for a real product; gate behind real data or label as illustrative.

### UX-07 — Responsive & layout
- Several pages hardcode `h-screen`/`overflow-hidden` (`LoginPage`, `RegisterPage`, `ChatPage`, `SettingsPage`, `AccessibilityPage`) which breaks on small viewports / when font-size is enlarged (an accessibility regression: enlarging text can clip content with no scroll). Prefer `min-h-screen` + internal scroll regions.
- Mobile nav for the protected app is essentially absent (global `Navbar` is disabled); each page improvises. Provide a consistent responsive app shell with a bottom tab bar on mobile.

---

## 9. ⚡ Performance Findings

- **PERF-01 (High):** **Continuous Vision API calls.** `PrivacyMonitor` POSTs a frame every 2s to Google Vision for the entire session (`SEC-04`) — major latency/cost/battery. Move on-device.
- **PERF-02 (Med):** **Polling storm.** 3s + 10s polls per client, no visibility gating (`FE-06`), each re-rendering full lists with new object identities → unnecessary re-renders.
- **PERF-03 (Med):** **Two simultaneous camera/AI consumers.** `PrivacyMonitor` (auto) and `ChatPage`'s `useWebcamDetection` + its own `getUserMedia` camera modal can all request the camera and run detection loops concurrently, plus `AccessibilityToolbar` and `PrivacyMonitor` both pin a floating widget to `bottom-4 right-4` (they overlap).
- **PERF-04 (Med):** **No code splitting.** All pages import eagerly in `App.jsx`; use `React.lazy`/route-based splitting. The Material Symbols + Manrope fonts block render (`index.html`) with no `font-display` fallback strategy beyond `&display=swap`.
- **PERF-05 (Low):** Backend N+1s (`BE-02`, `BE-03`) dominate as data grows.
- **PERF-06 (Low):** `MessageBubble`/list re-render on every poll; memoize rows and key by stable server id.

---

## 10. 🧹 Code Quality & Maintainability

- **CQ-01:** **No tests** (frontend or backend), **no CI**, **no linting gate**. Add Vitest + React Testing Library, pytest + DRF `APITestCase`, GitHub Actions running lint+test+`manage.py check --deploy`.
- **CQ-02:** **No TypeScript.** For an app this contract-heavy, TS (or at least JSDoc + `checkJs`) on `api.js`, contexts, and component props would have caught most `API-*`/`FE-01` bugs at author time.
- **CQ-03:** **Dead code:** `components/chat/*` (FE-09), `services/encryption.py` (SEC-02), WS layer (BE-04), `gemma_assistant`/`speech_to_text`/`text_to_speech` service wrappers partially unused, Mongo/Celery deps.
- **CQ-04:** **Duplicated logic:** response-shape unwrapping copy-pasted across MoodZone fetchers; multiple navbars/toggles (UX-02); two sentiment analyzers (frontend local + backend) with different label vocabularies (`happy/sad/angry/anxious` vs `positive/negative/neutral/very_*`) that the UI must reconcile in `getSentimentBadge` — unify the taxonomy.
- **CQ-05:** **Magic values & inconsistent identifiers:** face-count alert threshold is `>1` in `peeping_tom_detector`, `>3` in `PrivacyMonitor`, `>=2` in `useWebcamDetection` — three different "privacy risk" definitions.
- **CQ-06:** **`class` instead of `className`** (`ProfilePage.jsx:188`) — silently dropped by React.
- **CQ-07:** **Inconsistent file/route naming** between frontend feature names and backend URL names increases the drift risk (mood `entries` vs `entry`, etc.).
- **CQ-08:** Root has stray planning artifacts (`backendprompt.md`, `frontendprompt.md`, `hackathon-roadmap.md`, `quick-reference`, `De-Novo feature presentation.html`, `.DS_Store`). Move to `/docs`, add `.DS_Store` to `.gitignore`.

---

## 11. 🔐 Privacy & Ethical Considerations (product-level)

Given the user base (deaf, mute, blind, and otherwise disabled users — a protected, vulnerable population), these deserve explicit product decisions:

- **Biometric/emotion data:** Face + emotion likelihoods (joy/sorrow/anger/surprise) are computed and rendered (`PrivacyMonitor`), and sent to Google. This is sensitive biometric processing requiring informed consent, a lawful basis, a retention policy, and a DPA with Google. Today there's none.
- **Health data:** `disability_type` is special-category data; it's exposed in search and other-participant payloads (SEC-07/BE-08) and persisted without stated handling.
- **Honest capability claims:** "Real-time Translation… Sign and we'll voice… Type and we'll sign" (Onboarding), "ASL video quality" testimonial, "E2E encryption", "Peeping Tom CV protection", "Facebook-level security" — most are aspirational. Distinguish shipped vs. roadmap features to avoid misleading vulnerable users who may rely on them for safety.
- **Add:** a Privacy Policy, consent flows, data-export/delete (your users have strong rights here), and an accessibility-statement page (the link exists but routes to the settings-styled page, not a real statement).

---

## 12. Per-Page Quick Reference

| Page | State today | Top fixes |
|---|---|---|
| Landing | Static, polished; some dead buttons; © 2023 | UX-06, wire/remove CTAs, real testimonials |
| Login | Works (if backend up); fake Voice/Biometric | A11Y-07, remove fake auth, single-flight refresh |
| Register | Multi-select disability collected then collapsed to `[0]`; name discarded (FE-01) | Fix name persistence, send all selected types, validation a11y |
| Onboarding | Decorative; `updateSettings` bug; public route | FE-02, wire controls, gate route |
| Dashboard | Hardcoded everything; no handlers | FE-10, wire to ChatContext/user, add onClicks |
| Chat | Most functional page; polling; modals lack focus trap | FE-06/07, A11Y-05, fix duplicate sends |
| Mood Zone | Fake player; real history not rendered; API 404s | API-07..12, real `<audio>`, render history |
| Contacts | One-line stub | Build it (uses contacts API once API-03..05 fixed) |
| Settings | Hardcoded; local-only toggles; broken toggle CSS | FE-11, persist to security/accessibility APIs |
| Profile | 100% hardcoded; `class=` bug; no useAuth | FE-12, wire to profile API + avatar upload |
| Accessibility | Local-only; no persistence; no save handlers | FE-13, connect to AccessibilityContext + API-06 |

---

## 13. What's Genuinely Good (keep/build on)
- Clean response envelope convention on the backend (mostly).
- Thoughtful empty/loading states and sentiment UI in `ChatPage`.
- Real, layered AI fallback design (Cloud NLP → Gemini → rule-based) in `sentiment_analyzer.py`.
- A real, correct E2E crypto module already written (`services/encryption.py`) — just unwired.
- Skip-link, `aria-label`s, focus-visible styling, and reduced-motion media query show genuine a11y intent.
- Solid visual identity and dark-mode coverage.

---

## 14. Suggested New Features / Enhancements (post-stabilization)
- **Real-time captions for calls** (the call/video buttons are stubs) — core to the deaf-user promise.
- **Sign-language support**: at minimum record/playback ASL video messages (you have voice messages already; mirror that pipeline).
- **AI message composer** surfaced in Chat (the backend `assistant`/`compose` exists; the frontend `getComposedMessage` is wired but no UI triggers it).
- **Quick Phrases** UI in chat for speech-impaired users (backend ready once API-13 fixed).
- **Per-conversation accessibility prefs** (e.g. auto-TTS incoming messages — `autoReadMessages` exists in settings but nothing reads incoming messages aloud).
- **Offline-first**: cache conversations; the audience benefits from resilience.
- **Mood → sound** loop completion with a real audio engine and session logging.

---

## 15. Testing & DevOps Recommendations
1. **Backend:** `pytest`/`APITestCase` per endpoint (auth, permissions, shape), factory_boy fixtures, `manage.py check --deploy` in CI, coverage gate.
2. **Frontend:** Vitest + RTL for contexts/hooks (esp. `api.js` contract mocks, token refresh single-flight), Playwright smoke for login→chat→send.
3. **Contract:** `drf-spectacular` → generated TS client; a CI job that diffs the schema and fails on drift.
4. **Quality gates:** ESLint (enable `react-hooks/exhaustive-deps`, add `jsx-a11y`), Prettier, `axe`/Lighthouse CI budget, `gitleaks`/`trufflehog` secret scanning (would have caught SEC-01).
5. **Env hygiene:** backend `.gitignore`, `.env.example` only, secret manager for prod, `python manage.py check --deploy` must pass.
6. **Containerize:** one `docker-compose` (web + db + redis only if WS is kept) so "clone → up" works (today it can't — BE-01).

---

## 16. Prioritized Remediation Roadmap

### Phase 0 — Stop the bleeding (hours)
1. `SEC-01` Rotate & purge committed keys; add `.gitignore`; secret scanning.
2. `SEC-04` Make camera opt-in (default off, respect `peeping_tom_enabled`, consent modal).
3. `SEC-02` Pick the E2E story; fix the false copy immediately if not implementing now.
4. `BE-01` Make the app boot from a fresh clone (single `DATABASE_URL`, default SQLite).

### Phase 1 — Make it actually work (days)
5. `API-01..22` Fix every endpoint/payload/shape mismatch; introduce `endpoints.js` + OpenAPI.
6. `FE-01` Fix user identity (`display_name`) end-to-end.
7. `FE-04` Error boundary + safe response parsing + central error→toast (`UX-01`).
8. `FE-05` Single-flight token refresh.
9. `BE-06` Install JWT blacklist app; fix logout (`API-01`). `BE-12/13` Fix security-app field names (stop the 500s) and the `tts_speed`/`tts_rate` mismatch.
10. `FE-10..14` Wire Dashboard/Mood/Settings/Profile/Accessibility to real data + handlers; build Contacts.

### Phase 2 — Make it trustworthy & accessible (1–2 weeks)
11. `SEC-03/05/06/07`, `BE-08` Production hardening, throttling, PII/health scoping, CSP.
12. `A11Y-01..12` Implement color-blind filters, real high-contrast, focus traps, `aria-live`, contrast fixes, `onKeyDown`. Add axe CI.
13. `BE-02/03/10` Fix N+1s, async/timeout the Google calls.
14. `BE-04` Resolve the WebSocket-vs-polling decision; remove the dead path.

### Phase 3 — Make it premium (ongoing)
15. `UX-02..07` Design-system extraction, motion, skeletons, copy cleanup, responsive shell, icon migration.
16. `CQ-01/02` Add tests, CI, and TypeScript/JSDoc on the contract surface.
17. Section 14 feature work (captions, ASL messages, AI composer, quick phrases, auto-TTS).

---

### Appendix A — Concrete bug list (fast-fix checklist)
- [ ] `LandingPage.jsx:324` © 2023 → 2026.
- [ ] `ProfilePage.jsx:188` `class=` → `className=`.
- [ ] `OnboardingPage.jsx:179` move `key`/`className` out of the string literal.
- [ ] `OnboardingPage.jsx:7` `updateSettings` → `updateSetting` (and wire controls).
- [ ] `ChatPage.jsx:684` `onKeyPress` → `onKeyDown`.
- [ ] `App.jsx:34,47` `bg-background`/`text-text` → defined tokens.
- [ ] `RegisterPage.jsx:317` dynamic `bg-${color}` → static class map.
- [ ] `ChatWindow.jsx:90` `senderId === 1` → compare to real `user.id` (or delete component).
- [ ] `utils/api.js` logout body `refresh` → `refresh_token` (or change backend).
- [ ] Mood/contacts/security endpoint strings → match backend `urls.py`.
- [ ] Remove `lh3.googleusercontent.com/aida-public/*` placeholder images.
- [ ] Remove fake "Voice Login"/"Biometric"/"Download App"/carousel arrows or implement them.
- [ ] Add `aria-hidden="true"` to all decorative `material-symbols-outlined` spans.
- [ ] `security/views.py` `user.peeping_tom_detection`/`user.encryption_enabled` → real fields (BE-12) — fixes 3× HTTP 500.
- [ ] `accessibility/views.py:107` + fixtures `tts_speed` → `tts_rate` (BE-13).
- [ ] Delete `reset_password.py` (real personal credential) and remove from git history (SEC-01).

*End of audit.*
