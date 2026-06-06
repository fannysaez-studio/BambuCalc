-- Migration : ajout colonne items (jsonb) pour les devis multi-pièces
-- À exécuter dans Supabase > SQL Editor

alter table public.quotes
  add column if not exists items jsonb default '[]'::jsonb;

comment on column public.quotes.items is
  'Tableau JSON des pièces du devis (multi-pièces). Chaque entrée contient :
   id, name, quantity, weight, lossPercent, colorCount, purgeWaste,
   materialId, material, costPerKg, referenceImageUrl.
   Si vide, le devis est mono-pièce (legacy).';
