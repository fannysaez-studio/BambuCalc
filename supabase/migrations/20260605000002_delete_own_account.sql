-- Permet à un utilisateur authentifié de supprimer son propre compte
-- ON DELETE CASCADE sur quotes, notifications, push_subscriptions gère le nettoyage
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
