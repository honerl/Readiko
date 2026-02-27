from __future__ import annotations

from typing import Any, Final, Mapping, NotRequired, Required, TypedDict, cast

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError

from app.core.config import settings


class JWTClaims(TypedDict, total=False):
    """
    Minimal set of claims we care about from Supabase access tokens.

    Supabase tokens always include `sub` (user id) when valid.
    Other fields may or may not be present depending on config.
    """
    sub: Required[str]
    email: NotRequired[str]
    aud: NotRequired[str | list[str]]
    exp: NotRequired[int]
    iat: NotRequired[int]
    role: NotRequired[str]
    iss: NotRequired[str]


bearer: Final[HTTPBearer] = HTTPBearer(auto_error=True)


def _unauthorized(detail: str = "Invalid or expired token") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def get_current_claims(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> JWTClaims:
    token: str = credentials.credentials

    try:
        decoded: Any = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except PyJWTError:
        raise _unauthorized()

    # PyJWT can return Any; ensure it's a mapping/dict-like object.
    if not isinstance(decoded, Mapping):
        raise _unauthorized()

    # Narrow the type to Mapping[str, Any] for proper type checking.
    decoded_map: Mapping[str, Any] = cast(Mapping[str, Any], decoded)

    # Validate required claim `sub` exists and is a string.
    sub_value: Any = decoded_map.get("sub")
    if not isinstance(sub_value, str) or not sub_value:
        raise _unauthorized("Invalid token: missing subject")

    # At this point we know decoded is Mapping and has a valid str sub.
    # Cast to our TypedDict for strict typing downstream.
    claims: JWTClaims = cast(JWTClaims, dict(decoded_map))
    claims["sub"] = sub_value  # ensure normalized as str

    return claims


def get_current_uid(claims: JWTClaims = Depends(get_current_claims)) -> str:
    # `sub` is guaranteed present by get_current_claims (required key)
    return claims["sub"]