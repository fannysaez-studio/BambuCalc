-- Trigger 1 : nouveau devis → notifier tous les admins
CREATE OR REPLACE FUNCTION trigger_notify_new_quote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_row RECORD;
BEGIN
  FOR admin_row IN SELECT user_id FROM admins LOOP
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      admin_row.user_id,
      'new_quote',
      'Nouveau devis reçu',
      COALESCE(NEW.project_name, 'Sans nom') || CASE
        WHEN NEW.material IS NOT NULL AND NEW.material != '' THEN ' — ' || NEW.material
        ELSE ''
      END,
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quote_insert
  AFTER INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_quote();
