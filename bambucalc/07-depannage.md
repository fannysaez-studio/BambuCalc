# Dépannage

## Variables Supabase manquantes

```text
[BambuCalc] Variables d'environnement Supabase manquantes.
```

→ Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local`

---

## BREVO_API_KEY absente

```sh
npx supabase secrets list   # vérifier que BREVO_API_KEY est présente
npx supabase secrets set BREVO_API_KEY=xkeysib-...
npx supabase functions deploy send-quote-email --no-verify-jwt
```

---

## Edge Function échoue avec 401

```
Error: Unauthorized
```

→ Les Edge Functions utilisent `--no-verify-jwt` car la clé anon (`sb_publishable_*`) n'est pas un JWT signé.  
→ Toujours déployer avec `--no-verify-jwt`.

---

## Webhook Calendly — RDV non reçus

1. Vérifier que `CALENDLY_WEBHOOK_SECRET` dans les secrets Supabase correspond exactement au token dans l'URL du webhook Calendly
2. Vérifier que l'URL du webhook dans Calendly Dashboard pointe vers la bonne Edge Function
3. Tester manuellement depuis Calendly Dashboard → "Send test payload"

---

## Push notifications ne s'activent pas

1. Vérifier que `VITE_VAPID_PUBLIC_KEY` est défini dans Netlify env ou `.env.local`
2. Vérifier que `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` sont dans les secrets Supabase
3. HTTPS obligatoire pour Web Push — ne fonctionne pas sur `http://localhost` (sauf Firefox)
4. Chrome : vérifier `chrome://settings/content/notifications`

---

## Notifications Realtime ne se mettent pas à jour

```
Warning: cannot add 'postgres_changes' callbacks after subscribe()
```

Ce warning est non critique. Si les notifs ne s'affichent pas :
1. Vérifier que la table `notifications` est dans la publication Realtime (Supabase → Realtime)
2. Vérifier les policies RLS `notifications_select_own`

---

## Tester le webhook Stripe en local

```sh
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
```

---

## HMR ne fonctionne pas

```sh
rm -rf node_modules .vite
npm install
npm run dev
```

---

## Port 5173 déjà utilisé

```sh
npm run dev -- --port 3000
```

---

## Build échoue : sitemap error

```sh
node scripts/update-sitemap.js   # tester manuellement
```

→ Vérifier que `public/sitemap.xml` existe et est valide.

---

## Stripe Payment Element — erreur CORS

→ Vérifier que `https://js.stripe.com` est dans `script-src` de la CSP dans `netlify.toml`.

---

<div align="center">

**Précédent :** [← Commandes & Déploiement](./06-commandes.md) &nbsp;|&nbsp; **Suivant :** [Conformité légale →](./08-conformite.md)

</div>
