<template>
  <div class="pricing-wrap">

    <!-- Message client -->
    <div class="info-card">
      <span class="info-icon">🏷️</span>
      <div>
        <p class="info-title">Tarification</p>
        <p class="info-sub">Le tarif final sera déterminé par votre prestataire selon votre profil client et les coûts de fabrication.</p>
      </div>
    </div>

    <button class="toggle-link" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '− Options avancées' : '+ Options avancées' }}
      <span class="advanced-hint">(réservé au prestataire)</span>
    </button>

    <div v-if="showAdvanced" class="advanced-block">

      <!-- Options de tarification -->
      <div class="option-list">
        <button
          v-for="opt in pricingOptions"
          :key="opt.id"
          :class="['option-row', selectedPricing === opt.id && 'option-row--active']"
          @click="$emit('update:selectedPricing', opt.id)"
          type="button"
        >
          <span class="opt-radio">
            <span v-if="selectedPricing === opt.id" class="opt-radio-dot" />
          </span>
          <div class="opt-body">
            <span class="opt-name">{{ opt.name }}</span>
            <span class="opt-desc">{{ opt.desc }}</span>
          </div>
          <span class="opt-tag">+{{ opt.margin }}%</span>
          <span class="opt-price">{{ fmt(priceWithTax(opt.margin)) }}</span>
          <span class="opt-ttc">TTC</span>
        </button>
      </div>

      <!-- Marge personnalisée -->
      <div class="custom-block">
        <div class="custom-top">
          <span class="custom-label">Personnalisé</span>
          <span class="custom-price">{{ fmt(priceWithTax(customMargin)) }} TTC</span>
        </div>
        <div class="custom-row">
          <input
            class="slider"
            type="range"
            :value="customMargin"
            @input="$emit('update:customMargin', Number($event.target.value))"
            min="0" max="200" step="1"
          />
          <div class="pct-box">
            <input
              type="number"
              :value="customMargin"
              @input="$emit('update:customMargin', Number($event.target.value))"
              min="0" max="200" step="1"
            />
            <span>%</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'PricingSuggestions',
  props: {
    baseCost:       { type: Number, default: 0 },
    baseCostPerUnit:{ type: Number, default: 0 },
    taxRate:        { type: Number, default: 20 },
    selectedPricing:{ type: String, default: 'standard' },
    customMargin:   { type: Number, default: 50 },
    seriesQuantity: { type: Number, default: 1 },
    volumeDiscount: { type: Number, default: 0 },
  },
  emits: ['update:selectedPricing', 'update:customMargin'],
  data() {
    return {
      showAdvanced: false,
      pricingOptions: [
        { id: 'ami',      name: 'Ami / Asso',    margin: 15, desc: 'Proches, associations' },
        { id: 'standard', name: 'Particulier',   margin: 40, desc: 'Client individuel'     },
        { id: 'pro',      name: 'Professionnel', margin: 65, desc: 'Entreprise, B2B'       },
      ],
    }
  },
  methods: {
    priceWithTax(margin) {
      const base = this.baseCostPerUnit > 0 ? this.baseCostPerUnit : this.baseCost
      const withMargin = base + (base * margin) / 100
      return Math.round(withMargin * (1 + this.taxRate / 100) * 100) / 100
    },
    fmt(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v)
    },
  },
}
</script>

<style scoped>
.pricing-wrap {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  background: #f0fbfc;
  border: 1.5px solid #b2e8ef;
  border-radius: 14px;
}
.info-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 0.05rem; }
.info-title { font-size: 0.88rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.2rem; }
.info-sub { font-size: 0.78rem; color: #4a7f90; margin: 0; line-height: 1.5; }

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

.advanced-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Liste d'options ── */
.option-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s ease;
}

.option-row:hover {
  border-color: #2e9cab;
  background: #f8fffe;
}

.option-row--active {
  border-color: #2e9cab;
  background: #e8f7f9;
}

.opt-radio {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.18s ease;
}

.option-row--active .opt-radio {
  border-color: #2e9cab;
}

.opt-radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #2e9cab;
}

.opt-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.opt-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1b2f39;
}

.opt-desc {
  font-size: 0.7rem;
  color: #a0aec0;
  font-weight: 500;
}

.opt-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #2e9cab;
  background: rgba(46,156,171,0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.opt-price {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  white-space: nowrap;
  flex-shrink: 0;
}

.opt-ttc {
  font-size: 0.68rem;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Marge personnalisée ── */
.custom-block {
  padding: 1rem;
  border-radius: 12px;
  background: #f7f9fc;
  border: 1.5px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.custom-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #4a5568;
}

.custom-price {
  font-size: 1rem;
  font-weight: 800;
  color: #2e9cab;
  white-space: nowrap;
}

.custom-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  flex: 1;
  accent-color: #2e9cab;
}

.pct-box {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  background: #fff;
}

.pct-box input {
  width: 3rem;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  background: transparent;
  font-family: inherit;
}

.pct-box span {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 600;
}

@media (max-width: 480px) {
  .pricing-wrap { padding: 1rem; }
  .opt-name { min-width: 70px; }
}
</style>
