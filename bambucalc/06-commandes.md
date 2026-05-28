# Commandes & Déploiement

## Développement

```sh
npm run dev          # serveur local → http://localhost:5173
npm run build        # build production → dist/
npm run preview      # prévisualiser le build
```

## Qualité

```sh
npm run lint         # ESLint + Prettier
npm run format       # Prettier seul
```

## Tests

```sh
npm run test:unit              # Vitest
npm run test:e2e               # Playwright
npx playwright install         # à faire une seule fois
```

---

## Déploiement Netlify

1. Importer le repo sur [app.netlify.com](https://app.netlify.com) — build `npm run build`, dossier `dist/`
2. Ajouter les variables d'environnement :

   ```text
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_STRIPE_PUBLIC_KEY
   ```

3. `git push origin main` redéclenche le déploiement automatiquement
4. Après 24-48h (SSL stable) : décommenter les headers `Strict-Transport-Security` dans `netlify.toml`

---

<div align="center">

**Précédent :** [← Edge Functions](./05-edge-functions.md) &nbsp;|&nbsp; **Suivant :** [Dépannage →](./07-depannage.md)

</div>
