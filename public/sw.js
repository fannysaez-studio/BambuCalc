// BambuCalc Service Worker — PWA (install/activate/fetch) + Web Push Notifications

const CACHE_NAME = 'bambucalc-v1'
const PRECACHE = ['/', '/favicon.ico', '/manifest.json', '/assets/icons/icon.svg', '/assets/icons/icon-maskable.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match('/').then((cached) => cached ?? Response.error())
    )
  )
})

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title   = data.title   ?? 'BambuCalc'
  const options = {
    body:    data.body    ?? '',
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    tag:     data.tag     ?? 'bambucalc-push',
    data:    { url: data.url ?? '/admin' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/admin'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
