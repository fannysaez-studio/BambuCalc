<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title"><TrendingUp class="ptitle-icon" /> Statistiques & Business</h2>
    </div>
    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
    <div v-else class="stats-panel">

      <!-- KPIs -->
      <div class="stat-kpi-grid">
        <div class="stat-kpi">
          <p class="stat-kpi-label">CA total (tous devis)</p>
          <p class="stat-kpi-value stat-kpi-value--teal">{{ fmtEur(totalRevenue) }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">CA devis acceptés</p>
          <p class="stat-kpi-value stat-kpi-value--green">{{ fmtEur(statsRevenueAccepted) }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">Panier moyen</p>
          <p class="stat-kpi-value stat-kpi-value--teal">{{ fmtEur(avgCost) }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">Taux d'acceptation</p>
          <p class="stat-kpi-value stat-kpi-value--green">{{ statsAcceptanceRate }}%</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">Acceptés</p>
          <p class="stat-kpi-value stat-kpi-value--green">{{ statsAccepted }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">Refusés</p>
          <p class="stat-kpi-value stat-kpi-value--red">{{ statsRefused }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">Envoyés</p>
          <p class="stat-kpi-value stat-kpi-value--blue">{{ statsSent }}</p>
        </div>
        <div class="stat-kpi">
          <p class="stat-kpi-label">En attente</p>
          <p class="stat-kpi-value">{{ statsPending }}</p>
        </div>
      </div>

      <!-- Répartition par statut -->
      <div class="stats-section" v-if="props.quotes.length">
        <p class="stats-section-title">Répartition par statut</p>
        <div class="stats-status-bar">
          <div v-if="statsAccepted" class="stats-status-seg stats-status-seg--green"
            :style="{ width: (statsAccepted / props.quotes.length * 100) + '%' }"
            :title="'Acceptés : ' + statsAccepted"></div>
          <div v-if="statsSent" class="stats-status-seg stats-status-seg--blue"
            :style="{ width: (statsSent / props.quotes.length * 100) + '%' }"
            :title="'Envoyés : ' + statsSent"></div>
          <div v-if="statsPending" class="stats-status-seg stats-status-seg--amber"
            :style="{ width: (statsPending / props.quotes.length * 100) + '%' }"
            :title="'En attente : ' + statsPending"></div>
          <div v-if="statsRefused" class="stats-status-seg stats-status-seg--red"
            :style="{ width: (statsRefused / props.quotes.length * 100) + '%' }"
            :title="'Refusés : ' + statsRefused"></div>
        </div>
        <div class="stats-status-legend">
          <span class="stats-legend-dot stats-legend-dot--green"></span>Acceptés ({{ statsAccepted }})
          <span class="stats-legend-dot stats-legend-dot--blue"></span>Envoyés ({{ statsSent }})
          <span class="stats-legend-dot stats-legend-dot--amber"></span>En attente ({{ statsPending }})
          <span class="stats-legend-dot stats-legend-dot--red"></span>Refusés ({{ statsRefused }})
        </div>
      </div>

      <!-- CA par matière -->
      <div class="stats-section" v-if="statsByMaterial.length">
        <p class="stats-section-title">Chiffre d'affaires par matière</p>
        <div class="stats-bar-list">
          <div v-for="item in statsByMaterial" :key="item.mat" class="stats-bar-row">
            <span class="stats-bar-label">{{ item.mat }}</span>
            <div class="stats-bar-track">
              <div class="stats-bar-fill"
                :style="{ width: totalRevenue > 0 ? (item.revenue / totalRevenue * 100) + '%' : '0%' }">
              </div>
            </div>
            <span class="stats-bar-value">{{ fmtEur(item.revenue) }}</span>
            <span class="stats-bar-count">{{ item.count }} devis</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp } from 'lucide-vue-next'

const props = defineProps({
  quotes:  { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})

const statsAccepted        = computed(() => props.quotes.filter(q => ['accepted','Accepté'].includes(q.status)).length)
const statsRefused         = computed(() => props.quotes.filter(q => q.status === 'refused').length)
const statsSent            = computed(() => props.quotes.filter(q => q.status === 'sent').length)
const statsPending         = computed(() => props.quotes.filter(q => !q.status || q.status === 'pending').length)
const totalRevenue         = computed(() => props.quotes.reduce((a, q) => a + (q.total_cost || 0), 0))
const avgCost              = computed(() => props.quotes.length ? totalRevenue.value / props.quotes.length : 0)
const statsRevenueAccepted = computed(() =>
  props.quotes.filter(q => ['accepted','Accepté'].includes(q.status)).reduce((a, q) => a + (q.total_cost || 0), 0)
)
const statsByMaterial = computed(() => {
  const map = {}
  for (const q of props.quotes) {
    const mat = q.material || 'Inconnu'
    if (!map[mat]) map[mat] = { count: 0, revenue: 0 }
    map[mat].count++
    map[mat].revenue += q.total_cost || 0
  }
  return Object.entries(map).map(([mat, d]) => ({ mat, ...d })).sort((a, b) => b.revenue - a.revenue)
})
const statsAcceptanceRate = computed(() =>
  props.quotes.length ? Math.round(statsAccepted.value / props.quotes.length * 100) : 0
)

function fmtEur(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0) }
</script>

<style scoped>
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
  flex-shrink: 0;
}
.panel-title { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0; display: flex; align-items: center; gap: 0.4rem; }
.ptitle-icon { width: 0.78rem; height: 0.78rem; color: #667eea; flex-shrink: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; text-align: center; flex: 1;
}
.spinner {
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #2e9cab;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.stats-panel {
  flex: 1; overflow-y: auto; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1.5rem;
}
.stat-kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;
}
.stat-kpi {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;
}
.stat-kpi-label { font-size: 0.67rem; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.stat-kpi-value { font-size: 1.25rem; font-weight: 800; color: #1b2f39; margin: 0; letter-spacing: -0.02em; }
.stat-kpi-value--teal  { color: #2e9cab; }
.stat-kpi-value--green { color: #276749; }
.stat-kpi-value--red   { color: #c53030; }
.stat-kpi-value--blue  { color: #2b6cb0; }

.stats-section { display: flex; flex-direction: column; gap: 0.75rem; }
.stats-section-title {
  font-size: 0.72rem; font-weight: 800; color: #7c3aed;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}

.stats-status-bar {
  display: flex; height: 1rem; border-radius: 999px; overflow: hidden;
  background: #e2e8f0;
}
.stats-status-seg { transition: width 0.4s ease; }
.stats-status-seg--green { background: #48bb78; }
.stats-status-seg--blue  { background: #4299e1; }
.stats-status-seg--amber { background: #ecc94b; }
.stats-status-seg--red   { background: #fc8181; }
.stats-status-legend {
  display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;
  font-size: 0.72rem; font-weight: 600; color: #718096;
}
.stats-legend-dot {
  display: inline-block; width: 0.6rem; height: 0.6rem;
  border-radius: 50%; margin-right: 0.25rem;
}
.stats-legend-dot--green { background: #48bb78; }
.stats-legend-dot--blue  { background: #4299e1; }
.stats-legend-dot--amber { background: #ecc94b; }
.stats-legend-dot--red   { background: #fc8181; }

.stats-bar-list { display: flex; flex-direction: column; gap: 0.5rem; }
.stats-bar-row  { display: flex; align-items: center; gap: 0.75rem; }
.stats-bar-label {
  font-size: 0.78rem; font-weight: 700; color: #4a5568;
  width: 80px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.stats-bar-track {
  flex: 1; height: 0.55rem; background: #e2e8f0; border-radius: 999px; overflow: hidden;
}
.stats-bar-fill {
  height: 100%; background: linear-gradient(90deg, #3fb2bf 0%, #2e9cab 100%);
  border-radius: 999px; transition: width 0.4s ease;
}
.stats-bar-value { font-size: 0.78rem; font-weight: 800; color: #2e9cab; white-space: nowrap; width: 80px; text-align: right; flex-shrink: 0; }
.stats-bar-count { font-size: 0.67rem; color: #a0aec0; white-space: nowrap; flex-shrink: 0; }

@media (max-width: 760px) { .stat-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .stat-kpi-grid { grid-template-columns: 1fr 1fr; } }

@media (max-width: 1023px) {
  .panel-card  { flex: none; overflow: visible; }
  .stats-panel { flex: none; overflow-y: visible; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .panel-card  { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .stats-panel { flex: 1; overflow-y: auto; }
}
</style>
