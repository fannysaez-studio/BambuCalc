-- Suivi présence et note admin sur les rendez-vous
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS attended boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS admin_note text;
