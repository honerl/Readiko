from __future__ import annotations

from typing import Any

from supabase import Client, create_client
from app.core.config import settings


def get_supabase_client() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


supabase: Client = get_supabase_client()


def upsert_explore_session_summary(summary_payload: dict[str, Any]) -> None:
    if not settings.supabase_url:
        return

    try:
        (
            supabase.table("explore_session_summaries")
            .upsert(summary_payload, on_conflict="session_id")
            .execute()
        )
    except Exception as exc:
        print(f"[Supabase] Failed to upsert explore_session_summaries: {exc}")
