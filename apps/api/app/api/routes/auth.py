from fastapi import APIRouter, HTTPException, status
from app.core.supabase import supabase
from app.models.auth import RegisterRequest, LoginRequest, RegisterResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=RegisterResponse)
def register(data: RegisterRequest) -> RegisterResponse :

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    email = str(data.email)

    try:
       res = supabase.auth.sign_up({"email": email, "password": data.password})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    user = getattr(res, "user", None)

    if not user:
        raise HTTPException(status_code=400, detail="Sign up failed")

    return RegisterResponse(
        message="Registered",
        user_id=user.id,
        email=user.email
    )

@router.post("/login")
def login(data: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if response.session is None or response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        user = response.user
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": user.id
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
    