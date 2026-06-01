ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS presence text
  CHECK (presence IN ('present', 'absent')) DEFAULT NULL;
