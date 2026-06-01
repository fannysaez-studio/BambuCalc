ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS format text
  CHECK (format IN ('online', 'inperson')) DEFAULT NULL;
