# Quick Reference — Supabase Integration

## Environment Setup

```bash
# Install web dependencies
cd apps/web && npm install

# Create .env.local with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend .env needs (already configured):
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/services/supabaseClient.js` | Initialize Supabase client |
| `apps/web/src/services/api.js` | HTTP helper that auto-injects auth token |
| `apps/web/src/App.jsx` | Manages auth state & syncs with Supabase |
| `apps/api/app/core/security.py` | Validates JWT tokens from Supabase |
| `apps/api/app/api/routes/auth.py` | Backend auth endpoints (e.g., `/auth/me`) |

## Common Code Snippets

### Sign User Up
```javascript
import { supabase } from './services/supabaseClient';

const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password"
});
```

### Sign User In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password"
});
```

### Sign User Out
```javascript
await supabase.auth.signOut();
```

### Make Protected API Call
```javascript
import { apiFetch } from './services/api';

const res = await apiFetch('/protected-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' })
});
```

### Get Current User
```javascript
const { data } = await supabase.auth.getSession();
const user = data?.session?.user;
```

### Protected Endpoint (Backend)
```python
from fastapi import Depends
from app.core.security import get_current_uid

@router.get("/data")
async def get_data(uid: str = Depends(get_current_uid)):
    return {"user": uid}
```

## Expected Flow

1. User registers via UI → `supabase.auth.signUp()`
2. Supabase creates account, issues JWT
3. User logs in → `supabase.auth.signInWithPassword()`
4. Token stored in localStorage
5. Frontend calls API → `apiFetch()` attaches `Authorization: Bearer <token>`
6. Backend validates token → extracts user ID → executes endpoint
7. User logs out → `supabase.auth.signOut()` clears session

## Debugging

**401 Unauthorized errors?**
- Check `SUPABASE_JWT_SECRET` matches in backend `.env`
- Verify token in browser DevTools → Application → localStorage → `sb-*.json`
- Ensure using `apiFetch()` not raw `fetch()`

**"Can't connect to Supabase"?**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Verify origin isn't blocked (CORS)

**Token not refreshing?**
- Supabase auto-refreshes transparently
- If issues persist, clear localStorage and re-login

## Files to Update with Protected Endpoints

Once your database schema is set up, update these to use `apiFetch()`:
- `StudentHomepage.jsx` — Already updated for classes
- Any other components making API calls

---

For detailed docs, see `SETUP_GUIDE.md` in the project root.
