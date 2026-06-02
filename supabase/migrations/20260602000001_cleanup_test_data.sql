-- Supprime les RDV de test (marie@test.fr, debug@test.fr, test@bambucalc.fr)
DELETE FROM public.appointments
  WHERE invitee_email IN ('marie@test.fr', 'debug@test.fr', 'test@bambucalc.fr');
