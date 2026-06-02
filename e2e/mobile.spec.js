import { test, expect } from '@playwright/test'

// Viewport Pixel 5 — appliqué uniquement à ce fichier, sans modifier playwright.config.js
test.use({
  viewport: { width: 393, height: 851 },
  isMobile: true,
  hasTouch: true,
})

async function skipCookieBanner(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'essential')
  })
}

// ── Accueil ───────────────────────────────────────────────────────────────────

test.describe('Mobile — Accueil (/)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/')
  })

  test('le body n\'est pas vide', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('les CTA principaux sont visibles', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Créer un compte' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible()
  })
})

// ── Connexion ─────────────────────────────────────────────────────────────────

test.describe('Mobile — Connexion (/login)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/login')
  })

  test('affiche les champs email et mot de passe', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  test('bouton connexion visible et non tronqué', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Se connecter', exact: true })
    await expect(btn).toBeVisible()
    const box = await btn.boundingBox()
    expect(box.width).toBeGreaterThan(80)
  })
})

// ── Inscription ───────────────────────────────────────────────────────────────

test.describe('Mobile — Inscription (/signup)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/signup')
  })

  test('affiche les champs email et mot de passe', async ({ page }) => {
    await expect(page.locator('#signup-email')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
  })

  test('bouton création de compte visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Créer un compte', exact: true })).toBeVisible()
  })
})

// ── Contact ───────────────────────────────────────────────────────────────────

test.describe('Mobile — Contact (/contact)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/contact')
  })

  test('affiche le formulaire de contact', async ({ page }) => {
    await expect(page.locator('#c-name')).toBeVisible()
    await expect(page.locator('#c-email')).toBeVisible()
    await expect(page.locator('#c-message')).toBeVisible()
  })

  test('bouton envoi visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Envoyer le message/ })).toBeVisible()
  })
})

// ── Calculateur ───────────────────────────────────────────────────────────────

test.describe('Mobile — Calculateur (/calculator/1)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/calculator/1')
  })

  test('la page charge sans erreur blanche', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('au moins un élément interactif est visible', async ({ page }) => {
    const el = page.locator('input, button, select').first()
    await expect(el).toBeVisible()
  })
})
