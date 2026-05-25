-- Table pour stocker les souscriptions Web Push
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Chaque utilisateur gère ses propres souscriptions
create policy "push_sub_owner" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Le service role peut tout lire (pour l'envoi par la Edge Function)
create policy "push_sub_service" on public.push_subscriptions
  for all to service_role using (true);
