-- Lier un devis spécifique à un rendez-vous (optionnel)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS linked_quote_id UUID
  REFERENCES quotes(id) ON DELETE SET NULL;
