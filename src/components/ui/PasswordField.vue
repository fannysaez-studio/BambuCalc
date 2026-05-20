<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue:   { type: String,  default: '' },
  label:        { type: String,  default: 'Mot de passe' },
  id:           { type: String,  default: 'pf-password' },
  placeholder:  { type: String,  default: '••••••••' },
  showStrength: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

const rules = computed(() => [
  {
    label: 'Majuscule & minuscule',
    ok: /[a-z]/.test(props.modelValue) && /[A-Z]/.test(props.modelValue),
  },
  {
    label: 'Chiffre (0-9)',
    ok: /[0-9]/.test(props.modelValue),
  },
  {
    label: 'Caractère spécial (!@#$%^&*)',
    ok: /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(props.modelValue),
  },
  {
    label: '8 caractères minimum',
    ok: props.modelValue.length >= 8,
  },
])

const strength = computed(() => rules.value.filter(r => r.ok).length)

const barColor = computed(() => {
  if (strength.value <= 1) return '#e53e3e'
  if (strength.value === 2) return '#d69e2e'
  if (strength.value === 3) return '#2e9cab'
  return '#2e9cab'
})

const strengthLabel = computed(() => {
  if (strength.value === 0) return ''
  if (strength.value === 1) return 'Faible'
  if (strength.value === 2) return 'Moyen'
  if (strength.value === 3) return 'Bon'
  return 'Fort'
})

const isValid = computed(() => rules.value.every(r => r.ok))
defineExpose({ isValid })
</script>

<template>
  <div class="pf-wrap">
    <label :for="id" class="pf-label">{{ label }}</label>
    <div class="pf-input-wrap">
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        class="pf-input"
        autocomplete="new-password"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <button type="button" class="pf-eye" :title="visible ? 'Masquer' : 'Afficher'" @click="visible = !visible">
        <EyeOff v-if="visible" class="pf-eye-icon" />
        <Eye v-else class="pf-eye-icon" />
      </button>
    </div>

    <div v-if="showStrength && modelValue.length > 0" class="pf-strength">
      <!-- Barre -->
      <div class="pf-bar-track">
        <div
          class="pf-bar-fill"
          :style="{ width: (strength / 4 * 100) + '%', background: barColor }"
        />
      </div>
      <span class="pf-strength-lbl" :style="{ color: barColor }">{{ strengthLabel }}</span>

      <!-- Règles -->
      <ul class="pf-rules">
        <li v-for="rule in rules" :key="rule.label" :class="['pf-rule', rule.ok && 'pf-rule--ok']">
          <span class="pf-dot" />
          {{ rule.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pf-wrap { display: grid; gap: 0.38rem; }

.pf-label {
  font-size: 0.72rem;
  color: #5b5a61;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 600;
}

.pf-input-wrap { position: relative; display: flex; align-items: center; }

.pf-input {
  width: 100%;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  min-height: 2.9rem;
  padding: 0.72rem 2.8rem 0.72rem 0.95rem;
  font: inherit;
  font-size: 0.94rem;
  color: #1f1e23;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.pf-input::placeholder { color: #9b98a1; }
.pf-input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46,154,171,0.16);
}

.pf-eye {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s ease;
}
.pf-eye:hover { color: #2e9cab; }
.pf-eye-icon { width: 1.05rem; height: 1.05rem; }

/* ── Strength indicator ── */
.pf-strength {
  margin-top: 0.5rem;
  background: #f7f9fc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.pf-bar-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.pf-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease, background 0.3s ease;
}

.pf-strength-lbl {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color 0.3s ease;
}

.pf-rules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.pf-rule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #a0aec0;
  transition: color 0.2s ease;
}
.pf-rule--ok { color: #2e9cab; }

.pf-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.pf-rule--ok .pf-dot { background: #2e9cab; }
</style>
