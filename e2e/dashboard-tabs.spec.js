import { test, expect } from '@playwright/test'

// Ces tests nécessitent un compte existant en base.
// Passer TEST_EMAIL et TEST_PASSWORD en variables d'env pour les exécuter.
const EMAIL = process.env.TEST_EMAIL    ?? 'fanny.saez.0486@gmail.com'
const PWD   = process.env.TEST_PASSWORD ?? ''

test.describe('Dashboard client — navigation onglets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PWD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })
  })

  test('onglet Mes devis actif par défaut', async ({ page }) => {
    const activeTab = page.locator('.ctab-btn--active')
    await expect(activeTab).toContainText('Mes devis')
    await expect(page.locator('.quotes-card')).toBeVisible()
    await expect(page.locator('.stats-row')).toBeVisible()
  })

  test('onglet Mes rendez-vous affiche section RDV, masque devis', async ({ page }) => {
    await page.click('.ctab-btn:has-text("Mes rendez-vous")')
    await expect(page.locator('.rdv-section-card')).toBeVisible()
    await expect(page.locator('.quotes-card')).not.toBeVisible()
    await expect(page.locator('.stats-row')).not.toBeVisible()
  })

  test('onglet Mon profil affiche identité et sécurité', async ({ page }) => {
    await page.click('.ctab-btn:has-text("Mon profil")')
    await expect(page.locator('.profile-inline')).toBeVisible()
    await expect(page.locator('.pi-col-title').first()).toContainText('Identité')
    await expect(page.locator('.pi-col-title').last()).toContainText('Sécurité')
    await expect(page.locator('.quotes-card')).not.toBeVisible()
    await expect(page.locator('.stats-row')).not.toBeVisible()
  })

  test('retour sur Mes devis depuis Mon profil restaure les stats', async ({ page }) => {
    await page.click('.ctab-btn:has-text("Mon profil")')
    await expect(page.locator('.stats-row')).not.toBeVisible()
    await page.click('.ctab-btn:has-text("Mes devis")')
    await expect(page.locator('.stats-row')).toBeVisible()
    await expect(page.locator('.quotes-card')).toBeVisible()
  })
})
