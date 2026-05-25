-- Migration : colonne updated_at sur quotes + trigger auto-update
-- À exécuter dans Supabase > SQL Editor

-- 1. Ajoute la colonne (par défaut = date de création pour les lignes existantes)
alter table public.quotes
  add column if not exists updated_at timestamptz default now();

-- Initialise updated_at = created_at pour tous les devis déjà existants
update public.quotes
  set updated_at = created_at
  where updated_at is null or updated_at = now();

-- 2. Fonction trigger générique (réutilisable sur d'autres tables)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Trigger sur quotes : se déclenche à chaque UPDATE
drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row
  execute function public.set_updated_at();
