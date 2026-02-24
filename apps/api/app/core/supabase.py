from supabase import Client, create_client
from app.core.config import settings


def get_supabase_client() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


supabase: Client = get_supabase_client()
