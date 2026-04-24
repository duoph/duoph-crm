-- Work Management: work items

create table if not exists public.work_items (
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

create index if not exists work_items_deleted_at_idx on public.work_items (deleted_at);
create index if not exists work_items_client_id_idx on public.work_items (client_id);
create index if not exists work_items_work_type_idx on public.work_items (work_type);
create index if not exists work_items_status_idx on public.work_items (status);
create index if not exists work_items_committed_date_idx on public.work_items (committed_date);
create index if not exists work_items_completed_date_idx on public.work_items (completed_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists work_items_set_updated_at on public.work_items;
create trigger work_items_set_updated_at
  before update on public.work_items
  for each row execute function public.set_updated_at();

alter table public.work_items enable row level security;

create policy "work_items_authenticated_all" on public.work_items
  for all using (auth.role() = 'authenticated'::text)
  with check (auth.role() = 'authenticated'::text);

