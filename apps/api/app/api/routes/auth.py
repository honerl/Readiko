from typing import Any, cast

from fastapi import APIRouter, Depends
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
def get_me(claims: JWTClaims = Depends(get_current_claims)) -> dict[str, Any]:
    uid = claims["sub"]

    res = cast(Any, supabase.table("users").select("*").eq("uid", uid).maybe_single().execute())

    return {
        "uid": uid,
        "email": claims.get("email"),
        "profile": res.data,
    }