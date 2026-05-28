import { test, expect } from '@playwright/test'

// Bypass le bandeau cookie pour tous les tests de navigation (clé lue dans CookieBanner.vue)
async function skipCookieBanner(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'essential')
  })
}

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('affiche le titre principal', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Calculez vos impressions 3D sans friction')
  })

  test('affiche le badge BambuCalc', async ({ page }) => {
    await expect(page.getByText('BambuCalc').first()).toBeVisible()
  })

  test('affiche les 4 fonctionnalités', async ({ page }) => {
    await expect(page.getByText('Calcul précis')).toBeVisible()
    await expect(page.getByText('Tarification flexible')).toBeVisible()
    await expect(page.getByText('Séries maîtrisées')).toBeVisible()
    await expect(page.getByText('Devis exportables')).toBeVisible()
  })

  test('boutons CTA visibles avec les bons liens', async ({ page }) => {
    const btnSignup = page.getByRole('link', { name: 'Créer un compte' })
    const btnLogin  = page.getByRole('link', { name: 'Se connecter' })

    await expect(btnSignup).toBeVisible()
    await expect(btnLogin).toBeVisible()
    await expect(btnSignup).toHaveAttribute('href', '/signup')
    await expect(btnLogin).toHaveAttribute('href', '/login')
  })

  test('liens légaux présents', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Mentions légales' })).toBeVisible()
    // exact: true pour ne pas confondre avec le lien identique dans le bandeau cookie
    await expect(page.getByRole('link', { name: 'Politique de confidentialité', exact: true })).toBeVisible()
  })

  test('navigation vers la page inscription', async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/')
    await page.getByRole('link', { name: 'Créer un compte' }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('navigation vers la page connexion', async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/')
    await page.getByRole('link', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL('/login')
  })
})
