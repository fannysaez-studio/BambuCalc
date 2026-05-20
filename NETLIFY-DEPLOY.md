# Guide de Déploiement BambuCalc sur Netlify
**Date :** 20 mai 2026
**Projet :** BambuCalc — Calculateur de devis impression 3D
**Stack :** Vue 3 · Vite · Supabase · Netlify · Resend · Stripe

---

## Avant de commencer — Checklist des prérequis

Vérifie que tu as bien :

- [ ] Ton projet BambuCalc pushé sur GitHub
- [ ] Accès à ton dashboard Supabase
- [ ] Ta clé publique Stripe (si paiement activé)
- [ ] Environ 20 minutes devant toi

---

## ÉTAPE 1 — Créer ton compte Netlify

### 1.1 Inscription
1. Ouvre ton navigateur et va sur **https://netlify.com**
2. Clique sur le bouton **"Sign up"** en haut à droite
3. Choisis **"Sign up with GitHub"**

> Pourquoi GitHub ? Ça connecte automatiquement tes repositories sans configuration supplémentaire.

4. GitHub te demande d'autoriser Netlify → clique **"Authorize netlify"**
5. Ton compte Netlify est créé — tu arrives sur le dashboard

---

## ÉTAPE 2 — Vérifier le build en local

Avant de déployer, vérifie que ton projet compile sans erreur.

### 2.1 Lancer le build
Ouvre ton terminal dans le dossier BambuCalc et tape :

```bash
npm run build
```

**Résultat attendu :**
```
✓ built in X.XXs
dist/index.html
dist/assets/...
```

Si le build échoue → corrige les erreurs avant de continuer.

### 2.2 Vérifier le résultat du build
```bash
npm run preview
```

Ouvre ton navigateur sur **http://localhost:4173** — ton application doit s'afficher exactement comme en développement.

Si tout est bon → continue à l'étape 3.

---

## ÉTAPE 3 — Déployer sur Netlify

### 3.1 Importer le projet GitHub
1. Dans le dashboard Netlify, clique **"Add new site"**
2. Sélectionne **"Import an existing project"**
3. Clique **"Deploy with GitHub"**
4. Netlify te demande l'accès à tes repos → clique **"Authorize netlify"**
5. Dans la liste, cherche et clique sur **"BambuCalc"**

### 3.2 Configurer le build
Netlify détecte automatiquement Vue/Vite et pré-remplit les champs :

| Champ | Valeur attendue |
|-------|----------------|
| Branch to deploy | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `20` (vérifie dans les variables) |

> Si les champs sont vides, remplis-les manuellement avec les valeurs du tableau.

### 3.3 Premier déploiement
Clique **"Deploy BambuCalc"** — Netlify lance le build.

Tu vois les logs en temps réel. Attends le message :
```
Site is live ✓
```

Ton site est maintenant accessible sur une URL du type :
`https://bambucalc-XXXXX.netlify.app`

> L'application ne fonctionnera pas encore correctement — il faut d'abord configurer les variables d'environnement (étape 4).

---

## ÉTAPE 4 — Configurer les variables d'environnement

C'est l'étape la plus importante. Sans ces variables, Supabase et Stripe ne fonctionneront pas.

### 4.1 Accéder aux variables
1. Dans le dashboard Netlify, clique sur ton site **BambuCalc**
2. Va dans **"Site configuration"** (menu gauche)
3. Clique **"Environment variables"**
4. Clique **"Add a variable"**

### 4.2 Variables à ajouter

Ajoute ces 3 variables une par une :

---

**Variable 1 — URL Supabase**
```
Key   : VITE_SUPABASE_URL
Value : https://upwzdctedpazranppskz.supabase.co
```
*(Cette valeur est déjà dans ton `netlify.toml` — tu peux aussi la laisser là)*

---

**Variable 2 — Clé publique Supabase**
```
Key   : VITE_SUPABASE_ANON_KEY
Value : [ta clé anon Supabase]
```

Pour trouver cette valeur :
1. Va sur **https://supabase.com/dashboard**
2. Sélectionne ton projet BambuCalc
3. Va dans **Settings → API**
4. Copie la valeur sous **"anon public"**

---

**Variable 3 — Clé publique Stripe** *(si tu as activé le paiement)*
```
Key   : VITE_STRIPE_PUBLIC_KEY
Value : pk_live_XXXXXXXXXXXXXXXX
```

Pour trouver cette valeur :
1. Va sur **https://dashboard.stripe.com**
2. Va dans **Developers → API keys**
3. Copie la **"Publishable key"** (commence par `pk_live_` ou `pk_test_`)

---

### 4.3 Sauvegarder
Après avoir ajouté toutes les variables, clique **"Save"**.

---

## ÉTAPE 5 — Redéployer avec les variables

Les variables d'environnement ne sont prises en compte qu'au prochain build.

1. Va dans **"Deploys"** (menu gauche)
2. Clique **"Trigger deploy"** → **"Deploy site"**
3. Attends la fin du build (`Site is live ✓`)

Ton application est maintenant fully fonctionnelle sur Netlify.

---

## ÉTAPE 6 — Vérifier que tout fonctionne

### 6.1 Tests à effectuer après déploiement

Ouvre ton URL Netlify (`https://bambucalc-XXXXX.netlify.app`) et teste :

**Authentification**
- [ ] Page d'accueil s'affiche correctement
- [ ] Créer un compte → reçois l'email de bienvenue
- [ ] Se connecter avec email/mot de passe
- [ ] Connexion Google OAuth fonctionne
- [ ] Reset password → email reçu

**Calculateur**
- [ ] Remplir les étapes du calculateur
- [ ] Générer un aperçu du devis
- [ ] Télécharger le PDF
- [ ] Sauvegarder le devis → apparaît dans le dashboard

**Admin** *(avec ton compte admin)*
- [ ] Accès à `/admin` fonctionne
- [ ] Onglet Catalogue opérationnel
- [ ] Onglet Paramètres opérationnel

### 6.2 Vérifier les emails
- [ ] Email de bienvenue reçu lors de l'inscription
- [ ] Notification admin reçue lors de la sauvegarde d'un devis

---

## ÉTAPE 7 — Personnaliser l'URL du site

### 7.1 Changer le nom du sous-domaine Netlify
Par défaut ton site s'appelle `bambucalc-XXXXX.netlify.app`. Tu peux le personnaliser :

1. **"Site configuration" → "Domain management"**
2. Clique sur le nom du site (ex: `bambucalc-XXXXX`)
3. Clique **"Edit site name"**
4. Tape `bambucalc` → **"Save"**
5. Ton site sera sur `https://bambucalc.netlify.app`

### 7.2 Ajouter un domaine custom `bambucalc.fr` *(quand tu l'auras acheté)*

1. **"Domain management" → "Add a domain"**
2. Tape `bambucalc.fr` → **"Verify"**
3. Netlify affiche les records DNS à configurer :

```
Type : A      Nom : @    Valeur : 75.2.60.5
Type : CNAME  Nom : www  Valeur : bambucalc.netlify.app
```

4. Va dans ton panel **02switch → Zone DNS de bambucalc.fr**
5. Ajoute ces 2 records → Sauvegarde
6. Attends 30 min à 2h (propagation DNS)
7. Netlify active automatiquement le certificat SSL (HTTPS)

---

## ÉTAPE 8 — Activer HSTS après SSL *(optionnel)*

Une fois que ton certificat SSL est actif et stable (attends 24-48h), décommenter dans `netlify.toml` :

```toml
Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

Puis commiter et pusher → Netlify redéploie automatiquement.

---

## ÉTAPE 9 — Déploiements futurs

### 9.1 Déploiement automatique
À partir de maintenant, **chaque `git push` sur la branche `main` déclenche automatiquement un nouveau déploiement Netlify**. Tu n'as rien à faire manuellement.

```bash
# Ton workflow habituel
git add .
git commit -m "feat: ma nouvelle fonctionnalité"
git push
# → Netlify détecte le push et déploie automatiquement
```

### 9.2 Vérifier un déploiement
1. Dashboard Netlify → **"Deploys"**
2. Tu vois l'historique de tous tes déploiements
3. Clique sur un déploiement pour voir les logs détaillés

### 9.3 Annuler un déploiement raté
Si un déploiement casse quelque chose :
1. **"Deploys"** → clique sur le dernier déploiement fonctionnel
2. Clique **"Publish deploy"** → revient à cette version

---

## Récapitulatif des URLs importantes

| Service | URL |
|---------|-----|
| Dashboard Netlify | https://app.netlify.com |
| Dashboard Supabase | https://supabase.com/dashboard |
| Dashboard Resend | https://resend.com |
| Dashboard Stripe | https://dashboard.stripe.com |
| Ton site (provisoire) | https://bambucalc.netlify.app |
| Ton site (futur) | https://bambucalc.fr |

---

## Récapitulatif des variables d'environnement

| Variable | Où la trouver | Sensible ? |
|----------|--------------|-----------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API | Non |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API | Non (conçue pour être publique) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe → Developers → API keys | Non (conçue pour être publique) |

> Les clés secrètes (RESEND_API_KEY, STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY) ne vont PAS dans Netlify — elles sont configurées dans Supabase via `supabase secrets set`.

---

## En cas de problème

**Le build échoue sur Netlify**
→ Regarde les logs du déploiement (onglet "Deploys")
→ Lance `npm run build` en local pour reproduire l'erreur

**L'app s'affiche mais Supabase ne répond pas**
→ Vérifie que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien configurées
→ Redéploie après avoir ajouté les variables

**Page blanche sur une URL directe (ex: `/calculator`)**
→ Le redirect SPA n'est pas actif → vérifie que `netlify.toml` contient bien :
```toml
[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

**Certificat SSL non actif**
→ Attends 24h après avoir configuré le domaine custom
→ Si toujours inactif : Netlify → Domain management → "Verify DNS configuration"

---

*BambuCalc — Guide déploiement Netlify — Mai 2026*
