-- Politique RLS manquante : admins peuvent supprimer les rendez-vous
DROP POLICY IF EXISTS "appointments_admin_delete" ON appointments;

CREATE POLICY "appointments_admin_delete"
  ON appointments FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
