import { test, expect } from '@playwright/test'

async function skipCookieBanner(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'essential')
  })
}

test.describe('Calculateur — structure et navigation', () => {
  test.beforeEach(async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/calculator/1')
  })

  // ── Redirection ────────────────────────────────────────────────────────────

  test('redirige /calculator vers /calculator/1', async ({ page }) => {
    await skipCookieBanner(page)
    await page.goto('/calculator')
    await expect(page).toHaveURL('/calculator/1')
  })

  // ── Étape 1 ────────────────────────────────────────────────────────────────

  test('affiche le stepper avec 4 étapes client', async ({ page }) => {
    const labels = page.locator('.step-label')
    await expect(labels).toHaveCount(4)
    await expect(labels.first()).toContainText('Projet')
  })

  test('affiche l\'indicateur "Étape 1 / 4"', async ({ page }) => {
    await expect(page.locator('.step-card-eyebrow')).toContainText('Étape 1')
  })

  test('affiche le titre "Projet & Matière"', async ({ page }) => {
    await expect(page.locator('.step-card-title')).toContainText('Projet')
  })

  test('affiche le texte "Type de projet"', async ({ page }) => {
    await expect(page.getByText('Type de projet', { exact: true })).toBeVisible()
  })

  test('affiche les boutons de couleurs (Mono, 2 coul., …)', async ({ page }) => {
    await expect(page.getByText('Mono')).toBeVisible()
    await expect(page.getByText('2 coul.')).toBeVisible()
  })

  test('affiche le bouton "Suivant →"', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Suivant →' })).toBeVisible()
  })

  test('cliquer "Suivant →" depuis l\'étape 1 navigue vers l\'étape 2', async ({ page }) => {
    // costPerKg est initialisé à 16.99 — la validation passe sans sélection manuelle
    await page.getByRole('button', { name: 'Suivant →' }).click()
    await expect(page).toHaveURL('/calculator/2')
  })

  // ── Étape 2 ────────────────────────────────────────────────────────────────

  test('étape 2 — affiche les boutons de quantité', async ({ page }) => {
    await page.goto('/calculator/2')
    await expect(page.locator('.step-card-eyebrow')).toContainText('Étape 2')
    await expect(page.getByRole('button', { name: '1 — Unique' })).toBeVisible()
    await expect(page.getByRole('button', { name: '10', exact: true })).toBeVisible()
  })

  test('étape 2 — bouton "← Retour" ramène à l\'étape 1', async ({ page }) => {
    await page.goto('/calculator/2')
    await page.getByRole('button', { name: '← Retour' }).click()
    await expect(page).toHaveURL('/calculator/1')
  })

  test('étape 2 — sélectionner une quantité active le bouton', async ({ page }) => {
    await page.goto('/calculator/2')
    const btn10 = page.getByRole('button', { name: '10', exact: true })
    await btn10.click()
    await expect(btn10).toHaveClass(/qty-btn--active/)
  })

  test('étape 2 — cliquer "Suivant →" navigue vers l\'étape 3', async ({ page }) => {
    await page.goto('/calculator/2')
    await page.getByRole('button', { name: 'Suivant →' }).click()
    await expect(page).toHaveURL('/calculator/3')
  })

  // ── Étape 3 ────────────────────────────────────────────────────────────────

  test('étape 3 — affiche le formulaire de coordonnées', async ({ page }) => {
    await page.goto('/calculator/3')
    await expect(page.locator('.step-card-eyebrow')).toContainText('Étape 3')
    await expect(page.getByPlaceholder('Marie', { exact: true })).toBeVisible()
    await expect(page.getByPlaceholder('marie@exemple.com', { exact: true })).toBeVisible()
  })

  test('étape 3 — cliquer Suivant sans email montre une erreur', async ({ page }) => {
    await page.goto('/calculator/3')
    await page.getByRole('button', { name: 'Suivant →' }).click()
    await expect(page.locator('[role="alert"]')).toBeVisible()
    await expect(page.locator('[role="alert"]')).toContainText('email')
    await expect(page).toHaveURL('/calculator/3')
  })

  test('étape 3 — avec email valide, Suivant navigue vers étape 4', async ({ page }) => {
    await page.goto('/calculator/3')
    await page.getByPlaceholder('marie@exemple.com').fill('test@exemple.fr')
    await page.getByRole('button', { name: 'Suivant →' }).click()
    await expect(page).toHaveURL('/calculator/4')
  })

  // ── Étape 4 ────────────────────────────────────────────────────────────────

  test('étape 4 — affiche la page de confirmation', async ({ page }) => {
    await page.goto('/calculator/4')
    await expect(page.locator('.step-card-eyebrow')).toContainText('Étape 4')
    await expect(page.locator('.confirm-title')).toContainText('Prêt')
  })

  test('étape 4 — affiche le bouton "Envoyer ma demande"', async ({ page }) => {
    await page.goto('/calculator/4')
    await expect(page.getByRole('button', { name: /Envoyer ma demande/ })).toBeVisible()
  })

  test('étape 4 — pas de bouton "Suivant →" (dernière étape)', async ({ page }) => {
    await page.goto('/calculator/4')
    await expect(page.getByRole('button', { name: 'Suivant →' })).toBeHidden()
  })
})
