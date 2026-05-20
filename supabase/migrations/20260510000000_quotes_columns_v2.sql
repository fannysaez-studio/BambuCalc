-- Migration v2 : nouvelles colonnes quotes + grants
-- À exécuter dans Supabase > SQL Editor

alter table public.quotes
  add column if not exists quote_number    text,
  add column if not exists quote_date      date,
  add column if not exists client_name     text,
  add column if not exists client_type     text default 'particulier',
  add column if not exists client_email    text,
  add column if not exists quantity        integer default 1,
  add column if not exists loss_percent    numeric default 5,
  add column if not exists color_count     integer default 1,
  add column if not exists purge_waste     numeric default 0,
  add column if not exists print_hours     numeric default 0,
  add column if not exists print_minutes   numeric default 0,
  add column if not exists prep_time       numeric default 15,
  add column if not exists post_time       numeric default 0,
  add column if not exists hourly_rate     numeric default 20;

-- Grants (si pas encore fait)
grant select, insert, update, delete on public.quotes   to authenticated;
grant select, update                  on public.profiles to authenticated;
