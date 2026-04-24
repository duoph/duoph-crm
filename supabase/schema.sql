-- DCRM schema: run in Supabase SQL editor
create extension if not exists "pgcrypto";

-- Work types are dynamic; see table work_types below.

create table public.users_profile (
  id uuid primary key references auth.users (id) on delete cascade,
  admin_name text not null,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  contact_number text not null default '',
  country text not null default '',
  work_type text not null default 'other',
  admin_name text,
  created_at timestamptz not null default now()
);

create table public.cashflow (
  id uuid primary key default gen_random_uuid(),
  date date not null default (current_date),
  income numeric(14, 2) not null default 0,
  expense numeric(14, 2) not null default 0,
  details text,
  client_id uuid references public.clients (id) on delete set null,
  work_type text not null default 'other',
  created_at timestamptz not null default now()
);

create table public.work_types (
  key text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

insert into public.work_types (key, label)
values
  ('website', 'Website'),
  ('social_media', 'Social Media'),
  ('branding', 'Branding'),
  ('other', 'Other')
on conflict (key) do update set label = excluded.label;

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  work text not null,
  client_id uuid not null references public.clients (id) on delete restrict,
  work_type text not null default 'other' references public.work_types (key) on update cascade,
  status text not null default 'pending' check (status in ('ongoing', 'completed', 'on_hold', 'pending')),
  committed_date date,
  completed_date date,
  remarks text not null default '',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_completed_date_required check (
    (status <> 'completed') or (completed_date is not null)
  ),
  constraint work_items_completed_after_committed check (
    completed_date is null or committed_date is null or completed_date >= committed_date
  )
);

create index work_items_deleted_at_idx on public.work_items (deleted_at);
create index work_items_client_id_idx on public.work_items (client_id);
create index work_items_work_type_idx on public.work_items (work_type);
create index work_items_status_idx on public.work_items (status);
create index work_items_committed_date_idx on public.work_items (committed_date);
create index work_items_completed_date_idx on public.work_items (completed_date);

create table public.signup_pending (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  admin_name text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index signup_pending_email_key on public.signup_pending (lower(email));

create table public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index password_reset_tokens_user_id_idx on public.password_reset_tokens (user_id);

alter table public.users_profile enable row level security;
alter table public.clients enable row level security;
alter table public.cashflow enable row level security;
alter table public.work_types enable row level security;
alter table public.work_items enable row level security;
alter table public.signup_pending enable row level security;
alter table public.password_reset_tokens enable row level security;

create policy "profile_select_own" on public.users_profile
  for select using (auth.uid() = id);

create policy "profile_update_own" on public.users_profile
  for update using (auth.uid() = id);

create policy "profile_insert_own" on public.users_profile
  for insert with check (auth.uid() = id);

create policy "profile_select_all_authenticated" on public.users_profile
  for select using (auth.role() = 'authenticated'::text);

create policy "clients_authenticated_all" on public.clients
  for all using (auth.role() = 'authenticated'::text)
  with check (auth.role() = 'authenticated'::text);

create policy "cashflow_authenticated_all" on public.cashflow
  for all using (auth.role() = 'authenticated'::text)
  with check (auth.role() = 'authenticated'::text);

create policy "work_types_authenticated_select" on public.work_types
  for select using (auth.role() = 'authenticated'::text);

create policy "work_items_authenticated_all" on public.work_items
  for all using (auth.role() = 'authenticated'::text)
  with check (auth.role() = 'authenticated'::text);

-- No policies on signup_pending / password_reset_tokens: only service role (bypasses RLS)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (id, admin_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'admin_name', '')
  )
  on conflict (id) do update set admin_name = excluded.admin_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
