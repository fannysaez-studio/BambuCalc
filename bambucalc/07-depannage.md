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

<div align="center">

**Précédent :** [← Commandes & Déploiement](./06-commandes.md) &nbsp;|&nbsp; **Suivant :** [Conformité légale →](./08-conformite.md)

</div>
