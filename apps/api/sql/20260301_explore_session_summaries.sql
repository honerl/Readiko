-- Migration-safe contract for Explore session summaries
-- Safe to run multiple times.

create table if not exists public.explore_session_summaries (
    id bigserial primary key,
    session_id uuid not null unique,
    uid text not null,
    flow_type text not null default 'explore',
    topic text null,
    passage_title text not null,
    average_score numeric(5,2) not null,
    mastery_threshold numeric(5,2) not null,
    skill_level text not null,
    turns_used integer not null,
    max_turns integer not null,
    started_at timestamptz not null,
    completed_at timestamptz not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint explore_session_summaries_flow_type_check check (flow_type in ('explore')),
    constraint explore_session_summaries_score_check check (average_score >= 0 and average_score <= 100),
    constraint explore_session_summaries_turns_check check (turns_used >= 0 and max_turns > 0 and turns_used <= max_turns)
);

alter table public.explore_session_summaries
    add column if not exists topic text null;

alter table public.explore_session_summaries
    add column if not exists started_at timestamptz;

alter table public.explore_session_summaries
    add column if not exists completed_at timestamptz;

create index if not exists idx_explore_session_summaries_uid
    on public.explore_session_summaries (uid);

create index if not exists idx_explore_session_summaries_completed_at
    on public.explore_session_summaries (completed_at desc);

alter table public.explore_session_summaries enable row level security;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'explore_session_summaries'
          and policyname = 'explore_summary_select_own'
    ) then
        create policy explore_summary_select_own
            on public.explore_session_summaries
            for select
            using (uid = auth.uid()::text);
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'explore_session_summaries'
          and policyname = 'explore_summary_insert_own'
    ) then
        create policy explore_summary_insert_own
            on public.explore_session_summaries
            for insert
            with check (uid = auth.uid()::text);
    end if;
end $$;

comment on table public.explore_session_summaries is
'Explore flow session-level summary records (no full transcript).';
