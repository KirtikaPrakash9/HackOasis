create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role text not null default 'hacker' check (role in ('hacker','organiser','admin')),
  skills text[] not null default '{}',
  github_url text,
  linkedin_url text,
  university text,
  graduation_year integer,
  hack_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text,
  banner_url text,
  location text,
  start_date timestamptz,
  end_date timestamptz,
  submission_deadline timestamptz,
  max_team_size integer not null default 4,
  prizes jsonb,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','open','ongoing','judging','closed')),
  ai_judging_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  description text,
  looking_for_skills text[] not null default '{}',
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  github_url text,
  demo_url text,
  demo_video_url text,
  pitch_deck_url text,
  tech_stack text[] not null default '{}',
  submitted_at timestamptz,
  status text not null default 'draft' check (status in ('draft','submitted','reviewed','finalist','winner'))
);

create table if not exists project_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists ai_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  code_quality_score integer check (code_quality_score between 1 and 10),
  code_improvements jsonb,
  security_flags jsonb,
  complexity_rating text,
  business_viability_score integer check (business_viability_score between 1 and 10),
  uae_licenses_needed text[] not null default '{}',
  estimated_startup_cost_aed integer,
  market_opportunity text,
  investor_pitch_summary text,
  reviewed_at timestamptz not null default now()
);

create table if not exists judges (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid not null references judges(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  score integer not null,
  feedback text,
  created_at timestamptz not null default now(),
  unique(judge_id, project_id)
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table events enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table event_registrations enable row level security;
alter table projects enable row level security;
alter table project_submissions enable row level security;
alter table ai_reviews enable row level security;
alter table judges enable row level security;
alter table scores enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;

create policy "public_profiles_read" on profiles for select using (true);
create policy "own_profile_all" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "public_events_read" on events for select
using (status <> 'draft' or organiser_id = auth.uid());
create policy "organiser_events_all" on events for all
using (organiser_id = auth.uid()) with check (organiser_id = auth.uid());

create policy "event_teams_read" on teams for select using (true);
create policy "team_member_read" on team_members for select using (true);

create policy "own_event_registration" on event_registrations for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "public_projects_read" on projects for select using (true);

create policy "project_submission_by_team_member" on project_submissions for insert
with check (
  exists (
    select 1 from projects p
    join team_members tm on tm.team_id = p.team_id
    where p.id = project_id and tm.user_id = auth.uid()
  )
);

create policy "team_or_organiser_reads_ai_review" on ai_reviews for select
using (
  exists (
    select 1
    from projects p
    left join team_members tm on tm.team_id = p.team_id
    left join events e on e.id = p.event_id
    where p.id = ai_reviews.project_id
      and (tm.user_id = auth.uid() or e.organiser_id = auth.uid())
  )
);

create policy "judge_visibility" on judges for select
using (user_id = auth.uid());

create policy "judge_score_write" on scores for all
using (
  exists (select 1 from judges j where j.id = judge_id and j.user_id = auth.uid())
)
with check (
  exists (select 1 from judges j where j.id = judge_id and j.user_id = auth.uid())
);

create policy "follow_self_manage" on follows for all
using (follower_id = auth.uid()) with check (follower_id = auth.uid());

create policy "own_notifications" on notifications for all
using (user_id = auth.uid()) with check (user_id = auth.uid());
