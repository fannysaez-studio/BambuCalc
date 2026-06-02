# Dashboard Client — Onglets + Profil Inline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une navigation par onglets pills (Mes devis · Mes rendez-vous · Mon profil) au dashboard client, intégrer le profil inline (Identité + Sécurité), et ajouter les icônes manquantes dans les panel-title admin.

**Architecture:** `Dashboard.vue` reçoit un `activeTab` ref qui contrôle l'affichage via `v-show`. Les stats passent dans l'onglet "Mes devis". La logique profil (fields, saveProfile, savePassword) est ajoutée directement dans Dashboard.vue. Les composants admin reçoivent chacun leur icône dans le `<h2 class="panel-title">`.

**Tech Stack:** Vue 3 (script setup), Supabase auth, lucide-vue-next, PasswordField component existant

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `src/views/dashboard/Dashboard.vue` | Modifier — tab bar, réorganisation contenu, profil inline |
| `src/components/admin/ClientsTab.vue` | Modifier — icône `Users` dans panel-title |
| `src/components/admin/QuotesTab.vue` | Modifier — icône `FileText` dans panel-title |
| `src/components/admin/GestionDevisTab.vue` | Modifier — icône dynamique dans panel-title |
| `src/components/admin/ArchivesTab.vue` | Modifier — icône `Archive` dans panel-title |
| `src/components/admin/RdvTab.vue` | Modifier — icône `CalendarDays` dans panel-title |
| `src/components/admin/StatsTab.vue` | Modifier — icône `TrendingUp` dans panel-title |
| `src/components/admin/SettingsTab.vue` | Modifier — icône `SlidersHorizontal` dans panel-title |

---

## Task 1 : Icônes panel-title admin (7 composants)

**Files:**
- Modify: `src/components/admin/ClientsTab.vue`
- Modify: `src/components/admin/QuotesTab.vue`
- Modify: `src/components/admin/GestionDevisTab.vue`
- Modify: `src/components/admin/ArchivesTab.vue`
- Modify: `src/components/admin/RdvTab.vue`
- Modify: `src/components/admin/StatsTab.vue`
- Modify: `src/components/admin/SettingsTab.vue`

- [ ] **Step 1.1 — ClientsTab.vue : ajouter l'import et l'icône**

Dans `src/components/admin/ClientsTab.vue`, l'import lucide est absent. Ajouter :

```js
// Dans <script setup>, ajouter l'import (il n'y en a pas encore) :
import { Users } from 'lucide-vue-next'
```

Remplacer le panel-title :
```html
<!-- AVANT -->
<h2 class="panel-title">Clients</h2>

<!-- APRÈS -->
<h2 class="panel-title"><Users class="ptitle-icon" /> Clients</h2>
```

Ajouter dans `<style scoped>` (après `.panel-title { ... }`) :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.2 — QuotesTab.vue : ajouter l'icône FileText**

`QuotesTab.vue` importe déjà lucide. Vérifier que `FileText` est dans l'import, sinon l'ajouter.

Remplacer dans le panel-title (attention : le titre a un `<span v-if="filterUserId">` après) :
```html
<!-- AVANT -->
<h2 class="panel-title">
  Tous les devis
  <span v-if="filterUserId" class="filter-active-badge">…</span>
</h2>

<!-- APRÈS -->
<h2 class="panel-title">
  <FileText class="ptitle-icon" />
  Tous les devis
  <span v-if="filterUserId" class="filter-active-badge">…</span>
</h2>
```

Ajouter `.ptitle-icon` dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.3 — GestionDevisTab.vue : icône dynamique**

Le titre alterne entre "Devis sauvegardés" et "Transmettre un devis". Ajouter `FileText` et `Send` à l'import lucide existant.

```html
<!-- AVANT -->
<h2 class="panel-title">
  {{ managePage === 1 ? 'Devis sauvegardés' : 'Transmettre un devis' }}
</h2>

<!-- APRÈS -->
<h2 class="panel-title">
  <component :is="managePage === 1 ? FileText : Send" class="ptitle-icon" />
  {{ managePage === 1 ? 'Devis sauvegardés' : 'Transmettre un devis' }}
</h2>
```

Ajouter dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.4 — ArchivesTab.vue : icône Archive**

Ajouter `Archive` à l'import lucide existant si absent.

```html
<!-- AVANT -->
<h2 class="panel-title">Archives</h2>

<!-- APRÈS -->
<h2 class="panel-title"><Archive class="ptitle-icon" /> Archives</h2>
```

CSS dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.5 — RdvTab.vue : icône CalendarDays**

`RdvTab.vue` n'importe pas lucide directement pour le panel-title. Ajouter `CalendarDays` à l'import existant.

```html
<!-- AVANT -->
<h2 class="panel-title">Rendez-vous</h2>

<!-- APRÈS -->
<h2 class="panel-title"><CalendarDays class="ptitle-icon" /> Rendez-vous</h2>
```

CSS dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.6 — StatsTab.vue : icône TrendingUp**

Ajouter `TrendingUp` à l'import lucide existant si absent.

```html
<!-- AVANT -->
<h2 class="panel-title">Statistiques & Business</h2>

<!-- APRÈS -->
<h2 class="panel-title"><TrendingUp class="ptitle-icon" /> Statistiques & Business</h2>
```

CSS dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.7 — SettingsTab.vue : icône SlidersHorizontal**

Ajouter `SlidersHorizontal` à l'import lucide existant si absent.

```html
<!-- AVANT -->
<h2 class="panel-title">Paramètres de calcul</h2>

<!-- APRÈS -->
<h2 class="panel-title"><SlidersHorizontal class="ptitle-icon" /> Paramètres de calcul</h2>
```

CSS dans `<style scoped>` :
```css
.ptitle-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 1.8 — Build + commit**

```bash
npx vite build 2>&1 | tail -5
git add src/components/admin/
git commit -m "feat(admin): icônes panel-title dans tous les onglets admin"
```

---

## Task 2 : Tab bar client — état + UI + CSS

**Files:**
- Modify: `src/views/dashboard/Dashboard.vue`

- [ ] **Step 2.1 — Ajouter l'état activeTab et les imports**

Dans `<script setup>`, après `const rdvFilter = ref('upcoming')` (ligne ~344), ajouter :

```js
const activeTab = ref('quotes') // 'quotes' | 'rdv' | 'profile'
```

Ajouter à l'import lucide existant : `Shield`, `LogOut`, `Save`  
*(ils seront utilisés en Task 4 pour le profil inline)*

Ajouter l'import du composant PasswordField :
```js
import PasswordField from '@/components/ui/PasswordField.vue'
```

- [ ] **Step 2.2 — Insérer le tab bar dans le template**

Dans le template, juste après la fermeture de `<!-- Formulaire de liaison -->` (`</div>`) et avant `<!-- Hero bar -->`, insérer :

```html
<!-- Tab bar -->
<div class="client-tabs" v-if="!isAnonymous">
  <button
    :class="['ctab-btn', activeTab === 'quotes' && 'ctab-btn--active']"
    @click="activeTab = 'quotes'"
  >
    <FileText class="ctab-icon" />
    Mes devis
    <span v-if="quotes.length > 0" class="ctab-count">{{ quotes.length }}</span>
  </button>
  <button
    :class="['ctab-btn', activeTab === 'rdv' && 'ctab-btn--active']"
    @click="activeTab = 'rdv'"
  >
    <Calendar class="ctab-icon" />
    Mes rendez-vous
    <span
      v-if="rdvTabs.find(t => t.id === 'upcoming')?.count > 0"
      class="ctab-count"
    >{{ rdvTabs.find(t => t.id === 'upcoming')?.count }}</span>
  </button>
  <button
    :class="['ctab-btn', activeTab === 'profile' && 'ctab-btn--active']"
    @click="activeTab = 'profile'"
  >
    <User class="ctab-icon" />
    Mon profil
  </button>
</div>
```

- [ ] **Step 2.3 — CSS du tab bar**

Dans `<style scoped>`, ajouter avant le commentaire `/* ── Hero ── */` :

```css
/* ── Tab bar client ── */
.client-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.ctab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #718096;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.ctab-btn:hover { border-color: #2e9cab; color: #2e9cab; }
.ctab-btn--active {
  border-color: #2e9cab;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 3px 10px rgba(46,156,171,0.25);
}

.ctab-icon { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }

.ctab-count {
  background: rgba(255,255,255,0.25);
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.05rem 0.38rem;
  line-height: 1.5;
}
.ctab-btn:not(.ctab-btn--active) .ctab-count {
  background: #e8f7f9;
  color: #2e9cab;
}

@media (max-width: 640px) {
  .client-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    padding-bottom: 0.2rem;
    margin-bottom: 1rem;
  }
  .client-tabs::-webkit-scrollbar { display: none; }
  .ctab-btn { white-space: nowrap; flex-shrink: 0; font-size: 0.75rem; padding: 0.38rem 0.85rem; }
}
```

- [ ] **Step 2.4 — Build vérification**

```bash
npx vite build 2>&1 | tail -5
# Attendu : ✓ built in X.XXs
```

---

## Task 3 : Réorganiser le contenu sous les onglets

**Files:**
- Modify: `src/views/dashboard/Dashboard.vue`

Dans cette tâche on enveloppe chaque section dans un `v-show` selon l'onglet actif. Pas de déplacement de code, juste des wrappers.

- [ ] **Step 3.1 — Envelopper le bloc stats + devis + archives**

Dans le template, repérer le bloc `<!-- Stats -->` jusqu'à la fin du bloc `<!-- ── Section Archives ── -->`. Entourer tout ce bloc :

```html
<!-- Onglet Mes devis -->
<template v-show="activeTab === 'quotes'">

  <!-- Bannière invité (garde sa place originale, ne pas déplacer) -->
  <!-- Stats -->
  <!-- Liste des devis -->
  <!-- Section Archives -->

</template>
```

*Note : la bannière invité et le formulaire de liaison restent EN DEHORS de ce wrapper (au-dessus du tab bar), ils s'affichent toujours.*

- [ ] **Step 3.2 — Ajouter l'icône FileText au titre "Mes devis"**

Dans `.quotes-header` :
```html
<!-- AVANT -->
<h2 class="quotes-title">Mes devis</h2>

<!-- APRÈS -->
<h2 class="quotes-title"><FileText class="qh-icon" /> Mes devis</h2>
```

CSS dans `<style scoped>` :
```css
.qh-icon { width: 0.9rem; height: 0.9rem; color: #2e9cab; flex-shrink: 0; }
```

- [ ] **Step 3.3 — Envelopper la section Mes rendez-vous**

La section `<!-- ── Section Mes rendez-vous ── -->` existe déjà. Remplacer sa condition `v-if="!isAnonymous"` :

```html
<!-- AVANT -->
<div v-if="!isAnonymous" class="rdv-section-card">

<!-- APRÈS -->
<div v-if="!isAnonymous && activeTab === 'rdv'" class="rdv-section-card">
```

*(Utiliser `v-if` plutôt que `v-show` ici pour ne pas charger les RDV si non connecté ou mauvais onglet.)*

- [ ] **Step 3.4 — Build + commit**

```bash
npx vite build 2>&1 | tail -5
git add src/views/dashboard/Dashboard.vue
git commit -m "feat(dashboard): tab bar client — Mes devis et Mes rendez-vous"
```

---

## Task 4 : Onglet "Mon profil" inline

**Files:**
- Modify: `src/views/dashboard/Dashboard.vue`

- [ ] **Step 4.1 — Ajouter l'état profil dans script setup**

Après les refs RDV existantes, ajouter :

```js
// ── Profil inline ──
const firstName   = ref('')
const lastName    = ref('')
const phone       = ref('')
const company     = ref('')
const memberSince = ref('')
const saving      = ref(false)
const savingPwd   = ref(false)
const newPassword = ref('')
const confirmPwd  = ref('')
const pwdError    = ref(null)
```

- [ ] **Step 4.2 — Remplir le profil lors de l'init**

Dans le bloc `(async () => { ... })()`, après `displayName.value = ...`, ajouter :

```js
const meta = user.user_metadata || {}
const full = meta.full_name || meta.name || ''
const parts = full.split(' ')
firstName.value = meta.first_name || parts[0] || ''
lastName.value  = meta.last_name  || parts.slice(1).join(' ') || ''
phone.value     = meta.phone    || ''
company.value   = meta.company  || ''
memberSince.value = user.created_at
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      .format(new Date(user.created_at))
  : '—'
```

- [ ] **Step 4.3 — Ajouter les fonctions saveProfile et savePassword**

Après `async function linkAccount() { ... }`, ajouter :

```js
async function saveProfile() {
  saving.value = true
  const fn   = firstName.value.trim()
  const ln   = lastName.value.trim()
  const full = [fn, ln].filter(Boolean).join(' ')
  const { error } = await supabase.auth.updateUser({
    data: { full_name: full, first_name: fn, last_name: ln, phone: phone.value.trim(), company: company.value.trim() },
  })
  if (!error) {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.from('profiles').update({ full_name: full }).eq('id', data.user.id)
    }
  }
  saving.value = false
  toast.value?.show(error ? 'Erreur lors de la sauvegarde.' : 'Profil mis à jour !', error ? 'error' : 'success')
}

async function savePassword() {
  pwdError.value = null
  if (newPassword.value.length < 8) {
    pwdError.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (newPassword.value !== confirmPwd.value) {
    pwdError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  savingPwd.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  savingPwd.value = false
  if (error) {
    pwdError.value = error.message || 'Erreur lors du changement.'
  } else {
    newPassword.value = ''
    confirmPwd.value  = ''
    toast.value?.show('Mot de passe modifié !', 'success')
  }
}

async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

- [ ] **Step 4.4 — Ajouter la section profil dans le template**

Après le bloc `<!-- ── Section Mes rendez-vous ── -->` (et avant `<Teleport to="body">` modal archivage), ajouter :

```html
<!-- ── Onglet Mon profil ── -->
<div v-if="!isAnonymous && activeTab === 'profile'" class="profile-inline">

  <!-- Info barre -->
  <div class="pi-infobar">
    <div class="pi-meta-row">
      <span class="pi-meta-label">Email</span>
      <span class="pi-meta-val">{{ userEmail || '—' }}</span>
    </div>
    <div class="pi-meta-row">
      <span class="pi-meta-label">Membre depuis</span>
      <span class="pi-meta-val">{{ memberSince }}</span>
    </div>
  </div>

  <div class="pi-cols">

    <!-- Colonne Identité -->
    <div class="pi-col">
      <p class="pi-col-title">Identité</p>
      <div class="pi-field">
        <label class="pi-label">Prénom</label>
        <input class="pi-input" v-model="firstName" placeholder="Jean" />
      </div>
      <div class="pi-field">
        <label class="pi-label">Nom</label>
        <input class="pi-input" v-model="lastName" placeholder="Dupont" />
      </div>
      <div class="pi-field">
        <label class="pi-label">Téléphone</label>
        <input class="pi-input" type="tel" v-model="phone" placeholder="+33 6 00 00 00 00" />
      </div>
      <div class="pi-field">
        <label class="pi-label">Entreprise</label>
        <input class="pi-input" v-model="company" placeholder="Mon Entreprise SAS" />
      </div>
      <button class="pi-btn-save" @click="saveProfile" :disabled="saving">
        <Save class="pi-btn-icon" />
        {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
      </button>
    </div>

    <!-- Colonne Sécurité -->
    <div class="pi-col">
      <p class="pi-col-title"><Shield class="pi-col-icon" /> Sécurité</p>
      <PasswordField id="dash-new-pwd"     label="Nouveau mot de passe" :show-strength="true" v-model="newPassword" />
      <PasswordField id="dash-confirm-pwd" label="Confirmer le mot de passe" v-model="confirmPwd" />
      <p v-if="pwdError" class="pi-error">{{ pwdError }}</p>
      <button class="pi-btn-outline" @click="savePassword" :disabled="savingPwd">
        {{ savingPwd ? 'Enregistrement…' : 'Changer le mot de passe' }}
      </button>
      <button class="pi-btn-logout" @click="logout">
        <LogOut class="pi-btn-icon" /> Se déconnecter
      </button>
    </div>

  </div>
</div>
```

- [ ] **Step 4.5 — CSS du profil inline**

Dans `<style scoped>`, ajouter avant `/* Tablette : padding bas pour la nav island */` :

```css
/* ── Profil inline ── */
.profile-inline {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-top: 0;
}

.pi-infobar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f0f4f8;
  background: #f7f9fc;
}
.pi-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 1.25rem;
  flex: 1;
  border-right: 1px solid #f0f4f8;
}
.pi-meta-row:last-child { border-right: none; }
.pi-meta-label { font-size: 0.7rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }
.pi-meta-val   { font-size: 0.78rem; font-weight: 600; color: #2d3748; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }

.pi-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.pi-col {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem;
  border-right: 1px solid #f0f4f8;
}
.pi-col:last-child { border-right: none; }

.pi-col-title {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #a0aec0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.pi-col-icon { width: 0.75rem; height: 0.75rem; }

.pi-field { display: flex; flex-direction: column; gap: 0.25rem; }
.pi-label { font-size: 0.72rem; font-weight: 700; color: #4a5568; }
.pi-input {
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: #1b2f39;
  font-family: inherit;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}
.pi-input:focus { border-color: #2e9cab; box-shadow: 0 0 0 3px rgba(46,154,171,0.12); }

.pi-error {
  font-size: 0.8rem; color: #c0392b;
  background: rgba(220,53,69,0.07);
  border: 1px solid rgba(220,53,69,0.2);
  border-radius: 8px; padding: 0.5rem 0.75rem; margin: 0;
}

.pi-btn-save {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  transition: filter 0.2s; align-self: flex-start;
}
.pi-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
.pi-btn-save:hover:not(:disabled) { filter: brightness(1.07); }

.pi-btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.55rem 1.1rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.2s;
}
.pi-btn-outline:hover:not(:disabled) { background: #e8f7f9; }
.pi-btn-outline:disabled { opacity: 0.65; cursor: not-allowed; }

.pi-btn-logout {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: transparent; color: #718096; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.pi-btn-logout:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }

.pi-btn-icon { width: 0.85rem; height: 0.85rem; }

@media (max-width: 640px) {
  .pi-infobar { flex-direction: column; }
  .pi-meta-row { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .pi-meta-row:last-child { border-bottom: none; }
  .pi-cols { grid-template-columns: 1fr; }
  .pi-col { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .pi-col:last-child { border-bottom: none; }
  .pi-btn-save, .pi-btn-outline, .pi-btn-logout {
    width: 100%; justify-content: center; align-self: stretch;
  }
}
```

- [ ] **Step 4.6 — Build + commit**

```bash
npx vite build 2>&1 | tail -5
# Attendu : ✓ built in X.XXs (aucune erreur)

git add src/views/dashboard/Dashboard.vue
git commit -m "feat(dashboard): onglet Mon profil inline — identité + sécurité"
```

---

## Task 5 : Test e2e Playwright — navigation onglets

**Files:**
- Modify: `e2e/mobile.spec.js` ou créer `e2e/dashboard-tabs.spec.js`

- [ ] **Step 5.1 — Créer le fichier de test**

```js
// e2e/dashboard-tabs.spec.js
import { test, expect } from '@playwright/test'

const LOGIN_EMAIL = 'fanny.saez.0486@gmail.com'
const LOGIN_PWD   = process.env.TEST_PASSWORD ?? 'changeme'

test.describe('Dashboard client — onglets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', LOGIN_EMAIL)
    await page.fill('input[type="password"]', LOGIN_PWD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('onglet Mes devis actif par défaut', async ({ page }) => {
    const tab = page.locator('.ctab-btn--active')
    await expect(tab).toContainText('Mes devis')
    await expect(page.locator('.quotes-card')).toBeVisible()
    await expect(page.locator('.stats-row')).toBeVisible()
  })

  test('onglet Mes rendez-vous affiche la section RDV', async ({ page }) => {
    await page.click('.ctab-btn:has-text("Mes rendez-vous")')
    await expect(page.locator('.rdv-section-card')).toBeVisible()
    await expect(page.locator('.quotes-card')).not.toBeVisible()
  })

  test('onglet Mon profil affiche identité et sécurité', async ({ page }) => {
    await page.click('.ctab-btn:has-text("Mon profil")')
    await expect(page.locator('.profile-inline')).toBeVisible()
    await expect(page.locator('.pi-col-title').first()).toContainText('Identité')
    await expect(page.locator('.pi-col-title').last()).toContainText('Sécurité')
    await expect(page.locator('.quotes-card')).not.toBeVisible()
  })

  test('stats visibles uniquement dans Mes devis', async ({ page }) => {
    await expect(page.locator('.stats-row')).toBeVisible()
    await page.click('.ctab-btn:has-text("Mon profil")')
    await expect(page.locator('.stats-row')).not.toBeVisible()
  })
})
```

- [ ] **Step 5.2 — Lancer les tests**

```bash
npx playwright test e2e/dashboard-tabs.spec.js --headed 2>&1 | tail -20
# Attendu : 4 passed
```

*Si les tests échouent à cause d'une authentification manquante, vérifier que `TEST_PASSWORD` est défini ou ajuster les credentials.*

- [ ] **Step 5.3 — Commit final**

```bash
git add e2e/dashboard-tabs.spec.js
git commit -m "test(e2e): navigation onglets dashboard client"
git push origin main
```

---

## Self-Review

**Spec coverage :**
- ✅ Tab bar pills + icônes (Task 2)
- ✅ Stats dans "Mes devis" uniquement (Task 3)
- ✅ "Mes rendez-vous" sous onglet (Task 3)
- ✅ Profil inline Identité + Sécurité sans devis (Task 4)
- ✅ Icônes panel-title admin × 7 (Task 1)
- ✅ Icône "Mes devis" dans quotes-header (Task 3, Step 3.2)
- ✅ Mobile scroll tab bar (Task 2, Step 2.3)

**Placeholders :** aucun.

**Cohérence types/noms :**
- `activeTab` défini Step 2.1, utilisé Steps 3.1, 3.3, 4.4 ✅
- `saving` / `savingPwd` définis Step 4.1, utilisés Step 4.4 ✅
- `saveProfile` / `savePassword` / `logout` définis Step 4.3, utilisés Step 4.4 ✅
- Classes CSS `.profile-inline`, `.pi-col`, `.pi-input` définies Step 4.5, référencées Step 5.1 ✅
- `userEmail` déjà défini dans le code existant (session RDV) ✅
