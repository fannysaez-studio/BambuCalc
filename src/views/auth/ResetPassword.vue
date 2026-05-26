<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, CheckCircle } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import PasswordField from '@/components/ui/PasswordField.vue'

const router = useRouter()

const password    = ref('')
const confirm     = ref('')
const error       = ref(null)
const loading     = ref(false)
const success     = ref(false)
const sessionReady = ref(false)

let subscription = null

onMounted(async () => {
  // Supabase émet PASSWORD_RECOVERY quand le token de l'URL est consommé
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
      sessionReady.value = true
    }
  })
  subscription = data.subscription

  // Si la session existe déjà (rechargement de page)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) sessionReady.value = true
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

async function onSubmit() {
  error.value = null

  if (!password.value || password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    if (e?.message?.includes('session')) {
      error.value = 'Le lien a expiré. Recommence depuis la page de connexion.'
    } else {
      error.value = e?.message || 'Erreur lors de la mise à jour.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    <div class="reset-card">
      <div class="reset-icon-wrap">
        <Lock class="reset-icon" />
      </div>

      <!-- Succès -->
      <div v-if="success" class="state-block">
        <div class="state-check">
          <CheckCircle class="state-check-icon" />
        </div>
        <h2>Mot de passe mis à jour !</h2>
        <p>Redirection vers la connexion…</p>
      </div>

      <!-- Session non prête -->
      <div v-else-if="!sessionReady" class="state-block">
        <div class="spinner" />
        <p>Vérification du lien…</p>
      </div>

      <!-- Formulaire -->
      <form v-else @submit.prevent="onSubmit">
        <h2 class="reset-title">Nouveau mot de passe</h2>
        <p class="reset-sub">Choisis un mot de passe sécurisé.</p>

        <PasswordField
          id="new-password"
          label="Nouveau mot de passe"
          :show-strength="true"
          v-model="password"
        />

        <div class="field-gap">
          <PasswordField
            id="confirm-password"
            label="Confirmer"
            v-model="confirm"
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  min-height: 100dvh;
  background: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.reset-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.reset-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
}
.reset-icon { width: 1.4rem; height: 1.4rem; color: #fff; }

.reset-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.3rem;
  text-align: center;
  letter-spacing: -0.02em;
}
.reset-sub {
  font-size: 0.88rem;
  color: #718096;
  text-align: center;
  margin: 0 0 1.5rem;
}

.field-gap { margin-top: 1rem; }

.auth-error {
  margin: 0.75rem 0;
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(220,53,69,0.08);
  border: 1px solid rgba(220,53,69,0.25);
  color: #c0392b;
  font-size: 0.85rem;
}

.btn-primary {
  width: 100%;
  min-height: 2.95rem;
  border: 0;
  border-radius: 0.55rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 18px rgba(46,156,171,0.28);
  transition: filter 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
}
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.06); }

/* Succès / attente */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 1rem 0;
}
.state-check {
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(46, 154, 171, 0.28);
}
.state-check-icon {
  width: 2rem;
  height: 2rem;
  color: #fff;
}
.state-block h2 { font-size: 1.3rem; font-weight: 800; color: #1b2f39; margin: 0; }
.state-block p  { font-size: 0.88rem; color: #718096; margin: 0; }

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #2e9cab;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
