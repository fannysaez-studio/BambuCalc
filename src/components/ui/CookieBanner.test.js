import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import CookieBanner from './CookieBanner.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',        component: { template: '<div/>' } },
    { path: '/privacy', component: { template: '<div/>' } },
  ],
})

function mountBanner() {
  return mount(CookieBanner, {
    global: { plugins: [router] },
  })
}

beforeEach(() => {
  localStorage.clear()
})

// ── Visibilité ────────────────────────────────────────────────────────────────

describe('visibilité', () => {
  it('affiche le banner si cookie_consent est absent', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-sheet').exists()).toBe(true)
  })

  it('masque le banner si cookie_consent est déjà défini', async () => {
    localStorage.setItem('cookie_consent', 'essential')
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-sheet').exists()).toBe(false)
  })
})

// ── Bouton Accepter ───────────────────────────────────────────────────────────

describe('bouton Tout accepter', () => {
  it('stocke "all" dans localStorage', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    await wrapper.find('.btn-accept').trigger('click')
    expect(localStorage.getItem('cookie_consent')).toBe('all')
  })

  it('masque le banner après le clic', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    await wrapper.find('.btn-accept').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cookie-sheet').exists()).toBe(false)
  })
})

// ── Bouton Essentiel ──────────────────────────────────────────────────────────

describe('bouton Essentiel uniquement', () => {
  it('stocke "essential" dans localStorage', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    await wrapper.find('.btn-decline').trigger('click')
    expect(localStorage.getItem('cookie_consent')).toBe('essential')
  })

  it('dispatche l\'événement cookie-consent avec level = "essential"', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    let receivedLevel = null
    window.addEventListener('cookie-consent', (e) => { receivedLevel = e.detail.level }, { once: true })

    await wrapper.find('.btn-decline').trigger('click')
    expect(receivedLevel).toBe('essential')
  })
})
