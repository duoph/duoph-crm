-- Run once on existing databases (Supabase SQL editor)
alter table public.clients
  add column if not exists contact_number text not null default '';
