# Readiko API Documentation

This document explains how to set up, run, and contribute to the FastAPI backend.

---

# 1. Overview

The API is built using:

- FastAPI (Python)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- CORS middleware (for frontend communication)

The backend lives in:

apps/api/

---

# 2. Folder Structure

```
apps/api/
  app/
    main.py              → FastAPI entry point
    core/
      config.py          → Environment + settings
    api/
      router.py          → Central router
      routes/
        health.py        → Example route
  requirements.txt
  .env.example
```

---

# 3. Setup Instructions

1. Navigate to API folder

```bash
cd apps/api
```
2. Create virtual environment

Windows

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Mac/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Create environment file
```bash
cp .env.example .env
```

5. Run the server
```bash
uvicorn app.main:app --reload
```

# 4. API Endpoints
- Health Check
**GET /health**
- Swagger docs
**http://localhost:8000/docs**


# 5. How Routing Works

All route files live inside `app/api/routes/`

Each route file defines an `APIRouter`.

These routers are registered inside `app/api/router.py`

That central router is then included in `app/main.py`

Flow:

1. Define route in `routes/<file>.py`
2. Register it in `api/router.py`
3. It becomes available in the API

---

# 6. How to Add a New Route

Follow these steps whenever adding a new endpoint.

1.  Create a new route file

Create a file inside `app/api/routes/`

Example: `app/api/routes/feedback.py`

```python
from fastapi import APIRouter

router = APIRouter()

@router.post("/feedback")
def generate_feedback():
    return {"message": "Feedback endpoint"}
```

2. Register the route

Open `app/api/router.py`

Add:

```python
from app.api.routes import feedback

api_router.include_router(
    feedback.router,
    tags=["feedback"]
)
```

3. Restart the server

```bash
uvicorn app.main:app --reload
```

Open:

http://localhost:8000/docs

Your new endpoint should appear.

---

# 7. Environment Variables

Environment variables are stored in `apps/api/.env`

Template file `apps/api/.env.example`

Variables are loaded using: `app/core/config.py`

If you add a new environment variable:

1. Add it to `.env.example`
2. Add it to `config.py`
3. Restart the server

Never commit `.env` to version control.

---

# 8. CORS Configuration

CORS allows the frontend (React) to communicate with the backend.

Allowed origins are defined in `.env`

If you see a browser error such as:

"Blocked by CORS policy"

Check:

- The frontend URL (usually localhost:5173 or localhost:3000)
- Make sure it exists in `.env`
- Restart the server

---

# 9. How to Test the API

## Swagger UI (Recommended)

Open:

http://localhost:8000/docs

You can:

- View endpoints
- Send test requests
- Inspect request/response schemas

## Browser (for GET routes)

http://localhost:8000/health

## curl

```bash
curl http://localhost:8000/health
```

---

# 10. Code Guidelines

To maintain clean architecture:

- Keep route files small
- Do not place business logic directly inside routes
- Keep configuration inside `core/config.py`
- Return consistent JSON responses

Routes should:

1. Validate input
2. Call service logic
3. Return response

---

# 11. Contribution Workflow

1. Create a new branch:

```bash
git checkout -b feature/<feature-name>
```

2. Make changes

3. Test locally:
   - Server runs
   - `/docs` loads
   - Endpoint appears correctly

4. Commit:

```bash
git add .
git commit -m "Add <feature-name> route"
```

5. Push branch and create Pull Request.

---

# 12. Common Errors

## ModuleNotFoundError: app...

You are likely running uvicorn from the wrong directory.

Always run from `apps/api`

## CORS Errors

Verify:

- Frontend URL
- `cors_origins` in `.env`
- Restart server

## Port Already in Use

Change port:

```bash
uvicorn app.main:app --reload --port 8001
```

---

# 13. Planned Improvements

- Supabase integration
- LLM service layer
- Authentication
- Structured request/response models
- Centralized error handling
- Logging middleware

---

End of API documentation.