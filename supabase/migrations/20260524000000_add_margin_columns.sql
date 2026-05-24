-- ══════════════════════════════════════════════════════════════════
--  BambuCalc — Migration : Marge et sous-total HT sur la table quotes
--  Date     : 2026-05-24
--  Objectif : Stocker le coût de revient HT et la marge commerciale
--             appliquée, séparément du prix de vente TTC (total_cost).
-- ══════════════════════════════════════════════════════════════════

alter table public.quotes
  add column if not exists subtotal_ht    numeric default 0,
  add column if not exists margin_percent numeric default 40;

comment on column public.quotes.subtotal_ht is
  'Coût de revient HT avant marge (matière + équipement + main-d''œuvre + emballage × projectCoeff).
   Réservé à l''admin — ne pas afficher au client.';

comment on column public.quotes.margin_percent is
  'Marge commerciale appliquée en % (ex: 15 = ami, 40 = particulier, 65 = pro).
   Le total_cost et cost_per_unit stockent le prix de vente TTC après marge.';
