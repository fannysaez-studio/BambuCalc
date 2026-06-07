# SEO & Méta

BambuCalc implémente un SEO complet via `@vueuse/head` : chaque page a son propre `<title>`, `<meta description>`, balises OG/Twitter, canonical et robots.

---

## Stratégie SEO

- **`@vueuse/head`** — meta dynamiques injectées dans `<head>` par chaque composant de page
- **`index.html`** — meta globales immuables + JSON-LD + preloads LCP
- **`sitemap.xml`** — généré au build par `scripts/update-sitemap.js`
- **`robots.txt`** — à la racine public/
- **Canonical** — URL absolue pour chaque page

---

## Meta par page

### `/` — Landing

| Meta                  | Valeur                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`             | BambuCalc — Calculateur de coûts d'impression 3D                                                                                                         |
| `description`         | Calculez vos coûts d'impression 3D, estimez vos marges et générez vos devis en quelques secondes. Outil professionnel pour prestataires d'impression 3D. |
| `og:title`            | BambuCalc — Calculateur d'impression 3D                                                                                                                  |
| `og:description`      | Estimez vos coûts, gérez vos devis et pilotez vos marges d'impression 3D.                                                                                |
| `og:url`              | <https://bambucalc.netlify.app/>                                                                                                                         |
| `twitter:title`       | BambuCalc — Calculateur d'impression 3D                                                                                                                  |
| `twitter:description` | Estimez vos coûts, gérez vos devis et pilotez vos marges d'impression 3D.                                                                                |
| `canonical`           | <https://bambucalc.netlify.app/>                                                                                                                         |
| `robots`              | index, follow                                                                                                                                            |

---

### `/calculator/:step` — Calculateur

| Meta             | Valeur                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `<title>`        | Calculateur d'impression 3D — BambuCalc                                                                              |
| `description`    | Calculez vos coûts d'impression 3D : matériaux, temps machine, amortissement. Obtenez votre devis en quelques clics. |
| `og:title`       | Calculateur d'impression 3D — BambuCalc                                                                              |
| `og:description` | Calculez vos coûts d'impression 3D : matériaux, temps machine, amortissement.                                        |
| `og:url`         | <https://bambucalc.netlify.app/calculator/1>                                                                         |
| `canonical`      | <https://bambucalc.netlify.app/calculator/1>                                                                         |
| `robots`         | index, follow                                                                                                        |

---

### `/login` — Connexion

| Meta             | Valeur                                                               |
| ---------------- | -------------------------------------------------------------------- |
| `<title>`        | Connexion — BambuCalc                                                |
| `description`    | Connectez-vous à BambuCalc pour accéder à vos devis d'impression 3D. |
| `og:title`       | Connexion — BambuCalc                                                |
| `og:description` | Accédez à votre espace BambuCalc.                                    |
| `canonical`      | <https://bambucalc.netlify.app/login>                                |
| `robots`         | index, follow                                                        |

---

### `/signup` — Inscription

| Meta             | Valeur                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| `<title>`        | Inscription — BambuCalc                                                   |
| `description`    | Créez votre compte BambuCalc et gérez vos devis d'impression 3D en ligne. |
| `og:title`       | Inscription — BambuCalc                                                   |
| `og:description` | Rejoignez BambuCalc et gérez vos projets 3D.                              |
| `canonical`      | <https://bambucalc.netlify.app/signup>                                    |
| `robots`         | index, follow                                                             |

---

### `/reset-password` — Réinitialisation mot de passe

| Meta          | Valeur                                      |
| ------------- | ------------------------------------------- |
| `<title>`     | Nouveau mot de passe — BambuCalc            |
| `description` | Réinitialisez votre mot de passe BambuCalc. |
| `robots`      | noindex, nofollow                           |

---

### `/dashboard` — Dashboard client

| Meta          | Valeur                                                              |
| ------------- | ------------------------------------------------------------------- |
| `<title>`     | Mon espace — BambuCalc                                              |
| `description` | Gérez vos devis, rendez-vous et paramètres de compte sur BambuCalc. |
| `canonical`   | <https://bambucalc.netlify.app/dashboard>                           |
| `robots`      | index, follow                                                       |

---

### `/admin` — Dashboard admin

| Meta          | Valeur                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| `<title>`     | Administration — BambuCalc                                                    |
| `description` | Espace d'administration BambuCalc — gestion des clients, devis et paramètres. |
| `canonical`   | <https://bambucalc.netlify.app/admin>                                         |
| `robots`      | index, follow                                                                 |

---

### `/contact` — Contact

| Meta             | Valeur                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `<title>`        | Contact — BambuCalc                                                                       |
| `description`    | Contactez Fanny Saez pour toute question sur BambuCalc. Réponse sous 24h en jours ouvrés. |
| `og:title`       | Contact — BambuCalc                                                                       |
| `og:description` | Contactez Fanny Saez pour toute question sur BambuCalc.                                   |
| `og:url`         | <https://bambucalc.netlify.app/contact>                                                   |
| `canonical`      | <https://bambucalc.netlify.app/contact>                                                   |
| `robots`         | index, follow                                                                             |

---

### `/rdv` — Prise de rendez-vous

| Meta             | Valeur                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `<title>`        | Prendre rendez-vous — BambuCalc                                                                                        |
| `description`    | Prenez rendez-vous avec Fanny Saez pour discuter de votre projet d'impression 3D. Disponible en visio ou en extérieur. |
| `og:title`       | Prendre rendez-vous — BambuCalc                                                                                        |
| `og:description` | Prenez rendez-vous pour discuter de votre projet d'impression 3D.                                                      |
| `og:url`         | <https://bambucalc.netlify.app/rdv>                                                                                    |
| `canonical`      | <https://bambucalc.netlify.app/rdv>                                                                                    |
| `robots`         | index, follow                                                                                                          |

---

### `/pay/:quoteId` — Paiement

| Meta          | Valeur                                                            |
| ------------- | ----------------------------------------------------------------- |
| `<title>`     | Paiement sécurisé — BambuCalc                                     |
| `description` | Réglez votre devis d'impression 3D en ligne de manière sécurisée. |
| `robots`      | noindex, nofollow                                                 |

---

### `/privacy` — Politique de confidentialité

| Meta          | Valeur                                                                                 |
| ------------- | -------------------------------------------------------------------------------------- |
| `<title>`     | Politique de confidentialité — BambuCalc                                               |
| `description` | Politique de confidentialité de BambuCalc — traitement des données personnelles, RGPD. |
| `canonical`   | <https://bambucalc.netlify.app/privacy>                                                |
| `robots`      | index, follow                                                                          |

---

### `/mentions-legales` — Mentions légales

| Meta          | Valeur                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| `<title>`     | Mentions légales — BambuCalc                                                  |
| `description` | Mentions légales de BambuCalc — éditeur, hébergeur, propriété intellectuelle. |
| `canonical`   | <https://bambucalc.netlify.app/mentions-legales>                              |
| `robots`      | index, follow                                                                 |

---

### `/404` — Page non trouvée

| Meta      | Valeur                       |
| --------- | ---------------------------- |
| `<title>` | Page introuvable — BambuCalc |
| `robots`  | noindex                      |

---

### `/403` — Accès refusé

| Meta      | Valeur                   |
| --------- | ------------------------ |
| `<title>` | Accès refusé — BambuCalc |
| `robots`  | noindex                  |

---

### `/maintenance` — Maintenance

| Meta          | Valeur                                                      |
| ------------- | ----------------------------------------------------------- |
| `<title>`     | Maintenance — BambuCalc                                     |
| `description` | BambuCalc est temporairement indisponible pour maintenance. |
| `robots`      | noindex                                                     |

---

## JSON-LD global (`index.html`)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "BambuCalc",
  "url": "https://bambucalc.netlify.app",
  "description": "Calculateur de coût d'impression 3D gratuit...",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "inLanguage": "fr",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "creator": {
    "@type": "Person",
    "name": "Fanny Saez",
    "url": "https://www.linkedin.com/in/fannysaez/"
  }
}
```

---

## Sitemap.xml

Généré automatiquement au build par `scripts/update-sitemap.js` :

- Inclut toutes les routes publiques (/, /calculator/1, /contact, /rdv, /privacy, /mentions-legales)
- Exclut les routes protégées (/dashboard, /admin, /profile, /pay/\*)
- `<lastmod>` avec la date du build

---

## Meta globales dans `index.html`

```html
<meta property="og:type" content="website" />
<meta property="og:locale" content="fr_FR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#2e9cab" />
```

Ces meta ne changent pas selon la page — les autres sont gérées par `useHead()`.

---

<div align="center">

**Précédent :** [← RDV & Calendly](./13-rdv-calendly.md) &nbsp;|&nbsp; **Suivant :** [Tests →](./15-tests.md) &nbsp;

</div>
