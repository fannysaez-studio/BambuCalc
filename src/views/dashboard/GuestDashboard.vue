<template>
  <div class="guest-page">
    <!-- En-tête -->
    <header class="guest-header">
      <div class="guest-header-inner">
        <div class="guest-logo">
          <span class="logo-dot"></span>
          <span class="logo-text">BambuCalc</span>
        </div>
        <div class="guest-header-actions">
          <router-link to="/guest/calculator/1" class="btn-new">
            <Plus class="btn-icon" /> Nouveau devis
          </router-link>
          <router-link to="/signup" class="btn-signup">
            <UserPlus class="btn-icon" /> Créer un compte
          </router-link>
        </div>
      </div>
    </header>

    <!-- Bannière inscription -->
    <div class="signup-banner">
      <UserX class="signup-banner-icon" />
      <div class="signup-banner-text">
        <strong>Mode invité</strong> — vos devis sont stockés uniquement sur cet appareil.
        <router-link to="/signup" class="signup-link">Créez un compte gratuit</router-link> pour les sauvegarder en ligne et y accéder partout.
      </div>
      <router-link to="/signup" class="btn-banner-signup">S'inscrire</router-link>
    </div>

    <!-- Contenu principal -->
    <main class="guest-main">
      <div class="section-header">
        <h2 class="section-title">Mes devis invité</h2>
        <span class="section-count">{{ quotes.length }} devis</span>
      </div>

      <!-- Vide -->
      <div v-if="quotes.length === 0" class="empty-state">
        <FileText class="empty-icon" />
        <p class="empty-title">Aucun devis pour le moment</p>
        <p class="empty-sub">Utilisez le calculateur pour créer votre premier devis.</p>
        <router-link to="/guest/calculator/1" class="btn-new-lg">Créer un devis</router-link>
      </div>

      <!-- Tableau -->
      <div v-else class="quotes-table-wrap">
        <table class="quotes-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Pièce</th>
              <th>Date</th>
              <th>Total TTC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in quotes" :key="q.id">
              <td class="td-number">{{ q.quote_number || '—' }}</td>
              <td>{{ q.client_name || '—' }}</td>
              <td>{{ q.project_name || '—' }}</td>
              <td>{{ fmtDate(q.quote_date) }}</td>
              <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
              <td class="td-actions">
                <button class="action-btn action-pdf" title="Télécharger PDF" @click="downloadPDF(q)">
                  <Download class="action-icon" />
                </button>
                <button class="action-btn action-delete" title="Supprimer" @click="deleteQuote(q.id)">
                  <Trash2 class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { Plus, UserPlus, UserX, FileText, Download, Trash2 } from 'lucide-vue-next'
import { generateQuotePDF } from '../utils/generateQuotePDF'

export default {
  name: 'GuestDashboard',
  components: { Plus, UserPlus, UserX, FileText, Download, Trash2 },
  data() {
    return { quotes: [] }
  },
  mounted() {
    this.loadQuotes()
  },
  methods: {
    loadQuotes() {
      this.quotes = JSON.parse(localStorage.getItem('bambucalc_guest_quotes') || '[]')
    },
    fmtEur(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
    },
    fmtDate(iso) {
      if (!iso) return '—'
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
    },
    downloadPDF(quote) {
      generateQuotePDF(quote)
    },
    deleteQuote(id) {
      this.quotes = this.quotes.filter(q => q.id !== id)
      localStorage.setItem('bambucalc_guest_quotes', JSON.stringify(this.quotes))
    },
  },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.guest-page {
  min-height: 100dvh;
  background: #f0f4f8;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.guest-header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.guest-header-inner {
  max-width: 960px;
  margin: 0 auto;
  height: 3.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.guest-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.02em;
}
.logo-dot {
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 0.4rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
}
.guest-header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  transition: filter 0.2s ease;
}
.btn-new:hover { filter: brightness(1.08); }
.btn-signup {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1.5px solid #2e9cab;
  color: #2e9cab;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  background: transparent;
  transition: background 0.2s ease, color 0.2s ease;
}
.btn-signup:hover { background: #e8f7f9; }
.btn-icon { width: 0.9rem; height: 0.9rem; }

/* ── Bannière inscription ── */
.signup-banner {
  background: linear-gradient(135deg, #fff7e6, #fff3d6);
  border-bottom: 1px solid #f6c05c;
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.85rem;
  color: #7a5c1a;
}
.signup-banner-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
  color: #d4a017;
}
.signup-banner-text {
  flex: 1;
  line-height: 1.5;
}
.signup-link {
  color: #2e9cab;
  font-weight: 700;
  text-decoration: underline;
}
.btn-banner-signup {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: #1b2f39;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}
.btn-banner-signup:hover { opacity: 0.85; }

/* ── Main ── */
.guest-main {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem;
  flex: 1;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  letter-spacing: -0.02em;
}
.section-count {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: #e8f7f9;
  color: #1f7f97;
}

/* ── État vide ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 0.5rem;
}
.empty-icon { width: 3rem; height: 3rem; color: #cbd5e0; margin-bottom: 0.5rem; }
.empty-title { font-size: 1rem; font-weight: 700; color: #2d3748; margin: 0; }
.empty-sub { font-size: 0.85rem; color: #718096; margin: 0 0 1.25rem; }
.btn-new-lg {
  padding: 0.65rem 1.6rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
  transition: filter 0.2s ease;
}
.btn-new-lg:hover { filter: brightness(1.08); }

/* ── Tableau ── */
.quotes-table-wrap {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.quotes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.quotes-table th {
  padding: 0.75rem 1rem;
  background: #f7f9fc;
  color: #718096;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.quotes-table td {
  padding: 0.85rem 1rem;
  color: #2d3748;
  border-bottom: 1px solid #f0f4f8;
  vertical-align: middle;
}
.quotes-table tr:last-child td { border-bottom: none; }
.td-number { font-weight: 700; color: #1b2f39; font-size: 0.82rem; }
.td-total { font-weight: 700; color: #2e9cab; }
.td-actions { display: flex; gap: 0.4rem; }
.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}
.action-pdf { background: #e8f7f9; color: #2e9cab; }
.action-pdf:hover { background: #c5eef4; }
.action-delete { background: #fff0f0; color: #e53e3e; }
.action-delete:hover { background: #fed7d7; }
.action-icon { width: 0.9rem; height: 0.9rem; }

@media (max-width: 640px) {
  .guest-header { padding: 0 1rem; }
  .guest-main { padding: 1.25rem 1rem; }
  .signup-banner { flex-wrap: wrap; }
  .btn-banner-signup { width: 100%; text-align: center; }
  .quotes-table th:nth-child(4),
  .quotes-table td:nth-child(4) { display: none; }
}
</style>
