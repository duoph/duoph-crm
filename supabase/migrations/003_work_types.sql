-- Dynamic work types (admin-managed)

create table if not exists public.work_types (
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

-- Convert enum columns to text (keep existing values)
alter table public.clients
  alter column work_type type text using work_type::text;
alter table public.clients
  alter column work_type set default 'other';

alter table public.cashflow
  alter column work_type type text using work_type::text;
alter table public.cashflow
  alter column work_type set default 'other';

-- Add foreign keys
alter table public.clients
  drop constraint if exists clients_work_type_fkey;
alter table public.clients
  add constraint clients_work_type_fkey foreign key (work_type) references public.work_types (key) on update cascade;

alter table public.cashflow
  drop constraint if exists cashflow_work_type_fkey;
alter table public.cashflow
  add constraint cashflow_work_type_fkey foreign key (work_type) references public.work_types (key) on update cascade;

-- Drop enum type (if no longer referenced)
do $$
begin
  if exists (select 1 from pg_type where typname = 'work_type') then
    drop type public.work_type;
  end if;
end $$;

