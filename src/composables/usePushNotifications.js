import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from([...atob(b64)].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const isSupported  = 'serviceWorker' in navigator && 'PushManager' in window
  const permission   = ref(isSupported ? Notification.permission : 'denied')
  const isSubscribed = ref(false)
  const loading      = ref(false)

  async function init() {
    if (!isSupported || !VAPID_PUBLIC_KEY) return
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const sub = await reg.pushManager.getSubscription()
      isSubscribed.value = !!sub
      permission.value   = Notification.permission
    } catch (e) {
      console.warn('[Push] init:', e)
    }
  }

  async function subscribe() {
    if (!isSupported || !VAPID_PUBLIC_KEY) return
    loading.value = true
    try {
      const perm = await Notification.requestPermission()
      permission.value = perm
      if (perm !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const j = sub.toJSON()
      await supabase.from('push_subscriptions').upsert({
        user_id:  user.id,
        endpoint: j.endpoint,
        p256dh:   j.keys.p256dh,
        auth_key: j.keys.auth,
      }, { onConflict: 'user_id,endpoint' })

      isSubscribed.value = true
    } catch (e) {
      console.warn('[Push] subscribe:', e)
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe() {
    if (!isSupported) return
    loading.value = true
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', sub.endpoint)
        }
      }
      isSubscribed.value = false
    } catch (e) {
      console.warn('[Push] unsubscribe:', e)
    } finally {
      loading.value = false
    }
  }

  return { isSupported, permission, isSubscribed, loading, init, subscribe, unsubscribe }
}
