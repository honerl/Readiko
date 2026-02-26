from fastapi import APIRouter, HTTPException, status
from app.core.supabase import supabase
from app.models.auth import RegisterRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "confirm_password": data.confirm_password
        })

        if response.user is None:
            raise HTTPException(
                status_code=400,
                detail="Registration failed"
            )
        
        return {
            "message": "User registered successfully",
            "user_id": response.user.id,
            "email": response.user.email
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/login")
def login(data: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if response.session is None:
            raise HTTPException(
                status_code=staticmethod.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": response.user.id
        }
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    

@router.post("/logout")
def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    