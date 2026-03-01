# Supabase Client Integration

Updated the React frontend to use Supabase authentication seamlessly with your backend API.

## What Changed

### 1. **Supabase Client** (`src/services/supabaseClient.js`)
- Created a centralized Supabase client initialized with environment variables
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`

### 2. **API Service** (`src/services/api.js`)
- Added `apiFetch()` helper that automatically attaches the Supabase access token to all backend requests
- This allows your FastAPI backend to verify tokens and extract the user ID from JWT claims
- Reads `VITE_API_URL` for flexible configuration

### 3. **Auth Components**
- **Register.jsx**: Now uses `supabase.auth.signUp()` directly instead of a custom API endpoint
- **Login.jsx**: Now uses `supabase.auth.signInWithPassword()` — Supabase manages the session automatically
- Removed hardcoded backend `/register` and `/login` endpoints

### 4. **App.jsx**
- Syncs Supabase session state on app load via `getSession()`
- Listens for auth state changes with `onAuthStateChange()` listener
- User state automatically updates when login/logout occurs

### 5. **StudentHomepage.jsx**
- Updated API calls to use `apiFetch()` helper
- Access token is now transparently included in all requests

### 6. **Dependencies**
- Added `@supabase/supabase-js` to `package.json`

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd apps/web
   npm install
   ```

2. **Create `.env.local` file** in `apps/web/`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   Get these values from your Supabase dashboard → Settings → API.

3. **Run dev server:**
   ```bash
   npm run dev
   ```

## How It Works

### Flow:
1. User registers/logs in via the web UI
2. Supabase issues a JWT access token and stores it in localStorage
3. All subsequent requests to your FastAPI backend automatically include this token via the `Authorization: Bearer <token>` header
4. Your backend's `get_current_claims()` and `get_current_uid()` dependencies validate and extract the user ID from the token
5. Protected endpoints use these dependencies to enforce authentication

### Token Refresh:
Supabase automatically refreshes the access token when it expires — the session handling is completely transparent to your app.

## Backend Integration Points

Your FastAPI backend already has the security infrastructure in place:
- `app/core/security.py`: Validates JWT tokens with the Supabase secret
- `app/core/config.py`: Reads `SUPABASE_JWT_SECRET` from env
- Protected routes can use `Depends(get_current_uid)` or `Depends(get_current_claims)`

Example protected endpoint:
```python
@router.get("/protected")
def protected_endpoint(uid: str = Depends(get_current_uid)):
    return {"user_id": uid}
```

## Next Steps

1. Update any other API endpoints to use `apiFetch()` if they need authentication
2. Add logout functionality using `supabase.auth.signOut()`
3. Implement password reset (Supabase provides `resetPasswordForEmail()`)
4. Make sure your backend's `/auth/me` endpoint is integrated with your database
