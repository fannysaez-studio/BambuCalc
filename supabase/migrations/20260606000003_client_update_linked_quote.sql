-- Permet au client de lier un de ses devis à son propre rendez-vous
CREATE POLICY "client_update_linked_quote_id" ON appointments
  FOR UPDATE
  USING (invitee_email = auth.email())
  WITH CHECK (invitee_email = auth.email());
