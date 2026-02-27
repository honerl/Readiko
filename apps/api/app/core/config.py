from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "dev"
    app_name: str = "readiko-api"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str | None = None
    supabase_jwt_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
    )

    def cors_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


settings = Settings()
