from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims
from app.models.user import UserCreate

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register_user(user: UserCreate) -> dict[str, Any]:
    """
    Create a user profile in the public.users table.
    
    This should be called after the user has successfully signed up with Supabase Auth.
    The frontend should extract the uid from the Supabase auth response and pass it here.
    """
    try:
        result = supabase.table("users").insert({
            "uid": user.uid,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "role": user.role,
        }).execute()
        
        if result.data:
            return {
                "success": True,
                "user": result.data[0] if result.data else None,
            }
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create user")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me")
def get_me(claims: JWTClaims = Depends(get_current_claims)) -> dict[str, Any]:
    uid = claims["sub"]

    res = cast(Any, supabase.table("users").select("*").eq("uid", uid).maybe_single().execute())

    return {
        "uid": uid,
        "email": claims.get("email"),
        "profile": res.data,
    }