<template>
  <div class="rdv-page">

    <!-- ── Hero teal ── -->
    <section class="rdv-hero">
      <router-link to="/contact" class="rdv-back">
        <ArrowLeft :size="16" />
        Retour
      </router-link>

      <div class="rdv-hero-body">
        <div class="rdv-badge">
          <span class="rdv-badge-dot"></span>
          <span>BambuCalc</span>
        </div>
        <h1 class="rdv-title">Prendre un rendez-vous</h1>
        <p class="rdv-subtitle">Échangeons sur votre projet d'impression 3D.<br>Choisissez un créneau qui vous convient.</p>

        <div class="rdv-info-list">
          <div class="rdv-info-item">
            <Clock :size="15" class="rdv-info-icon" />
            <span>30 minutes</span>
          </div>
          <div class="rdv-info-item">
            <Video :size="15" class="rdv-info-icon" />
            <span>Visioconférence</span>
          </div>
          <div class="rdv-info-item">
            <MapPin :size="15" class="rdv-info-icon" />
            <span>Clermont-Ferrand</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Calendly inline ── -->
    <section class="rdv-cal-section">
      <div class="rdv-cal-wrap">
        <div
          class="calendly-inline-widget"
          data-url="https://calendly.com/fannysaez-pro/30min?hide_landing_page_details=1&hide_gdpr_banner=1&primary_color=2e9cab"
        ></div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Clock, Video, MapPin } from 'lucide-vue-next'

let script = null

onMounted(() => {
  script = document.createElement('script')
  script.src = 'https://assets.calendly.com/assets/external/widget.js'
  script.async = true
  document.head.appendChild(script)
})

onUnmounted(() => {
  if (script && document.head.contains(script)) {
    document.head.removeChild(script)
  }
})
</script>

<style scoped>
.rdv-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Hero ── */
.rdv-hero {
  background: linear-gradient(135deg, #1b2f39 0%, #2e9cab 100%);
  padding: 2rem 2rem 2.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rdv-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
  transition: color 0.15s;
}
.rdv-back:hover { color: #fff; }

.rdv-hero-body {
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}

.rdv-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.04em;
  margin-bottom: 1rem;
}
.rdv-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #7ee8a2;
}

.rdv-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.6rem;
  line-height: 1.2;
}

.rdv-subtitle {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.75);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.rdv-info-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.rdv-info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.85);
  font-size: 0.82rem;
  font-weight: 500;
}
.rdv-info-icon { color: #7ee8a2; flex-shrink: 0; }

/* ── Calendly ── */
.rdv-cal-section {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem 3rem;
}

.rdv-cal-wrap {
  width: 100%;
  max-width: 780px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.calendly-inline-widget {
  min-width: 320px;
  height: 700px;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .rdv-hero { padding: 1.25rem 1rem 1.75rem; }
  .rdv-title { font-size: 1.4rem; }
  .rdv-info-list { gap: 1rem; }
  .rdv-cal-section { padding: 1rem 0 5rem; }
  .rdv-cal-wrap { border-radius: 0; border-left: none; border-right: none; }
  .calendly-inline-widget { height: 650px; }
}
</style>
