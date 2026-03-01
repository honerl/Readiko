from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "dev"
    app_name: str = "readiko-api"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str | None = None
    supabase_jwt_public_key: str = ""
    # URL to fetch JWKS (JSON Web Key Set) for verifying tokens. If not
    # provided, the default Supabase jwks endpoint is used based on
    # `supabase_url`.
    supabase_jwks_url: str | None = None

    # OPEN API KEY
    gemini_api_key: str = ""
    RATE_LIMIT_PER_MINUTE: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
    )

    def cors_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


settings = Settings()
# when jwks_url is not set, compute default
if not settings.supabase_jwks_url and settings.supabase_url:
    settings.supabase_jwks_url = settings.supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"
