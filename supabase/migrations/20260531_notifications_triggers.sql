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

-- Trigger 2 : statut changé ou devis modifié par admin → notifier le client
CREATE OR REPLACE FUNCTION trigger_notify_quote_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  modifier_id uuid;
  status_label text;
BEGIN
  modifier_id := auth.uid();

  -- Changement de statut → notif pour le propriétaire du devis
  IF OLD.status IS DISTINCT FROM NEW.status
     AND modifier_id IS DISTINCT FROM NEW.user_id THEN
    status_label := CASE NEW.status
      WHEN 'accepted' THEN 'Accepté ✓'
      WHEN 'refused'  THEN 'Refusé'
      WHEN 'sent'     THEN 'Envoyé'
      ELSE NEW.status
    END;
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      NEW.user_id,
      'status_changed',
      'Statut de votre devis mis à jour',
      COALESCE(NEW.quote_number, 'Votre devis') || ' est maintenant : ' || status_label,
      NEW.id
    );
  END IF;

  -- Modification par l'admin (hors changement de statut) → notif client
  IF OLD.status IS NOT DISTINCT FROM NEW.status
     AND modifier_id IS DISTINCT FROM NEW.user_id
     AND modifier_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      NEW.user_id,
      'quote_modified',
      'Votre devis a été modifié',
      COALESCE(NEW.quote_number, 'Votre devis') || ' a été mis à jour par le prestataire.',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quote_update
  AFTER UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_quote_update();
