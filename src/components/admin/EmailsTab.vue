<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">
        {{ ['Configuration & Modèle', 'Rédaction', 'Aperçu & Envoi'][emailStep - 1] }}
      </h2>
      <div class="sim-steps-bar email-steps-bar">
        <button :class="['sim-step-dot', emailStep === 1 && 'sim-step-dot--active', emailStep > 1 && 'sim-step-dot--done']"
                @click="emailStep = 1" title="Configuration">1</button>
        <div :class="['sim-step-line', emailStep > 1 && 'sim-step-line--done']"></div>
        <button :class="['sim-step-dot', emailStep === 2 && 'sim-step-dot--active', emailStep > 2 && 'sim-step-dot--done']"
                @click="emailStep = 2" title="Rédaction">2</button>
        <div :class="['sim-step-line', emailStep > 2 && 'sim-step-line--done']"></div>
        <button :class="['sim-step-dot', emailStep === 3 && 'sim-step-dot--active']"
                @click="emailStep = 3" title="Aperçu & Envoi">3</button>
      </div>
    </div>

    <!-- ══ Étape 1 : Configuration & Modèle ══ -->
    <div v-if="emailStep === 1" class="email-single-col">
      <div class="email-step-section">
        <p class="ecf-section-label"><Settings class="ecf-section-icon" /> Paramètres d'envoi</p>
        <div class="ecf-group">
          <label class="ecf-label">Nom expéditeur</label>
          <input class="ecf-input" v-model="senderName" placeholder="BambuCalc" />
        </div>
        <div class="ecf-group">
          <label class="ecf-label">Email de réponse</label>
          <input class="ecf-input" v-model="replyTo" type="email" placeholder="votre@email.com" />
        </div>
      </div>

      <div class="email-step-section">
        <p class="ecf-section-label"><Mail class="ecf-section-icon" /> Modèle d'email</p>
        <div class="ecf-group">
          <label class="ecf-label">Sujet du mail (template)</label>
          <input class="ecf-input" v-model="emailSubject" placeholder="Votre devis BambuCalc — [numéro]" />
          <p class="ecf-hint">Variable : [numéro]</p>
        </div>
        <div class="ecf-group">
          <label class="ecf-label">Texte d'introduction (template)</label>
          <textarea class="ecf-input ecf-textarea ecf-textarea--lg" v-model="emailIntroClient"
            placeholder="Bonjour [client], merci pour votre demande. Voici le récapitulatif de votre devis." />
          <p class="ecf-hint">Variables : [client] · [client_nom] · [numéro] · [projet] · [total]</p>
        </div>
      </div>

      <div class="email-step-section">
        <p class="ecf-section-label"><Bell class="ecf-section-icon" /> Notifications</p>
        <p class="notif-sub">Reçues par vous</p>
        <div class="notif-row">
          <div class="notif-text"><p class="notif-label">Nouvelle demande</p><p class="notif-desc">Quand un client soumet un devis</p></div>
          <button :class="['toggle-switch', notifNewQuote && 'toggle-switch--on']" @click="notifNewQuote = !notifNewQuote"><span class="toggle-knob" /></button>
        </div>
        <div class="notif-row">
          <div class="notif-text"><p class="notif-label">Devis accepté</p><p class="notif-desc">Quand un client accepte un devis</p></div>
          <button :class="['toggle-switch', notifAccepted && 'toggle-switch--on']" @click="notifAccepted = !notifAccepted"><span class="toggle-knob" /></button>
        </div>
        <p class="notif-sub notif-sub--spaced">Envoyées aux clients</p>
        <div class="notif-row">
          <div class="notif-text"><p class="notif-label">Confirmation de demande</p><p class="notif-desc">Accusé de réception auto</p></div>
          <button :class="['toggle-switch', notifClientConfirm && 'toggle-switch--on']" @click="notifClientConfirm = !notifClientConfirm"><span class="toggle-knob" /></button>
        </div>
        <div class="notif-row">
          <div class="notif-text"><p class="notif-label">Changement de statut</p><p class="notif-desc">Notification mise à jour statut</p></div>
          <button :class="['toggle-switch', notifStatusChange && 'toggle-switch--on']" @click="notifStatusChange = !notifStatusChange"><span class="toggle-knob" /></button>
        </div>
      </div>

      <div class="email-step-footer">
        <button class="btn-save-email" @click="saveEmailSettings" :disabled="emailSaving">
          <span v-if="emailSaved">✓ Sauvegardé</span>
          <span v-else-if="emailSaving">Sauvegarde…</span>
          <span v-else>Sauvegarder</span>
        </button>
        <button class="btn-email-next" @click="emailStep = 2">Rédaction →</button>
      </div>
    </div>

    <!-- ══ Étape 2 : Rédaction ══ -->
    <div v-if="emailStep === 2" class="email-single-col">
      <div class="email-step-section">
        <p class="ecf-section-label">Sélectionner un devis actif</p>
        <select class="ecf-select" v-model="selectedQuoteId" @change="onQuoteSelect">
          <option value="">— Choisir un devis pour prévisualiser l'envoi —</option>
          <option v-for="opt in quoteSelectOptions" :key="opt.id" :value="opt.id">
            {{ opt.label }}
          </option>
        </select>
        <p v-if="quoteSelectOptions.length === 0" class="ecf-hint ecf-hint--warn">
          Aucun devis avec adresse e-mail client trouvé.
        </p>
      </div>

      <template v-if="selectedQuote">
        <div class="ecf-recipient">
          <span class="ecf-recipient-label">Destinataire</span>
          <span class="ecf-recipient-email">{{ selectedQuote.client_email }}</span>
          <span class="ecf-recipient-badge">✓</span>
        </div>

        <div class="ecf-preview-block">
          <p class="ecf-preview-label">Aperçu avec ce devis</p>
          <p class="ecf-preview-subject">{{ resolvedSubject(selectedQuote) }}</p>
          <p v-if="resolvedIntro(selectedQuote)" class="ecf-preview-intro">{{ resolvedIntro(selectedQuote) }}</p>
          <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction — ajoutez-en un à l'étape 1.</div>
          <div class="ecf-preview-actions">
            <button
              v-if="!['Prêt','Fini','Accepté','accepted','sent'].includes(selectedQuote.status)"
              class="btn-validate-quote"
              @click="saveQuote">
              <CheckCircle class="btn-send-icon-sm" />
              Marquer comme Prêt
            </button>
          </div>
        </div>
      </template>
      <div v-else class="email-empty-step">
        <Mail class="empty-icon" />
        <p class="empty-title">Aucun devis sélectionné</p>
        <p class="empty-hint">Choisissez un devis dans la liste ci-dessus pour prévisualiser l'email.</p>
      </div>

      <div class="email-step-footer">
        <button class="btn-email-prev" @click="emailStep = 1">← Configuration</button>
        <button class="btn-email-next" @click="emailStep = 3">Aperçu final →</button>
      </div>
    </div>

    <!-- ══ Étape 3 : Aperçu Final & Envoi ══ -->
    <div v-if="emailStep === 3" class="email-single-col">
      <div class="email-step-section">
        <p class="ecf-section-label">Aperçu de l'email</p>
        <template v-if="selectedQuote">
          <div class="preview-subject">{{ resolvedSubject(selectedQuote) }}</div>
          <div v-if="resolvedIntro(selectedQuote)" class="preview-intro">{{ resolvedIntro(selectedQuote) }}</div>
          <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction configuré.</div>
          <div class="send-pdf-indicator" :class="attachPdfAuto ? 'send-pdf-indicator--on' : 'send-pdf-indicator--off'">
            <FileText class="send-pdf-icon" />
            <span v-if="attachPdfAuto">Devis PDF joint automatiquement</span>
            <span v-else>PDF non joint (désactivé)</span>
            <span class="send-pdf-status">{{ attachPdfAuto ? '✓' : '○' }}</span>
          </div>
        </template>
        <div v-else class="email-empty-step">
          <p class="empty-hint">Retournez à l'étape 2 pour sélectionner un devis.</p>
        </div>
      </div>

      <div class="email-step-section">
        <p class="ecf-section-label"><FileText class="ecf-section-icon" /> Pièces jointes</p>
        <div class="notif-row">
          <div class="notif-text"><p class="notif-label">Joindre le devis PDF</p><p class="notif-desc">Fichier PDF généré automatiquement</p></div>
          <button :class="['toggle-switch', attachPdfAuto && 'toggle-switch--on']" @click="attachPdfAuto = !attachPdfAuto"><span class="toggle-knob" /></button>
        </div>
        <div class="ecf-group" style="margin-top: 0.5rem;">
          <label class="ecf-label">Document global (CGV, guide…)</label>
          <div
            :class="['attach-drop', attachDragOver && 'attach-drop--over']"
            @click="attachInput.click()"
            @dragover.prevent="attachDragOver = true"
            @dragleave.prevent="attachDragOver = false"
            @drop.prevent="handleAttachDrop">
            <template v-if="globalAttachmentName">
              <p class="attach-filename">📎 {{ globalAttachmentName }}</p>
              <button class="attach-clear" @click.stop="clearAttachment" title="Retirer">×</button>
            </template>
            <template v-else>
              <p class="attach-hint">Glisser un PDF ici</p>
              <span class="attach-sub">ou cliquer pour parcourir</span>
            </template>
            <input ref="attachInput" type="file" accept=".pdf" style="display:none" @change="handleAttachFile" />
          </div>
        </div>
      </div>

      <div class="email-step-footer">
        <button class="btn-email-prev" @click="emailStep = 2">← Rédaction</button>
        <div class="email-step-actions">
          <button class="btn-test-email" @click="sendTestEmail" :disabled="testEmailSending">
            <span v-if="testEmailSent">✓ Envoyé !</span>
            <span v-else-if="testEmailSending">Envoi…</span>
            <span v-else>Email de test</span>
          </button>
          <button class="btn-send-inline" @click="emit('open-send-modal', selectedQuote)" :disabled="!selectedQuote">
            <Send class="btn-send-icon-sm" />
            {{ selectedQuote ? 'Envoyer ' + selectedQuote.quote_number : 'Envoyer' }}
          </button>
        </div>
      </div>
    </div>

    <ToastMessage ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { generateQuotePDFDoc, pdfToBase64 } from '@/utils/generateQuotePDF'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import { Settings, Mail, Bell, FileText, Send, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  quotes: { type: Array, default: () => [] },
})

const emit = defineEmits(['open-send-modal', 'settings-changed'])

// ── Email settings state ──────────────────────────────────────────────────────
const saved = JSON.parse(localStorage.getItem('bambu_email_settings') || '{}')

const emailStep          = ref(1)
const senderName         = ref(saved.senderName       || 'BambuCalc')
const replyTo            = ref(saved.replyTo           || '')
const emailSubject       = ref(saved.emailSubject      || 'Votre devis BambuCalc — [numéro]')
const emailIntroClient   = ref(saved.emailIntroClient  || '')
const notifNewQuote      = ref(saved.notifNewQuote      ?? true)
const notifAccepted      = ref(saved.notifAccepted      ?? true)
const notifClientConfirm = ref(saved.notifClientConfirm ?? true)
const notifStatusChange  = ref(saved.notifStatusChange  ?? true)
const attachPdfAuto      = ref(saved.attachPdfAuto      ?? true)
const attachDragOver     = ref(false)
const globalAttachmentName = ref(localStorage.getItem('bambu_global_attachment_name') || '')
const globalAttachment   = ref(null)
const emailSettingsId    = ref(null)
const emailSaving        = ref(false)
const emailSaved         = ref(false)
const testEmailSending   = ref(false)
const testEmailSent      = ref(false)

// ── Quote selection ───────────────────────────────────────────────────────────
const selectedQuoteId = ref('')
const selectedQuote   = ref(null)
const attachInput     = ref(null)
const toast           = ref(null)

const quoteSelectOptions = computed(() =>
  props.quotes
    .filter(q => q.client_email)
    .map(q => {
      const civ  = q.client_civility ? q.client_civility + ' ' : ''
      const name = q.client_last_name
        ? `${civ}${q.client_last_name}`
        : (q.client_name || q.client_email || '—')
      const statusBadge = q.status === 'accepted' ? ' ✓' : ''
      return { id: q.id, label: `${q.quote_number || '—'} — ${name}${statusBadge}` }
    })
)

function onQuoteSelect() {
  selectedQuote.value = props.quotes.find(q => q.id === selectedQuoteId.value) || null
}

function autoSelectFirstQuote() {
  if (quoteSelectOptions.value.length > 0 && !selectedQuoteId.value) {
    selectedQuoteId.value = quoteSelectOptions.value[0].id
    selectedQuote.value   = props.quotes.find(q => q.id === selectedQuoteId.value) || null
  }
}

// ── Template resolution ───────────────────────────────────────────────────────
function resolvedSubject(quote) {
  const civility  = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName  = quote.client_last_name || ''
  const firstName = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  return (emailSubject.value || 'Votre devis BambuCalc — [numéro]')
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[senderName\]/gi, senderName.value || 'BambuCalc')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, civility + (lastName || firstName))
}

function resolvedIntro(quote) {
  const civility   = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName   = quote.client_last_name || ''
  const firstName  = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  const fullPolite = civility + (lastName || firstName)
  const totalFormatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total_cost ?? 0)
  return (emailIntroClient.value || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, fullPolite)
    .replace(/\[civilité\]/gi, civility.trim())
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[total\]/gi, totalFormatted)
}

// ── Persist email settings ────────────────────────────────────────────────────
function syncCache() {
  localStorage.setItem('bambu_email_settings', JSON.stringify({
    senderName: senderName.value, replyTo: replyTo.value,
    emailSubject: emailSubject.value, emailIntroClient: emailIntroClient.value,
    notifNewQuote: notifNewQuote.value, notifAccepted: notifAccepted.value,
    notifClientConfirm: notifClientConfirm.value, notifStatusChange: notifStatusChange.value,
    attachPdfAuto: attachPdfAuto.value,
  }))
}

async function loadEmailSettings() {
  const { data, error } = await supabase.from('email_settings').select('*').single()
  if (error) {
    if (error.code !== 'PGRST116' && error.code !== '42501') {
      console.error('[loadEmailSettings]', error.code, error.message)
    }
    return
  }
  if (!data) return
  emailSettingsId.value    = data.id
  senderName.value         = data.sender_name          || 'BambuCalc'
  replyTo.value            = data.reply_to             || ''
  emailSubject.value       = data.email_subject        || 'Votre devis BambuCalc — [numéro]'
  emailIntroClient.value   = data.email_intro_client   || ''
  notifNewQuote.value      = data.notif_new_quote      ?? true
  notifAccepted.value      = data.notif_accepted       ?? true
  notifClientConfirm.value = data.notif_client_confirm ?? true
  notifStatusChange.value  = data.notif_status_change  ?? true
  syncCache()
  emit('settings-changed', currentSettings())
}

function currentSettings() {
  return {
    senderName: senderName.value,
    emailSubject: emailSubject.value,
    emailIntroClient: emailIntroClient.value,
    attachPdfAuto: attachPdfAuto.value,
  }
}

async function saveEmailSettings() {
  emailSaving.value = true
  try {
    const payload = {
      sender_name:          senderName.value,
      reply_to:             replyTo.value,
      email_subject:        emailSubject.value,
      email_intro_client:   emailIntroClient.value,
      notif_new_quote:      notifNewQuote.value,
      notif_accepted:       notifAccepted.value,
      notif_client_confirm: notifClientConfirm.value,
      notif_status_change:  notifStatusChange.value,
      updated_at:           new Date().toISOString(),
    }
    let opError
    if (emailSettingsId.value) {
      const result = await supabase.from('email_settings').update(payload).eq('id', emailSettingsId.value)
      opError = result.error
    } else {
      const result = await supabase.from('email_settings').insert(payload).select('id').single()
      opError = result.error
      if (result.data?.id) emailSettingsId.value = result.data.id
    }
    if (opError) throw new Error(opError.message || JSON.stringify(opError))
    syncCache()
    emit('settings-changed', currentSettings())
    emailSaved.value = true
    setTimeout(() => { emailSaved.value = false }, 2000)
    toast.value?.show('Paramètres e-mail sauvegardés.', 'success', 2500)
  } catch (err) {
    toast.value?.show(`Erreur sauvegarde : ${err.message}`, 'error')
  } finally {
    emailSaving.value = false
  }
}

// ── saveQuote (mark as Prêt) ──────────────────────────────────────────────────
async function saveQuote() {
  if (!selectedQuote.value) return
  const { error } = await supabase
    .from('quotes')
    .update({ status: 'Prêt' })
    .eq('id', selectedQuote.value.id)
  if (error) { toast.value?.show(`Erreur : ${error.message}`, 'error'); return }
  selectedQuote.value.status = 'Prêt'
  toast.value?.show(`Devis ${selectedQuote.value.quote_number} marqué comme "Prêt".`, 'success', 3000)
}

// ── Test email ────────────────────────────────────────────────────────────────
async function sendTestEmail() {
  testEmailSending.value = true
  try {
    const { data: authData } = await supabase.auth.getUser()
    const adminEmail = authData?.user?.email || ''
    if (!adminEmail) throw new Error('Email admin introuvable — vérifiez votre session.')

    const testQuote = {
      quote_number: 'DEV-TEST-0000', project_name: 'Pièce de test',
      material: 'PLA+', quantity: 1, total_cost: 42.50,
      client_email: adminEmail, client_name: 'Admin',
      client_first_name: 'Admin', client_civility: 'M.',
      payment_method: 'virement', deposit_percent: 0,
    }

    let pdfBase64 = null, pdfFilename = null
    if (attachPdfAuto.value) {
      try {
        const quoteForPdf = selectedQuote.value
        if (quoteForPdf) {
          const doc = generateQuotePDFDoc(quoteForPdf)
          pdfBase64   = pdfToBase64(doc)
          pdfFilename = `devis-${quoteForPdf.quote_number || 'bambucalc'}.pdf`
        }
      } catch (pdfErr) {
        console.warn('[sendTestEmail] PDF failed, sending without attachment:', pdfErr)
      }
    }

    const { error } = await supabase.functions.invoke('send-quote-email', {
      body: { quote: testQuote, pdfBase64: pdfBase64 ?? null, filename: pdfFilename ?? null },
    })
    if (error) throw new Error(error.message || JSON.stringify(error))

    testEmailSent.value = true
    setTimeout(() => { testEmailSent.value = false }, 4000)
    toast.value?.show(`Mail de test envoyé à ${adminEmail}`, 'success', 4000)
  } catch (err) {
    toast.value?.show(`Erreur : ${err.message || 'edge function indisponible'}`, 'error')
  } finally {
    testEmailSending.value = false
  }
}

// ── Attachment ────────────────────────────────────────────────────────────────
function handleAttachFile(e) {
  const file = e.target.files[0]
  if (file) {
    globalAttachment.value = file
    globalAttachmentName.value = file.name
    localStorage.setItem('bambu_global_attachment_name', file.name)
  }
}
function handleAttachDrop(e) {
  attachDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'application/pdf') {
    globalAttachment.value = file
    globalAttachmentName.value = file.name
    localStorage.setItem('bambu_global_attachment_name', file.name)
  }
}
function clearAttachment() {
  globalAttachment.value = null
  globalAttachmentName.value = ''
  if (attachInput.value) attachInput.value.value = ''
  localStorage.removeItem('bambu_global_attachment_name')
}

onMounted(async () => {
  await loadEmailSettings()
  autoSelectFirstQuote()
})
</script>

<style scoped>
/* ── Panel shell ── */
.panel-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  display: flex; flex-direction: column;
  flex: 1; min-height: 0; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.panel-title {
  font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0;
}
.empty-icon { width: 2rem; height: 2rem; color: #cbd5e0; }
.empty-title { font-size: 0.9rem; font-weight: 700; color: #718096; margin: 0; }
.empty-hint  { font-size: 0.78rem; color: #a0aec0; margin: 0; }

/* ── Steps bar ── */
.sim-steps-bar {
  display: flex; align-items: center;
  padding: 0.55rem 0.85rem 0.3rem;
  gap: 0; flex-shrink: 0;
}
.email-steps-bar { padding: 0; flex: 0 0 auto; min-width: 130px; margin-left: auto; }
.sim-step-dot {
  width: 1.55rem; height: 1.55rem; border-radius: 50%;
  border: 2px solid #d6bcfa; background: #fff;
  color: #c4b5fd; font-size: 0.67rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all 0.2s ease;
  font-family: inherit;
}
.sim-step-dot--active {
  border-color: #7c3aed; background: #7c3aed; color: #fff;
  box-shadow: 0 2px 8px rgba(124,58,237,0.35);
}
.sim-step-dot--done { border-color: #9f7aea; background: #f0e6ff; color: #7c3aed; }
.sim-step-line {
  flex: 1; height: 2px; background: #e9d8fd; border-radius: 999px;
  margin: 0 0.15rem; transition: background 0.3s ease;
}
.sim-step-line--done { background: #9f7aea; }

/* ── Single-column layout ── */
.email-single-col {
  padding: 0.9rem 1.25rem 0.75rem;
  display: flex; flex-direction: column; gap: 0.85rem;
  overflow-y: auto; flex: 1;
}
.email-step-section {
  display: flex; flex-direction: column; gap: 0.45rem;
  background: #fff; border: 1px solid #f0f4f8; border-radius: 12px;
  padding: 0.85rem 1rem;
}
.email-step-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.65rem; flex-wrap: wrap; flex-shrink: 0;
  border-top: 1px solid #f0f4f8; padding-top: 0.75rem; margin-top: auto;
}
.email-step-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.email-empty-step {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.5rem 1rem; gap: 0.4rem; text-align: center;
}

/* ── Fields ── */
.ecf-section-label {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: #7c3aed; margin: 0;
}
.ecf-section-icon { width: 0.72rem; height: 0.72rem; flex-shrink: 0; }
.ecf-group { display: flex; flex-direction: column; gap: 0.25rem; }
.ecf-label { font-size: 0.72rem; font-weight: 700; color: #4a5568; }
.ecf-input {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.45rem 0.65rem; font-size: 0.82rem;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; width: 100%; transition: border-color 0.2s;
  box-sizing: border-box;
}
.ecf-input:focus { border-color: #2e9cab; }
.ecf-textarea { resize: none; line-height: 1.5; }
.ecf-textarea--lg { min-height: 100px; resize: vertical; }
.ecf-hint { font-size: 0.67rem; color: #a0aec0; margin: 0; }
.ecf-hint--warn { color: #d69e2e; }
.ecf-select {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.45rem 0.65rem; font-size: 0.82rem;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; width: 100%; transition: border-color 0.2s;
  box-sizing: border-box; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a0aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.65rem center;
  padding-right: 2rem;
}
.ecf-select:focus { border-color: #2e9cab; }

/* ── Recipient + preview ── */
.ecf-recipient {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.42rem 0.7rem; border-radius: 8px;
  background: #e8f7f9; border: 1px solid #b2e8ef;
  flex-shrink: 0;
}
.ecf-recipient-label { font-size: 0.65rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.ecf-recipient-email { font-size: 0.8rem; font-weight: 700; color: #2e9cab; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ecf-recipient-badge { font-size: 0.85rem; color: #2e9cab; font-weight: 800; flex-shrink: 0; }

.ecf-preview-block {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0.7rem 0.85rem; display: flex; flex-direction: column; gap: 0.3rem;
  flex-shrink: 0;
}
.ecf-preview-label   { font-size: 0.58rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.07em; margin: 0; }
.ecf-preview-subject { font-size: 0.8rem; font-weight: 700; color: #1b2f39; margin: 0; }
.ecf-preview-intro   { font-size: 0.75rem; color: #4a5568; line-height: 1.55; margin: 0; white-space: pre-wrap; }
.ecf-preview-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }

/* ── Preview (full) ── */
.preview-subject { font-size: 0.82rem; font-weight: 700; color: #1b2f39; margin-bottom: 0.4rem; }
.preview-intro { font-size: 0.8rem; color: #4a5568; line-height: 1.55; white-space: pre-wrap; }
.preview-intro--muted { color: #a0aec0; font-style: italic; }

/* ── Notifications ── */
.notif-sub {
  font-size: 0.62rem; font-weight: 800; color: #cbd5e0;
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
}
.notif-sub--spaced { margin-top: 0.4rem; }
.notif-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.5rem 0.65rem;
  background: #f7f9fc; border-radius: 10px; border: 1px solid #e2e8f0;
}
.notif-text { flex: 1; }
.notif-label { font-size: 0.78rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.1rem; }
.notif-desc  { font-size: 0.67rem; color: #a0aec0; margin: 0; }

/* ── Toggle ── */
.toggle-switch {
  width: 2.5rem; height: 1.35rem; border-radius: 999px;
  background: #e2e8f0; border: none; cursor: pointer;
  padding: 0.15rem; display: flex; align-items: center;
  transition: background 0.2s ease; flex-shrink: 0;
}
.toggle-switch--on { background: #2e9cab; }
.toggle-knob {
  display: block; width: 1rem; height: 1rem; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 0.2s ease;
}
.toggle-switch--on .toggle-knob { transform: translateX(1.1rem); }

/* ── PDF indicator ── */
.send-pdf-indicator {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border-radius: 8px;
  font-size: 0.78rem; font-weight: 700;
  width: 100%; margin-bottom: 0.1rem;
}
.send-pdf-indicator--on  { background: #e8f7f9; border: 1px solid #b2e8ef; color: #2e9cab; }
.send-pdf-indicator--off { background: #f7f9fc; border: 1px solid #e2e8f0; color: #a0aec0; }
.send-pdf-icon   { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }
.send-pdf-status { margin-left: auto; font-size: 0.85rem; }

/* ── Attachment drop zone ── */
.attach-drop {
  border: 2px dashed #e2e8f0; border-radius: 10px;
  padding: 0.85rem 1rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem;
  text-align: center; position: relative;
  transition: border-color 0.2s, background 0.2s;
  min-height: 4rem;
}
.attach-drop:hover { border-color: #2e9cab; background: #f0fafa; }
.attach-drop--over { border-color: #2e9cab; background: #e8f7f9; border-style: solid; }
.attach-hint { font-size: 0.78rem; font-weight: 700; color: #4a5568; margin: 0; }
.attach-sub  { font-size: 0.67rem; color: #a0aec0; }
.attach-filename { font-size: 0.75rem; font-weight: 600; color: #2e9cab; margin: 0; padding: 0 1.5rem; word-break: break-all; }
.attach-clear {
  position: absolute; top: 0.3rem; right: 0.3rem;
  width: 1.35rem; height: 1.35rem; border-radius: 50%;
  border: none; background: #e2e8f0; color: #718096;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit; line-height: 1; padding: 0;
  transition: background 0.15s, color 0.15s;
}
.attach-clear:hover { background: #feb2b2; color: #c53030; }

/* ── Buttons ── */
.btn-save-email {
  display: inline-flex; align-items: center;
  padding: 0.52rem 1.4rem; border: none; border-radius: 999px;
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3); transition: filter 0.2s ease;
}
.btn-save-email:hover:not(:disabled) { filter: brightness(1.06); }
.btn-save-email:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-email-next {
  display: inline-flex; align-items: center;
  padding: 0.5rem 1.3rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #f7f0ff; color: #7c3aed;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.18s ease;
  margin-left: auto;
}
.btn-email-next:hover { background: #ede9fe; border-color: #9f7aea; box-shadow: 0 2px 8px rgba(124,58,237,0.18); }

.btn-email-prev {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.38rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.btn-email-prev:hover { background: #f7f9fc; border-color: #cbd5e0; color: #4a5568; }

.btn-test-email {
  display: inline-flex; align-items: center;
  padding: 0.52rem 1.25rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab;
  font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-test-email:hover:not(:disabled) {
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
}
.btn-test-email:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-send-inline {
  display: inline-flex; align-items: center; gap: 0.4rem;
  margin-top: 0;
  padding: 0.52rem 1.15rem; border: none; border-radius: 999px;
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.3); transition: filter 0.2s ease;
  white-space: nowrap;
}
.btn-send-inline:hover:not(:disabled) { filter: brightness(1.07); }
.btn-send-inline:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-validate-quote {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.52rem 1.15rem; border: none; border-radius: 999px;
  background: #e8f7f9; color: #2e9cab;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.2s ease;
}
.btn-validate-quote:hover { background: #d0eff4; }
.btn-send-icon-sm { width: 0.85rem; height: 0.85rem; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .email-step-footer { flex-direction: column; align-items: stretch; }
  .btn-email-next  { margin-left: 0; justify-content: center; }
  .email-step-actions { width: 100%; justify-content: flex-end; }
}
@media (max-width: 540px) {
  .btn-save-email, .btn-test-email { flex: 1; justify-content: center; }
}
</style>
