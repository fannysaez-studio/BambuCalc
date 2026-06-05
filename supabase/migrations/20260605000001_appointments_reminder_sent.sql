-- Évite d'envoyer le rappel plusieurs fois pour le même RDV
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
