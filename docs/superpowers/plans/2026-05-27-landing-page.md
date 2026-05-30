# BambuCalc Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer `src/views/Landing.vue` par une landing page marketing multi-sections scrollable, visuellement identique au reste de l'app (glassmorphism + wave SVG background).

**Architecture:** Un seul fichier Vue monolithique — même pattern que `Login.vue` / `Signup.vue`. 4 sections empilées (Hero · Comment ça marche · Tarifs · Footer), chacune en `display: grid; grid-template-columns: 1fr 1fr` avec panneau teal (`rgba(177,229,226,0.65)` + `backdrop-filter: blur(16px)`) et panneau blanc (`rgba(255,255,255,0.62)` + `backdrop-filter: blur(16px)`). La page scroll librement avec `hero-vagues.svg` en `background-attachment: fixed`.

**Tech Stack:** Vue 3 Options API · lucide-vue-next · CSS scoped · Playwright e2e · Figma MCP (task séparée)

**Spec:** `docs/superpowers/specs/2026-05-27-landing-page-design.md`

---

## Fichiers touchés

| Action | Fichier |
|---|---|
| **Remplacer** intégralement | `src/views/Landing.vue` |
| **Modifier** (test e2e) | `e2e/vue.spec.js` |
| Inchangé | `src/router/index.js`, `src/App.vue`, `src/components/ui/GlobalNav.vue`, `src/styles/variables.css` |

---

## Task 1 — E2E test (TDD : écrire avant d'implémenter)

**Fichier :** `e2e/vue.spec.js`

- [ ] **Remplacer le contenu de `e2e/vue.spec.js`** par les tests landing :

```js
import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('affiche le titre principal', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Calculez vos impressions 3D sans friction')
  })

  test('affiche la section Comment ça marche', async ({ page }) => {
    await expect(page.getByText('3 étapes, un devis prêt à envoyer')).toBeVisible()
  })

  test('affiche la section Tarifs', async ({ page }) => {
    await expect(page.getByText('Simple. Gratuit au lancement.')).toBeVisible()
  })

  test('affiche les 4 feature cards', async ({ page }) => {
    await expect(page.getByText('Calcul précis')).toBeVisible()
    await expect(page.getByText('Tarification flexible')).toBeVisible()
    await expect(page.getByText('Séries maîtrisées')).toBeVisible()
    await expect(page.getByText('Devis exportables')).toBeVisible()
  })

  test('CTA Créer un compte pointe vers /signup', async ({ page }) => {
    const links = page.locator('a[href="/signup"]')
    await expect(links.first()).toBeVisible()
  })

  test('CTA Se connecter pointe vers /login', async ({ page }) => {
    const links = page.locator('a[href="/login"]')
    await expect(links.first()).toBeVisible()
  })

  test('footer contient les liens légaux', async ({ page }) => {
    await expect(page.locator('footer').getByText('Mentions légales')).toBeVisible()
    await expect(page.locator('footer').getByText('Confidentialité')).toBeVisible()
    await expect(page.locator('footer').getByText('Contact')).toBeVisible()
  })

  test('mobile — la page se scroll correctement', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('footer')).toBeVisible()
  })
})
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent** (comportement attendu avant l'implémentation) :

```bash
npm run test:e2e -- --project=chromium
```

Résultat attendu : tous les tests `FAIL` (le h1 actuel ne contient pas le bon texte).

---

## Task 2 — Template Vue : Hero section

**Fichier :** `src/views/Landing.vue` (remplacement complet — commencer par le template)

- [ ] **Remplacer `src/views/Landing.vue`** par ce contenu (template + script, sans le style pour l'instant) :

```vue
<template>
  <div class="landing-page">

    <!-- ═══════ SECTION 1 : HERO ═══════════════════════════════════ -->
    <section class="landing-section hero-section">

      <!-- Panneau gauche — teal -->
      <div class="panel panel-teal hero-visual" aria-hidden="true">
        <div class="visual-badge">
          <span class="badge-mark"></span>
          <span>BambuCalc</span>
        </div>

        <div class="visual-copy">
          <h1>Calculez vos impressions 3D sans friction</h1>
          <p>
            Une expérience claire et premium pour estimer vos coûts,
            préparer vos devis et suivre vos marges.
          </p>
        </div>

        <div class="visual-illustration">
          <div class="visual-composition">
            <img
              src="/bambu lab P2S Combo.webp"
              alt="Bambu Lab P2S Combo"
              class="visual-printer"
            />
            <img
              src="/bambuLab Filament.webp"
              alt="Filament BambuLab"
              class="visual-main"
            />
          </div>
        </div>
      </div>

      <!-- Panneau droit — blanc -->
      <div class="panel panel-white hero-card">
        <p class="landing-kicker">Calculateur de coûts d'impression 3D</p>

        <h2>Tout ce qu'il faut pour passer du prototype au devis.</h2>

        <p class="landing-description">
          Gardez le contrôle sur les matières, le temps machine,
          l'amortissement et les remises volume dans une interface unique.
        </p>

        <div class="landing-features">
          <div class="feature-card">
            <BarChart3 class="feature-icon" />
            <div class="feature-title">Calcul précis</div>
            <div class="feature-text">
              Matériau, équipement et main-d'œuvre regroupés dans un seul calcul.
            </div>
          </div>
          <div class="feature-card">
            <DollarSign class="feature-icon" />
            <div class="feature-title">Tarification flexible</div>
            <div class="feature-text">Adaptez vos marges selon le volume et le type de projet.</div>
          </div>
          <div class="feature-card">
            <Zap class="feature-icon" />
            <div class="feature-title">Séries maîtrisées</div>
            <div class="feature-text">Pilotez les remises et les coûts de production en série.</div>
          </div>
          <div class="feature-card">
            <Download class="feature-icon" />
            <div class="feature-title">Devis exportables</div>
            <div class="feature-text">Préparez et partagez vos devis en quelques secondes.</div>
          </div>
        </div>

        <div class="landing-cta">
          <router-link to="/signup" class="btn btn-primary">Créer un compte</router-link>
          <router-link to="/login" class="btn btn-secondary">Se connecter</router-link>
        </div>

        <div class="landing-legal">
          <router-link to="/mentions-legales">Mentions légales</router-link>
          <span>·</span>
          <router-link to="/privacy">Politique de confidentialité</router-link>
        </div>
      </div>

    </section>

    <!-- ═══════ SECTION 2 : COMMENT ÇA MARCHE ══════════════════════ -->
    <section class="landing-section how-section">

      <!-- Panneau gauche — teal : 3 étapes -->
      <div class="panel panel-teal how-visual">
        <h2 class="how-title">3 étapes, un devis prêt à envoyer</h2>

        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-body">
              <h3 class="step-title">Configurez votre impression</h3>
              <p class="step-desc">
                Renseignez le filament, le temps machine et les paramètres de votre projet 3D.
              </p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-body">
              <h3 class="step-title">Ajustez vos marges</h3>
              <p class="step-desc">
                Définissez votre taux horaire, vos remises volume et votre marge souhaitée.
              </p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-body">
              <h3 class="step-title">Exportez votre devis</h3>
              <p class="step-desc">
                Générez un PDF professionnel ou envoyez un lien de paiement à votre client.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau droit — blanc : aperçu UI -->
      <div class="panel panel-white how-card">
        <p class="landing-kicker">Aperçu de l'interface</p>
        <h3 class="how-card-title">Visualisez votre coût en temps réel</h3>
        <p class="how-card-desc">
          Chaque paramètre que vous modifiez met à jour instantanément le total estimé —
          plus besoin de tableau Excel.
        </p>

        <div class="ui-preview">
          <p class="ui-preview-title">Estimation · Projet Prototype PLA</p>
          <div class="ui-row">
            <span class="ui-label">Matériau (PLA 200g)</span>
            <span class="ui-val">4,40 €</span>
          </div>
          <div class="ui-row">
            <span class="ui-label">Temps machine (3h)</span>
            <span class="ui-val">6,00 €</span>
          </div>
          <div class="ui-row">
            <span class="ui-label">Main d'œuvre</span>
            <span class="ui-val">9,00 €</span>
          </div>
          <div class="ui-row">
            <span class="ui-label">Marge (30%)</span>
            <span class="ui-val ui-val--teal">+5,82 €</span>
          </div>
          <div class="ui-total">
            <span>Total TTC</span>
            <span class="ui-total-val">25,22 €</span>
          </div>
        </div>

        <router-link to="/calculator/1" class="btn btn-primary how-cta">
          Essayer gratuitement
        </router-link>
      </div>

    </section>

    <!-- ═══════ SECTION 3 : TARIFS ══════════════════════════════════ -->
    <section class="landing-section pricing-section">

      <!-- Panneau gauche — blanc : carte tarifaire -->
      <div class="panel panel-white pricing-card">
        <span class="price-badge">🎉 Accès complet gratuit</span>

        <div class="price-amount">
          0 <span class="price-currency">€</span>
        </div>
        <p class="price-period">Pendant la phase de lancement · bambucalc.fr</p>

        <ul class="price-list">
          <li>Calculateur de coûts complet</li>
          <li>Devis PDF illimités</li>
          <li>Gestion des marges &amp; remises volume</li>
          <li>Paiement client via Stripe</li>
          <li>Tableau de bord &amp; historique</li>
          <li>Catalogue de matériaux</li>
        </ul>

        <div class="landing-cta">
          <router-link to="/signup" class="btn btn-primary">Créer un compte</router-link>
          <router-link to="/login" class="btn btn-secondary">Se connecter</router-link>
        </div>
      </div>

      <!-- Panneau droit — teal : accroche -->
      <div class="panel panel-teal pricing-visual">
        <h2 class="pricing-headline">Simple.<br>Gratuit au lancement.</h2>
        <p class="pricing-pitch">
          Aucun engagement, aucune carte bancaire requise.<br>
          Rejoignez les makers et prestataires 3D qui utilisent BambuCalc
          pour valoriser leur travail.
        </p>
        <router-link to="/signup" class="btn btn-white pricing-cta">
          Commencer maintenant →
        </router-link>
      </div>

    </section>

    <!-- ═══════ FOOTER ═══════════════════════════════════════════════ -->
    <footer class="landing-section footer-section">

      <div class="panel panel-teal footer-left">
        <div class="visual-badge">
          <span class="badge-mark"></span>
          <span>BambuCalc</span>
        </div>
      </div>

      <div class="panel panel-white footer-right">
        <nav class="footer-links" aria-label="Liens légaux">
          <router-link to="/mentions-legales">Mentions légales</router-link>
          <router-link to="/privacy">Confidentialité</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
        <p class="footer-copy">© 2026 Fanny Saez · Clermont-Ferrand</p>
      </div>

    </footer>

  </div>
</template>

<script>
import { BarChart3, DollarSign, Zap, Download } from 'lucide-vue-next'

export default {
  name: 'LandingView',
  components: { BarChart3, DollarSign, Zap, Download },
}
</script>

<style scoped>
/* styles à ajouter dans les tâches suivantes */
</style>
```

- [ ] **Vérifier dans le navigateur** que la page `/` affiche la structure (sans style) — le texte doit être visible :
  ```bash
  npm run dev
  ```
  Ouvrir `http://localhost:5173/` — le titre `h1` et les sections doivent être présents dans le DOM.

---

## Task 3 — CSS : base, panels et sections

**Fichier :** `src/views/Landing.vue` — remplacer le bloc `<style scoped>` vide par :

- [ ] **Ajouter le CSS de base** (page wrapper, overlay, sections, panels) :

```css
/* ─── Page wrapper ─────────────────────────────────────────────── */
.landing-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-image: url('/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  position: relative;
  box-sizing: border-box;
  overflow-x: hidden;
}

.landing-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.14) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ─── Section (conteneur 2 colonnes) ───────────────────────────── */
.landing-section {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 28px;
  overflow: hidden;
}

/* ─── Panels ────────────────────────────────────────────────────── */
.panel-teal {
  background: rgba(177, 229, 226, 0.65);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
  color: #fff;
  position: relative;
  isolation: isolate;
}

.panel-teal::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.16), transparent 24%),
    radial-gradient(circle at 75% 70%, rgba(46, 154, 171, 0.1), transparent 28%);
  pointer-events: none;
}

.panel-white {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
}

/* Coins arrondis : teal gauche / blanc droite */
.hero-section .panel-teal,
.how-section .panel-teal,
.footer-section .panel-teal  { border-radius: 28px 0 0 28px; }

.hero-section .panel-white,
.how-section .panel-white,
.footer-section .panel-white  { border-radius: 0 28px 28px 0; }

/* Tarifs : inversé (blanc gauche / teal droite) */
.pricing-section .panel-white { border-radius: 28px 0 0 28px; }
.pricing-section .panel-teal  { border-radius: 0 28px 28px 0; }
```

---

## Task 4 — CSS : Hero section

**Fichier :** `src/views/Landing.vue` — **ajouter à la suite** du CSS existant :

- [ ] **Ajouter le CSS du Hero** :

```css
/* ─── Hero ──────────────────────────────────────────────────────── */
.hero-section {
  min-height: 85vh;
}

/* Panneau teal — badge */
.visual-badge {
  position: relative;
  z-index: 1;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.badge-mark {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.65rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.62));
  position: relative;
  box-shadow: 0 8px 18px rgba(29, 10, 50, 0.18);
  flex-shrink: 0;
}

.badge-mark::before,
.badge-mark::after {
  content: '';
  position: absolute;
}

.badge-mark::before {
  inset: 0.25rem 0.45rem auto auto;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #ef7fa8;
  transform: rotate(35deg);
  box-shadow: -0.45rem 0.5rem 0 0 #f4c1cc;
}

.badge-mark::after {
  inset: auto auto 0.2rem 0.25rem;
  width: 0.9rem;
  height: 0.42rem;
  background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.2));
  border-radius: 999px;
  box-shadow: 0 -0.38rem 0 0 #fff;
  transform: rotate(-32deg);
}

/* Panneau teal — layout interne */
.hero-visual {
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.visual-copy {
  position: relative;
  z-index: 1;
  margin-top: 2.8rem;
  text-align: center;
}

.visual-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 2.9vw, 3rem);
  line-height: 1.03;
  letter-spacing: -0.03em;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.visual-copy p {
  margin: 1rem 0 0;
  font-size: 1rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

/* Illustration imprimante + filament */
.visual-illustration {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  min-height: 21rem;
}

.visual-composition {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.2rem;
  transform: translateX(46px) translateY(-12px) rotate(-10deg);
  transform-origin: center bottom;
}

.visual-composition::before {
  content: '';
  position: absolute;
  inset: 10% 8% 0;
  background: radial-gradient(
    circle,
    rgba(46, 154, 171, 0.32) 0%,
    rgba(46, 154, 171, 0.18) 35%,
    rgba(46, 154, 171, 0.08) 55%,
    transparent 75%
  );
  filter: blur(26px);
  z-index: 0;
  pointer-events: none;
}

.visual-printer {
  width: min(100%, 170px);
  max-width: 170px;
  height: auto;
  display: block;
  filter: drop-shadow(0 28px 44px rgba(8, 59, 82, 0.26));
  position: relative;
  z-index: 1;
  transform: translateY(-22px);
}

.visual-main {
  width: min(100%, 250px);
  max-width: 280px;
  height: auto;
  display: block;
  filter: drop-shadow(0 28px 44px rgba(8, 59, 82, 0.26));
  position: relative;
  z-index: 1;
  margin-left: -1rem;
  transform: translateY(-6px);
}

/* Panneau blanc — hero card */
.hero-card {
  padding: 2rem 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}

.landing-kicker {
  color: #4f7886;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  margin: 0 0 1.25rem;
}

.hero-card h2 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  line-height: 1.05;
  color: #1b2f39;
  letter-spacing: -0.03em;
  font-weight: 800;
  text-align: center;
}

.landing-description {
  margin: 0 0 1.75rem;
  color: #4f6570;
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: center;
}

/* Feature cards 2×2 */
.landing-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 148px));
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.feature-card {
  background: #f9fefe;
  border: 1px solid #cfe4e5;
  border-radius: 0.85rem;
  padding: 0.85rem 0.6rem;
  text-align: center;
  box-shadow: 0 10px 20px rgba(29, 18, 43, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: default;
  min-height: 130px;
}

.feature-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 18px 30px rgba(29, 18, 43, 0.1);
  border-color: #2e9cab;
}

.feature-icon {
  width: 1.4rem;
  height: 1.4rem;
  color: #2e9cab;
  flex-shrink: 0;
}

.feature-title {
  font-size: 0.73rem;
  font-weight: 700;
  color: #173645;
}

.feature-text {
  font-size: 0.64rem;
  line-height: 1.3;
  color: #4a6670;
}

/* Boutons */
.landing-cta {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.btn {
  padding: 0.8rem 1.6rem;
  border-radius: 0.55rem;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  transition: filter 0.2s ease, transform 0.15s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(25, 108, 133, 0.28);
}

.btn-primary:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #1e7f97;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.btn-white {
  background: white;
  color: #1b2f39;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn-white:hover {
  transform: translateY(-2px);
}

/* Liens légaux */
.landing-legal {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  font-size: 0.73rem;
  color: #a0aec0;
}

.landing-legal a {
  color: #7a9099;
  text-decoration: none;
  transition: color 0.2s;
}

.landing-legal a:hover { color: #2e9cab; }
```

---

## Task 5 — CSS : Comment ça marche + Tarifs + Footer

**Fichier :** `src/views/Landing.vue` — **ajouter à la suite** :

- [ ] **Ajouter le CSS des sections restantes** :

```css
/* ─── Comment ça marche ─────────────────────────────────────────── */
.how-section {
  min-height: 54vh;
}

.how-visual {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.how-title {
  position: relative;
  z-index: 1;
  font-size: clamp(1.8rem, 2.5vw, 2.5rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  line-height: 1.1;
  text-align: center;
  margin: 0;
}

.steps {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.step-num {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: white;
  color: #2e9cab;
  font-size: 0.95rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.step-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.2rem;
}

.step-desc {
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.4;
  margin: 0;
}

.how-card {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.how-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.02em;
  margin: 0;
}

.how-card-desc {
  font-size: 0.85rem;
  color: #4f6570;
  line-height: 1.55;
  margin: 0;
}

/* UI preview widget */
.ui-preview {
  background: white;
  border-radius: 10px;
  border: 1px solid #e0eef0;
  padding: 0.85rem 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.ui-preview-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: #1b2f39;
  margin: 0 0 0.5rem;
}

.ui-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.65rem;
}

.ui-row:last-of-type { border-bottom: none; }

.ui-label { color: #8a9daa; }

.ui-val { color: #1b2f39; font-weight: 600; }

.ui-val--teal { color: #2e9cab; }

.ui-total {
  margin-top: 0.4rem;
  background: #e8f7f9;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  display: flex;
  justify-content: space-between;
  font-weight: 800;
  font-size: 0.72rem;
  color: #1b2f39;
}

.ui-total-val { color: #2e9cab; }

.how-cta { align-self: center; }

/* ─── Tarifs ─────────────────────────────────────────────────────── */
.pricing-section {
  min-height: 50vh;
}

.pricing-card {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.1rem;
  text-align: center;
}

.price-badge {
  background: #e8f7f9;
  border: 1px solid #b1e5e2;
  color: #2e9cab;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-block;
}

.price-amount {
  font-size: 3.2rem;
  font-weight: 800;
  color: #1b2f39;
  line-height: 1;
  letter-spacing: -0.03em;
}

.price-currency {
  font-size: 1.1rem;
  font-weight: 500;
  color: #6a8899;
}

.price-period {
  font-size: 0.72rem;
  color: #a0b4bc;
  margin: -0.5rem 0 0;
}

.price-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
  width: 100%;
  max-width: 280px;
}

.price-list li {
  font-size: 0.82rem;
  color: #4a6670;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.price-list li::before {
  content: '✓';
  color: #2e9cab;
  font-weight: 800;
  flex-shrink: 0;
}

/* Panneau teal tarifs */
.pricing-visual {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.pricing-headline {
  position: relative;
  z-index: 1;
  font-size: clamp(1.8rem, 2.5vw, 2.4rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  line-height: 1.1;
  margin: 0;
}

.pricing-pitch {
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
  margin: 0;
}

.pricing-cta {
  position: relative;
  z-index: 1;
}

/* ─── Footer ─────────────────────────────────────────────────────── */
.footer-section {
  min-height: 72px;
}

.footer-left {
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
}

.footer-right {
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
}

.footer-links a {
  font-size: 0.73rem;
  color: #7a9099;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover { color: #2e9cab; }

.footer-copy {
  font-size: 0.65rem;
  color: #a0b4bc;
  margin: 0;
}
```

---

## Task 6 — CSS : Responsive (mobile + tablette + desktop)

**Fichier :** `src/views/Landing.vue` — **ajouter à la suite** :

- [ ] **Ajouter les media queries** :

```css
/* ═══ Desktop ≥ 1025px ══════════════════════════════════════════ */
@media (min-width: 1025px) {
  .hero-section { min-height: 88vh; }
}

/* ═══ Tablette 769px–1024px ══════════════════════════════════════ */
@media (max-width: 1024px) and (min-width: 769px) {
  .landing-page { padding: 0.75rem; gap: 0.75rem; }

  .landing-section { grid-template-columns: 1fr; border-radius: 20px; }

  /* Tous les panels — arrondi plein sur tablette */
  .hero-section .panel-teal,
  .how-section .panel-teal,
  .footer-section .panel-teal,
  .pricing-section .panel-white { border-radius: 20px 20px 0 0; }

  .hero-section .panel-white,
  .how-section .panel-white,
  .footer-section .panel-white,
  .pricing-section .panel-teal  { border-radius: 0 0 20px 20px; }

  .hero-section { min-height: unset; }

  .hero-visual { min-height: 52vh; padding: 1.75rem 1.5rem 1.25rem; }

  .visual-copy { margin-top: 0; }

  .visual-copy h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); }

  .visual-illustration { min-height: 0; }

  .visual-composition { transform: translateX(20px) translateY(-4px) rotate(-8deg); }

  .visual-printer { width: min(100%, 160px); max-width: 160px; }
  .visual-main { width: min(100%, 240px); max-width: 240px; }

  .hero-card { padding: 2rem 2.25rem; justify-content: flex-start; }

  .hero-card h2 { font-size: clamp(1.4rem, 3.2vw, 1.85rem); }

  .landing-features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .feature-card { max-width: none; min-height: 110px; }

  .how-section { min-height: unset; }
  .how-visual { padding: 2rem 1.5rem; }
  .how-title { font-size: clamp(1.6rem, 3vw, 2.2rem); }
  .how-card { padding: 2rem 1.5rem; }

  .pricing-section { min-height: unset; }
  .pricing-card { padding: 2rem 1.5rem; }
  .pricing-visual { padding: 2rem 1.5rem; }

  .footer-section { min-height: unset; }
  .footer-left { padding: 1rem 1.5rem; }
  .footer-right { padding: 1rem 1.5rem; flex-direction: column; align-items: flex-start; }
}

/* ═══ Mobile ≤ 768px ═════════════════════════════════════════════ */
@media (max-width: 768px) {
  .landing-page {
    padding: 0.5rem;
    gap: 0.5rem;
    background-attachment: scroll;
  }

  .landing-section { grid-template-columns: 1fr; border-radius: 18px; }

  /* Panneaux — bordures mobiles */
  .hero-section .panel-teal,
  .how-section .panel-teal,
  .footer-section .panel-teal,
  .pricing-section .panel-white { border-radius: 18px 18px 0 0; }

  .hero-section .panel-white,
  .how-section .panel-white,
  .footer-section .panel-white,
  .pricing-section .panel-teal  { border-radius: 0 0 18px 18px; }

  /* Hero visual mobile */
  .hero-section { min-height: unset; }
  .hero-visual {
    min-height: calc(100dvh - 1.5rem);
    padding: 1.25rem 1.1rem 1rem;
    justify-content: space-between;
  }

  .visual-copy { margin-top: 0; }

  .visual-copy h1 { font-size: clamp(1.5rem, 7vw, 2rem); }

  .visual-copy p { font-size: 0.92rem; margin-top: 1.5rem; }

  .visual-illustration { min-height: 0; }

  .visual-composition { transform: translateX(6px) translateY(0) rotate(-5deg); gap: 0; }

  .visual-printer { width: min(100%, 150px); max-width: 150px; transform: translateY(-10px); }
  .visual-main { width: min(100%, 230px); max-width: 230px; margin-left: -0.5rem; transform: translateY(-5px); }

  /* Hero card mobile */
  .hero-card {
    min-height: calc(100dvh - 1.5rem);
    padding: 2rem 1.25rem;
    justify-content: flex-start;
  }

  .hero-card h2 { font-size: clamp(1.25rem, 5.5vw, 1.6rem); margin-top: 0.5rem; }

  /* Feature cards : horizontales sur mobile */
  .landing-features {
    grid-template-columns: 1fr;
    margin-bottom: 1.5rem;
  }

  .feature-card {
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: 0.9rem 1.1rem;
    min-height: unset;
    max-width: none;
    gap: 0.9rem;
    grid-template-columns: 2.6rem 1fr;
  }

  .feature-icon {
    width: 2.4rem;
    height: 2.4rem;
    padding: 0.5rem;
    background: rgba(46, 154, 171, 0.12);
    border-radius: 0.65rem;
    flex-shrink: 0;
  }

  .landing-cta { flex-direction: row; gap: 0.65rem; }

  .btn { flex: 1; text-align: center; padding: 0.85rem 0.5rem; font-size: 0.88rem; }

  /* How section mobile */
  .how-section { min-height: unset; }
  .how-visual { padding: 2rem 1.1rem 1.5rem; gap: 1.5rem; }
  .how-title { font-size: clamp(1.4rem, 6vw, 1.9rem); }
  .how-card { padding: 2rem 1.25rem; gap: 1rem; }

  /* Pricing mobile */
  .pricing-section { min-height: unset; }
  .pricing-card { padding: 2rem 1.25rem; }
  .pricing-visual { padding: 2rem 1.25rem; }
  .price-amount { font-size: 2.6rem; }
  .price-list { max-width: none; }

  /* Footer mobile */
  .footer-left { padding: 1rem 1.25rem; }
  .footer-right {
    padding: 1rem 1.25rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .footer-links { justify-content: center; }
}

/* ═══ Mini-mobile ≤ 420px ════════════════════════════════════════ */
@media (max-width: 420px) {
  .landing-page { padding: 0.25rem; gap: 0.4rem; }
  .hero-visual { padding: 0.9rem 0.85rem 0.65rem; }
  .hero-card { padding: 1.75rem 1rem; }
}
```

---

## Task 7 — Vérification visuelle dans le navigateur

- [ ] **Lancer le dev server** (si pas déjà actif) :
  ```bash
  npm run dev
  ```

- [ ] **Vérifier desktop** à `http://localhost:5173/` — à vérifier :
  - [ ] Fond SVG `hero-vagues.svg` visible entre les sections (effet fixed)
  - [ ] Section Hero : badge BambuCalc visible en haut à gauche du panneau teal
  - [ ] Images imprimante + filament en composition rotée
  - [ ] Feature cards 2×2 dans le panneau blanc
  - [ ] Boutons "Créer un compte" (teal gradient) + "Se connecter" (blanc)
  - [ ] Section "Comment ça marche" : 3 étapes avec cercles blancs numérotés
  - [ ] Section Tarifs : carte 0€ + panneau teal accroche
  - [ ] Footer : badge + liens légaux

- [ ] **Vérifier mobile** : DevTools → viewport 390×844
  - [ ] Hero teal prend `min-height: calc(100dvh - 1.5rem)`
  - [ ] Feature cards en layout horizontal (icône gauche + texte droite)
  - [ ] Page scroll correctement entre les sections

- [ ] **Vérifier tablette** : DevTools → viewport 900×700
  - [ ] Sections empilées en 1 colonne

---

## Task 8 — Lancer les tests e2e

- [ ] **Lancer les tests Playwright** (dev server doit tourner) :
  ```bash
  npm run test:e2e -- --project=chromium
  ```

  Résultat attendu : tous les tests `PASS` ✓

- [ ] Si un test échoue, corriger le sélecteur ou le texte correspondant dans `Landing.vue` puis relancer.

---

## Task 9 — Générer la maquette Figma

> Cette task nécessite le skill `figma:figma-generate-design` + `figma:figma-use`. Le compte Figma est déjà connecté via MCP.

- [ ] **Invoquer le skill `figma:figma-generate-design`** en précisant :
  - Source : `src/views/Landing.vue` (code complet)
  - Frames à créer : Desktop 1440×900 + Mobile 390×844
  - Composants : Badge BambuCalc, Feature Card, Step, Pricing Card, Footer
  - Styles Figma : tokens couleur + typographie Inter identiques aux variables.css

---

## Task 10 — Commit

- [ ] **Vérifier les fichiers modifiés** :
  ```bash
  git status
  git diff src/views/Landing.vue
  ```

- [ ] **Committer** :
  ```bash
  git add src/views/Landing.vue e2e/vue.spec.js
  git commit -m "feat(landing): nouvelle landing multi-sections — glassmorphism, 3 sections, responsive"
  ```

---

## Self-Review

**Couverture spec :**
- [x] Remplace `src/views/Landing.vue` intégralement — Task 2-6
- [x] Route `/` + meta inchangés — aucune modification router
- [x] Design tokens exacts (rgba teal, blur, badge-mark CSS) — Task 3-5
- [x] Images webp réelles (`bambu lab P2S Combo.webp` + `bambuLab Filament.webp`) — Task 2
- [x] Lucide icons (`BarChart3`, `DollarSign`, `Zap`, `Download`) — Task 2
- [x] 3 sections (Hero · Comment ça marche · Tarifs) + Footer — Task 2
- [x] CTAs `/signup`, `/login`, `/calculator/1` — Task 2
- [x] Liens légaux footer — Task 2
- [x] Responsive mobile/tablette/desktop — Task 6
- [x] GlobalNav cachée sur landing (déjà configuré) — pas de modification
- [x] Figma — Task 9
- [x] Aucune nouvelle dépendance — confirmé

**Placeholders :** aucun ✓

**Cohérence des noms :**
- `.panel-teal` / `.panel-white` utilisés uniformément dans template et CSS ✓
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-white` cohérents dans template et CSS ✓
- `.landing-cta` utilisé dans Hero et Pricing (partagé) ✓
- `.visual-badge` / `.badge-mark` — même classe dans Hero et Footer ✓
