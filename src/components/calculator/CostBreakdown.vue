<template>
  <div class="breakdown">

    <!-- Vue client : message d'attente -->
    <div v-if="!isAdmin" class="waiting-card">
      <span class="waiting-icon">📬</span>
      <div>
        <p class="waiting-title">Votre demande est bien reçue</p>
        <p class="waiting-sub">Votre prestataire va analyser votre projet et vous contactera avec le prix final du devis.</p>
      </div>
    </div>

    <!-- Vue admin : détail complet -->
    <template v-if="isAdmin">

    <button class="toggle-link" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '− Détail des coûts' : '+ Détail des coûts' }}
      <span class="advanced-hint">(réservé au prestataire)</span>
    </button>

    <div :class="['breakdown-grid', showAdvanced && 'breakdown-grid--2col']">

      <!-- Colonne gauche : détail des postes (prestataire) -->
      <div v-if="showAdvanced" class="col-left">
        <div class="group-label">Matière</div>
        <div class="line">
          <span class="line-label">Filament <span class="line-sub">({{ costs.totalWeight ?? 0 }} g)</span></span>
          <span class="line-value line-value--teal">{{ fmt(costs.materialCost) }}</span>
        </div>
        <!-- Détail par pièce si plusieurs -->
        <template v-if="costs.pieces && costs.pieces.length > 1">
          <div v-for="(p, i) in costs.pieces" :key="p.id || i" class="line line--sub">
            <span class="line-label line-label--sub">
              {{ p.name || `Pièce ${i + 1}` }}
              <span class="line-sub"> × {{ p.quantity }}</span>
            </span>
            <span class="line-value">{{ fmt(p.materialCost) }}</span>
          </div>
        </template>

        <div class="group-label mt">Équipement</div>
        <div class="line">
          <span class="line-label">Électricité <span class="line-sub">(~350 W)</span></span>
          <span class="line-value">{{ fmt(costs.electricity) }}</span>
        </div>
        <div class="line">
          <span class="line-label">Amortissement</span>
          <span class="line-value">{{ fmt(costs.amortization) }}</span>
        </div>
        <div class="line">
          <span class="line-label">Maintenance</span>
          <span class="line-value">{{ fmt(costs.maintenance) }}</span>
        </div>

        <div class="group-label mt">Main-d'œuvre & Divers</div>
        <div class="line">
          <span class="line-label">Main-d'œuvre</span>
          <span class="line-value">{{ fmt(costs.workCost) }}</span>
        </div>
        <div class="line">
          <span class="line-label">Emballage</span>
          <span class="line-value">{{ fmt(costs.packagingCost) }}</span>
        </div>
      </div>

      <!-- Colonne droite : récap coût de revient + prix de vente -->
      <div class="col-right">

        <!-- Coût de revient (admin) -->
        <div class="recap-card">
          <div class="recap-title">Coût de revient</div>

          <div class="recap-line">
            <span>Sous-total HT</span>
            <span>{{ fmt(costs.subtotal) }}</span>
          </div>
          <div v-if="taxRate > 0" class="recap-line">
            <span>TVA ({{ taxRate }} %)</span>
            <span>{{ fmt(costs.tax) }}</span>
          </div>

          <div class="recap-sep" />

          <div class="recap-line recap-line--cost">
            <span>{{ taxRate > 0 ? 'Revient TTC' : 'Coût total HT' }}</span>
            <span>{{ fmt(costs.totalCost) }}</span>
          </div>
          <div v-if="costs.quantity > 1" class="unit-line unit-line--muted">
            {{ costs.quantity }} unités · {{ fmt(costs.costPerUnit) }} / unité
          </div>
        </div>

        <!-- Prix de vente (avec marge) -->
        <div v-if="sellingPrices" class="recap-card recap-card--selling">
          <div class="recap-title recap-title--teal">
            Prix de vente · +{{ sellingPrices.margin }} %
          </div>

          <div class="recap-line">
            <span>Sous-total HT</span>
            <span>{{ fmt(sellingPrices.subtotalHT) }}</span>
          </div>
          <div v-if="taxRate > 0" class="recap-line">
            <span>TVA ({{ taxRate }} %)</span>
            <span>{{ fmt(sellingPrices.tax) }}</span>
          </div>

          <div class="recap-sep" />

          <div class="total-block">
            <span class="total-label">Total TTC client</span>
            <span class="total-value">{{ fmt(sellingPrices.totalTTC) }}</span>
          </div>

          <div v-if="costs.quantity > 1" class="unit-line">
            {{ costs.quantity }} unités · {{ fmt(sellingPrices.pricePerUnit) }} / unité
          </div>
        </div>

      </div>

    </div>

    </template><!-- fin v-if isAdmin -->

  </div>
</template>

<script>
export default {
  name: 'CostBreakdown',
  props: {
    isAdmin: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0 },
    costs: {
      type: Object,
      required: true,
      default: () => ({
        totalWeight: 0, materialCost: 0, electricity: 0, amortization: 0,
        maintenance: 0, workCost: 0, packagingCost: 0,
        subtotal: 0, tax: 0, totalCost: 0, costPerUnit: 0, quantity: 1,
      }),
    },
    sellingPrices: {
      type: Object,
      default: null,
    },
  },
  data() {
    return { showAdvanced: false }
  },
  methods: {
    fmt(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
    },
  },
}
</script>

<style scoped>
.breakdown {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-link {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.2s ease;
}
.toggle-link:hover { color: #2e9cab; }
.advanced-hint { font-weight: 400; font-size: 0.74rem; }

.breakdown-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

.breakdown-grid--2col {
  grid-template-columns: 1fr 1fr;
}

/* ── Colonne gauche ── */
.col-left {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.group-label {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0aec0;
  margin-bottom: 0.2rem;
}
.mt { margin-top: 0.6rem; }

.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.28rem 0;
  border-bottom: 1px solid #f0f4f8;
  gap: 0.5rem;
}

.line-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d3748;
}
.line-sub {
  font-size: 0.68rem;
  font-weight: 400;
  color: #a0aec0;
}
.line-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4a5568;
  white-space: nowrap;
}
.line-value--teal { color: #2e9cab; }

.line--sub { opacity: 0.85; }
.line-label--sub { padding-left: 0.75rem; font-size: 0.74rem; color: #718096; }

/* ── Colonne droite ── */
.col-right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recap-card {
  background: #f7f9fc;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.recap-card--selling {
  background: #f0fbfc;
  border-color: #b2e8ef;
}

.recap-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0aec0;
  margin-bottom: 0.15rem;
}

.recap-title--teal { color: #2e9cab; }

.recap-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #718096;
  font-weight: 600;
  padding: 0.15rem 0;
}

.recap-line--cost {
  font-size: 0.84rem;
  color: #4a5568;
  font-weight: 700;
}

.recap-sep {
  height: 1.5px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}

.total-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #2e9cab 0%, #1f7f97 100%);
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  margin-top: 0.1rem;
}

.total-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.total-value {
  font-size: 1.45rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}

.unit-line {
  font-size: 0.7rem;
  color: #a0aec0;
  text-align: center;
  margin-top: 0.4rem;
}

.unit-line--muted { margin-top: 0.2rem; }

/* ── Waiting card (client) ── */
.waiting-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.25rem 1.1rem;
  background: #f0fbfc;
  border: 1.5px solid #b2e8ef;
  border-radius: 14px;
}
.waiting-icon { font-size: 1.6rem; flex-shrink: 0; margin-top: 0.05rem; }
.waiting-title { font-size: 0.95rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.3rem; }
.waiting-sub { font-size: 0.8rem; color: #4a7f90; margin: 0; line-height: 1.5; }
</style>
