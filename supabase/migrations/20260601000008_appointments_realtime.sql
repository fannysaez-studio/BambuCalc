-- Nécessaire pour que postgres_changes envoie le payload complet (UPDATE/DELETE)
ALTER TABLE appointments REPLICA IDENTITY FULL;
