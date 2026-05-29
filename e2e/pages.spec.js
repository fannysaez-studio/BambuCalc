import { test, expect } from '@playwright/test'

async function skipCookieBanner(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'essential')
  })
}

// ── Login ─────────────────────────────────────────────────────────────────────

test.describe('Page Connexion (/login)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/login')
  })

  test('affiche le titre "Connexion"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
  })

  test('affiche les champs email et mot de passe', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  test('affiche le bouton de connexion', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeVisible()
  })

  test('lien "Mot de passe oublié ?" visible', async ({ page }) => {
    await expect(page.getByText(/[Mm]ot de passe oublié/)).toBeVisible()
  })

  test('lien vers la page d\'accueil présent', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /[Pp]age d.accueil/ })
    await expect(homeLink).toBeVisible()
  })

  test('navigation vers /signup via l\'icône d\'inscription', async ({ page }) => {
    await page.getByRole('link', { name: /[Ss].inscrire/ }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('mode invité redirige vers le calculateur', async ({ page }) => {
    await page.getByRole('button', { name: /[Mm]ode invité/ }).click()
    await expect(page).toHaveURL(/\/calculator/)
  })
})

// ── Signup ────────────────────────────────────────────────────────────────────

test.describe('Page Inscription (/signup)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/signup')
  })

  test('affiche le titre "Inscription"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible()
  })

  test('affiche les champs prénom, email et mot de passe', async ({ page }) => {
    await expect(page.locator('#signup-first-name')).toBeVisible()
    await expect(page.locator('#signup-email')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
  })

  test('affiche le bouton de création de compte', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Créer un compte', exact: true })).toBeVisible()
  })

  test('navigation vers /login via l\'icône de connexion', async ({ page }) => {
    await page.getByRole('link', { name: /[Ss]e connecter/ }).click()
    await expect(page).toHaveURL('/login')
  })
})

// ── Contact ───────────────────────────────────────────────────────────────────

test.describe('Page Contact (/contact)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/contact')
  })

  test('affiche le formulaire de contact par défaut', async ({ page }) => {
    await expect(page.locator('#c-name')).toBeVisible()
    await expect(page.locator('#c-email')).toBeVisible()
    await expect(page.locator('#c-message')).toBeVisible()
  })

  test('affiche la question captcha anti-robot', async ({ page }) => {
    await expect(page.getByText('Vérification anti-robot')).toBeVisible()
    // Équation du type "X + Y ="
    await expect(page.locator('.captcha-equation')).toBeVisible()
  })

  test('affiche le bouton "Envoyer le message"', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Envoyer le message/ })).toBeVisible()
  })

  test('mauvais code captcha affiche un message d\'erreur', async ({ page }) => {
    await page.locator('#c-name').fill('Jean Test')
    await page.locator('#c-email').fill('jean@test.fr')
    await page.locator('#c-message').fill('Message de test pour le formulaire.')
    // Entrer une réponse captcha délibérément fausse (0 est impossible : les deux chiffres sont ≥ 1)
    await page.locator('.captcha-input').fill('0')
    await page.getByRole('button', { name: /Envoyer le message/ }).click()
    await expect(page.locator('.form-error')).toContainText('Code de vérification incorrect')
  })

  test('onglet FAQ affiche les questions', async ({ page }) => {
    await page.getByTitle('FAQ').click()
    await expect(page.getByText('BambuCalc est-il gratuit ?')).toBeVisible()
  })

  test('onglet FAQ affiche au moins 4 entrées', async ({ page }) => {
    await page.getByTitle('FAQ').click()
    await expect(page.locator('.faq-item')).toHaveCount(5)
  })
})

// ── Pages légales ─────────────────────────────────────────────────────────────

test.describe('Page Politique de confidentialité (/privacy)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/privacy')
  })

  test('affiche le titre "Politique de confidentialité"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Politique de confidentialité' })).toBeVisible()
  })

  test('affiche une navigation de sections', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
  })
})

test.describe('Page Mentions légales (/mentions-legales)', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/mentions-legales')
  })

  test('affiche le titre "Mentions légales"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mentions légales' })).toBeVisible()
  })

  test('affiche une navigation de sections', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
  })
})

// ── 404 ───────────────────────────────────────────────────────────────────────

test.describe('Page 404', () => {
  test('une URL inconnue affiche la page 404', async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/cette-page-nexiste-pas')
    // La page 404 doit rester accessible (pas de redirect infini)
    await expect(page).toHaveURL('/cette-page-nexiste-pas')
    // Vérifie qu'il y a du contenu (pas une page blanche)
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
