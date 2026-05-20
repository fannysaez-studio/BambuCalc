-- ══════════════════════════════════════════════
--  BambuCalc — Migration Admin
--  À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════

-- 1. Ajouter l'email dans les profils
alter table public.profiles
  add column if not exists email text;

-- 2. Mettre à jour le trigger pour capturer l'email à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do update set
    email     = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

-- 3. Peupler l'email pour les utilisateurs déjà inscrits
-- (utilise une fonction security definer pour accéder à auth.users)
create or replace function public.sync_profile_emails()
returns void language plpgsql security definer as $$
begin
  update public.profiles p
  set email = u.email
  from auth.users u
  where p.id = u.id and p.email is null;
end;
$$;

select public.sync_profile_emails();

-- 4. Table des administrateurs
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- Tous les utilisateurs connectés peuvent vérifier s'ils sont admin
create policy "admins: lecture pour authentifiés"
  on public.admins for select
  to authenticated
  using (true);

-- 5. Politiques RLS admin sur les devis
create policy "admin: voir tous les devis"
  on public.quotes for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admin: supprimer tous les devis"
  on public.quotes for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- 6. Politiques RLS admin sur les profils
create policy "admin: voir tous les profils"
  on public.profiles for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- 7. Fonction sécurisée pour supprimer un utilisateur (admin uniquement)
create or replace function public.admin_delete_user(target_user_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'Accès refusé : réservé aux administrateurs';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

-- ══════════════════════════════════════════════
--  DERNIÈRE ÉTAPE : te définir comme admin
--
--  1. Va dans Authentication > Users dans Supabase
--  2. Copie ton UID (colonne "UID")
--  3. Remplace VOTRE-USER-ID-ICI ci-dessous et exécute :
--
--  insert into public.admins (user_id) values ('VOTRE-USER-ID-ICI');
-- ══════════════════════════════════════════════
