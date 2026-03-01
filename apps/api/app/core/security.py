from __future__ import annotations

from typing import Any, Final, Mapping, NotRequired, Required, TypedDict, cast

import jwt
from jwt import PyJWKClient
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
        # choose verification mechanism
        if settings.supabase_jwks_url:
            # fetch signing key from JWKS (supports ES256 etc)
            jwk_client = PyJWKClient(settings.supabase_jwks_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token).key
            decoded: Any = jwt.decode(
                token,
                signing_key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
            )
        else:
            raise _unauthorized()
    except jwt.ExpiredSignatureError:
        print(f"[AUTH] Token expired")
        raise _unauthorized("Token has expired")
    except jwt.InvalidAudienceError:
        print(f"[AUTH] Invalid audience in token")
        raise _unauthorized("Invalid token audience")
    except jwt.DecodeError as e:
        print(f"[AUTH] Token decode error: {e}")
        raise _unauthorized("Invalid token format")
    except PyJWTError as e:
        print(f"[AUTH] JWT error: {e}")
        raise _unauthorized()

    # PyJWT can return Any; ensure it's a mapping/dict-like object.
    if not isinstance(decoded, Mapping):
        print(f"[AUTH] Decoded token is not a mapping: {type(decoded)}")
        raise _unauthorized()

    # Narrow the type to Mapping[str, Any] for proper type checking.
    decoded_map: Mapping[str, Any] = cast(Mapping[str, Any], decoded)

    # Validate required claim `sub` exists and is a string.
    sub_value: Any = decoded_map.get("sub")
    if not isinstance(sub_value, str) or not sub_value:
        print(f"[AUTH] Missing or invalid 'sub' claim")
        raise _unauthorized("Invalid token: missing subject")

    print(f"[AUTH] Token validated for user: {sub_value}")

    # At this point we know decoded is Mapping and has a valid str sub.
    # Cast to our TypedDict for strict typing downstream.
    claims: JWTClaims = cast(JWTClaims, dict(decoded_map))
    claims["sub"] = sub_value  # ensure normalized as str

    return claims


def get_current_uid(claims: JWTClaims = Depends(get_current_claims)) -> str:
    # `sub` is guaranteed present by get_current_claims (required key)
    return claims["sub"]