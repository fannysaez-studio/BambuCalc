# Installation

## Prérequis

- **Node.js** 20.19.0+ ou 22.12.0+
- **npm** 10.0.0+

## Étapes

```sh
git clone <url-du-repo> && cd BambuCalc
npm install
cp .env.example .env.local   # remplir avec vos clés
npm run dev                  # → http://localhost:5173
```

---

## Variables d'environnement

### `.env.local` (frontend)

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_live_...   # pk_test_... en dev
```

### Secrets backend

Configurés dans **Supabase → Edge Functions → Secrets** (jamais exposés au navigateur) :

```text
BREVO_API_KEY              → xkeysib-...
STRIPE_SECRET_KEY          → sk_live_... (ou sk_test_...)
STRIPE_WEBHOOK_SECRET      → whsec_...
SUPABASE_SERVICE_ROLE_KEY  → auto-injectée
```

---

<div align="center">

**Précédent :** [← Présentation](./01-presentation.md) &nbsp;|&nbsp; **Suivant :** [Structure du projet →](./03-structure.md)

</div>
