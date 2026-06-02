-- Politique RLS : les clients lisent leurs propres rendez-vous (par email)
DO $$ BEGIN
  CREATE POLICY "appointments_client_select"
    ON appointments FOR SELECT
    USING (invitee_email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
