-- Table rendez-vous Calendly
CREATE TABLE IF NOT EXISTS appointments (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  calendly_event_id  text UNIQUE NOT NULL,
  event_name         text,
  invitee_name       text,
  invitee_email      text,
  start_at           timestamptz,
  end_at             timestamptz,
  status             text DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
  raw                jsonb,
  created_at         timestamptz DEFAULT now() NOT NULL
);

-- RLS : seuls les admins lisent (Edge Function insère via service_role = bypass)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_admin_select"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Index
CREATE INDEX appointments_start_at_idx ON appointments (start_at ASC NULLS LAST);

-- Ajouter le type rdv_booked aux notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('new_quote', 'status_changed', 'quote_modified', 'rdv_booked'));

-- Activer Realtime sur appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
