-- Migration : table rate limiting pour le formulaire de contact
-- Stocke un hash de l'IP par envoi — 3 messages max par tranche de 10 minutes

create table if not exists public.contact_rate_limit (
  id         uuid        default gen_random_uuid() primary key,
  ip_hash    text        not null,
  created_at timestamptz default now()
);

create index if not exists contact_rate_limit_ip_created_idx
  on public.contact_rate_limit (ip_hash, created_at);

-- RLS activé sans policy : seule la SERVICE_ROLE_KEY (Edge Function) peut accéder
alter table public.contact_rate_limit enable row level security;
