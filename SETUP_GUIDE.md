# Supabase Client Integration — Complete Setup Guide

## Overview

Your Readiko app now uses **Supabase Auth** for user registration and login, with seamless integration to your FastAPI backend. Here's how everything works together:

### Architecture Flow

```
User (Browser)
    ↓
[Supabase Auth] ← React components (Register, Login) use supabase.auth.signUp() / signInWithPassword()
    ↓
[JWT Token] ← Stored in localStorage, automatically passed to backend
    ↓
[FastAPI Backend] ← apiFetch() helper injects Bearer token into every request
    ↓
[Security Layer] ← get_current_claims() & get_current_uid() validate JWT
    ↓
[Protected Endpoints] ← Match user ID from token to database records
```

---

## Files Modified

### Frontend (React)

| File | Change |
|------|--------|
| `apps/web/src/services/supabaseClient.js` | **NEW** — Supabase client initialization |
| `apps/web/src/services/api.js` | Enhanced with `apiFetch()` helper that auto-attaches auth token |
| `apps/web/src/App.jsx` | Syncs Supabase session state on app load and listens for auth changes |
| `apps/web/src/Login.jsx` | Uses `supabase.auth.signInWithPassword()` instead of custom backend |
| `apps/web/src/Register.jsx` | Uses `supabase.auth.signUp()` instead of custom backend |
| `apps/web/src/StudentHomepage.jsx` | Updated to use `apiFetch()` for protected endpoints |
| `apps/web/package.json` | Added `@supabase/supabase-js` dependency |
| `apps/web/.env.example` | **NEW** — Environment variable template |

### Backend (FastAPI)

| File | Change |
|------|--------|
| `apps/api/app/api/router.py` | Added auth route registration |

---

## Installation & Setup

### 1. Install Web Dependencies

```bash
cd apps/web
npm install
```

This installs the `@supabase/supabase-js` client library.

### 2. Configure Environment Variables

Create a `.env.local` file in `apps/web/`:

```bash
cd apps/web
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```ini
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

**Where to find these:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Settings → API
- Copy the "Project URL" and "Anon public key"

### 3. Verify Backend Configuration

Your FastAPI backend needs these environment variables (in `apps/api/.env`):

```ini
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Where to find JWT_SECRET:**
- Supabase Dashboard → Settings → API
- Scroll to "JWT Settings"
- Copy "JWT secret"

### 4. Run Both Servers

**Terminal 1 — Backend:**
```bash
cd apps/api
# Make sure your Python environment is set up with requirements.txt
python -m uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd apps/web
npm run dev
```

Open http://localhost:5173 in your browser.

---

## How It Works

### Authentication Flow

#### Registration
1. User fills in email/password on Register page
2. Frontend calls `supabase.auth.signUp(email, password)`
3. Supabase creates user account and returns session + JWT token
4. Token stored in localStorage automatically by Supabase SDK
5. User redirected to login page (or auto-logged-in if configured)

#### Login
1. User fills in email/password on Login page
2. Frontend calls `supabase.auth.signInWithPassword(email, password)`
3. Supabase validates and returns session + JWT token
4. Token stored in localStorage
5. User redirected to `/home`
6. `App.jsx` detects session change and updates `user` state

#### API Calls with Authentication
1. Any component calls `apiFetch('/some-endpoint', options)`
2. `apiFetch()` retrieves the access token from localStorage via `supabase.auth.getSession()`
3. Token injected into `Authorization: Bearer <token>` header
4. Request sent to FastAPI backend
5. Backend's `get_current_claims()` dependency validates the JWT signature using `SUPABASE_JWT_SECRET`
6. If valid, extracts user ID from token's `sub` claim
7. Endpoint executes with authenticated user context

### Session Persistence

- Supabase SDK automatically stores the session in `localStorage`
- On app reload, `App.jsx`'s `useEffect` calls `supabase.auth.getSession()`
- User stays logged in across page refreshes
- Supabase automatically refreshes expired tokens behind the scenes

### Protected Endpoints

In your FastAPI backend, any endpoint can require authentication:

```python
from fastapi import Depends
from app.core.security import get_current_uid, get_current_claims, JWTClaims

# Simple: just get the user ID
@router.get("/profile")
async def get_profile(uid: str = Depends(get_current_uid)):
    return {"user_id": uid}

# Advanced: get all claims (email, etc.)
@router.get("/me")
async def get_me(claims: JWTClaims = Depends(get_current_claims)):
    return {
        "uid": claims["sub"],
        "email": claims.get("email"),
    }
```

Missing or invalid tokens automatically return `401 Unauthorized`.

---

## API Reference

### `supabaseClient.js`

```javascript
import { supabase } from './services/supabaseClient';

// Sign up a new user
await supabase.auth.signUp({
  email: "user@example.com",
  password: "secure-password"
});

// Sign in
await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secure-password"
});

// Sign out
await supabase.auth.signOut();

// Get current session
const { data } = await supabase.auth.getSession();
const token = data?.session?.access_token;

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event); // 'SIGNED_IN', 'SIGNED_OUT', etc.
});
```

### `api.js` — apiFetch Helper

```javascript
import { apiFetch } from './services/api';

// GET request (auto-includes auth token)
const response = await apiFetch('/classes?student_id=123');
const data = await response.json();

// POST request
const response = await apiFetch('/join-class', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ class_code: 'ABC123' })
});

// Handles errors just like fetch()
if (!response.ok) {
  console.error('Request failed:', response.status);
}
```

---

## Common Tasks

### Add Logout

In your component (e.g., navbar or profile):

```javascript
import { supabase } from './services/supabaseClient';

async function handleLogout() {
  await supabase.auth.signOut();
  // App.jsx will detect the logout and clear user state
  // User redirected to /login by router
}
```

### Check If User Is Logged In

```javascript
import { supabase } from './services/supabaseClient';

useEffect(() => {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    console.log('User is logged in:', data.session.user.email);
  } else {
    console.log('Not logged in');
  }
}, []);
```

### Get User Email in Component

```javascript
// From props passed by App.jsx
const { user } = props; // user.email, user.id, etc.

// Or query directly via supabase
const { data } = await supabase.auth.getSession();
const email = data?.session?.user?.email;
```

### Make Protected API Call

Just use `apiFetch()` — the token is attached automatically:

```javascript
const response = await apiFetch(
  '/protected-endpoint',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'value' })
  }
);
```

If the endpoint returns 401, the user's token is invalid or expired — redirect them to login.

### Password Reset

```javascript
// Generate reset link and email it
const { error } = await supabase.auth.resetPasswordForEmail(
  "user@example.com",
  { redirectTo: "http://localhost:5173/reset-password" }
);

// User clicks link, then update their password
const { error } = await supabase.auth.updateUser({
  password: "new-password"
});
```

---

## Troubleshooting

### "Missing Supabase environment variables"

**Problem:** App won't start, error in console.

**Solution:** Make sure `.env.local` exists in `apps/web/` with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Vite's env variables must start with `VITE_` to be exposed to the browser.

### "Invalid or expired token" (401 errors)

**Problem:** Backend returns 401 on API calls.

**Possible causes:**
1. `SUPABASE_JWT_SECRET` in backend `.env` doesn't match Supabase project
2. Token is genuinely expired — Supabase should auto-refresh; check browser's localStorage
3. Token not being sent — check browser DevTools → Network, look for `Authorization` header

**Solution:**
1. Verify `SUPABASE_JWT_SECRET` in backend `.env`
2. Check browser console for Supabase SDK errors
3. Verify `apiFetch()` is being used, not raw `fetch()`

### CORS Errors

**Problem:** Browser blocks requests to backend.

**Solution:** Backend's CORS configuration in `app/main.py` must allow your frontend origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Check the `cors_list()` method in `app/core/config.py`.

### "User not found in localStorage"

**Problem:** `supabase.auth.getSession()` returns `null`.

**Causes:**
1. User hasn't logged in yet
2. Browser's localStorage is cleared
3. Different origin (http vs https) — Supabase won't share sessions across origins

**Solution:** This is normal when not logged in. Redirect to login if `session` is null.

---

## Security Notes

✅ **What you get automatically:**
- Passwords never sent to your backend — Supabase handles auth
- JWTs are cryptographically signed; backend can trust claims
- Tokens expire and refresh automatically (1 hour by default)
- Sensitive tokens stored in httpOnly cookies (when configured)

⚠️ **What you should do:**
- Always use `HTTPS` in production (not `http://`)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- Use `apiFetch()` for all protected endpoints, not raw `fetch()`
- Validate user ID from token on backend before returning sensitive data

---

## Next Steps

1. **Test the flow:** Register → redirects to login → login → redirects to /home
2. **Update protected endpoints:** Use `Depends(get_current_uid)` or `Depends(get_current_claims)` in your routes
3. **Add user profile:** Store additional user info in your `users` table, query it with user UID
4. **Implement logout:** Add a logout button in sidebar/navbar
5. **Add password reset:** Implement UI for `resetPasswordForEmail()` flow

Happy building! 🚀
