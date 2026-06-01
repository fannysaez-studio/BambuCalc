-- Politiques RLS : admins peuvent modifier et supprimer les rendez-vous
CREATE POLICY "appointments_admin_update"
  ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "appointments_admin_delete"
  ON appointments FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
