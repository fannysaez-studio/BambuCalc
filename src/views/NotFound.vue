<template>
  <div class="nf-page">
    <!-- Blobs animés en arrière-plan -->
    <div class="nf-blob nf-blob-1"></div>
    <div class="nf-blob nf-blob-2"></div>
    <div class="nf-blob nf-blob-3"></div>

    <!-- Particules flottantes -->
    <div class="nf-particles">
      <span class="particle p1"></span>
      <span class="particle p2"></span>
      <span class="particle p3"></span>
      <span class="particle p4"></span>
      <span class="particle p5"></span>
      <span class="particle p6"></span>
    </div>

    <div class="nf-card">
      <!-- 404 animé -->
      <div class="nf-digits">
        <span class="digit d1">4</span>
        <span class="digit d0">
          0
          <span class="ring"></span>
          <span class="ring ring-2"></span>
        </span>
        <span class="digit d2">4</span>
      </div>

      <h1 class="nf-title">Page introuvable</h1>
      <p class="nf-sub">
        Oups ! Cette page s'est perdue dans l'espace.<br />
        Revenez à l'accueil pour continuer.
      </p>

      <div class="nf-actions">
        <router-link to="/" class="btn-home">← Accueil</router-link>
        <router-link v-if="isAuth" to="/dashboard" class="btn-dash">
          Mon tableau de bord
        </router-link>
      </div>
    </div>

    <p class="nf-brand">BambuCalc</p>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase'

export default {
  name: 'NotFound',
  data() {
    return { isAuth: false }
  },
  async created() {
    const { data } = await supabase.auth.getSession()
    this.isAuth = !!data.session
  },
}
</script>

<style scoped>
.nf-page {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  background: linear-gradient(135deg, #071e26 0%, #0d3d4e 35%, #145f73 65%, #1e8599 100%);
  background-size: 300% 300%;
  animation: bgShift 10s ease infinite;
  position: relative;
  overflow: hidden;
}

@keyframes bgShift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

/* ── Blobs ── */
.nf-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.nf-blob-1 {
  width: 520px; height: 520px;
  background: rgba(46, 156, 171, 0.35);
  top: -180px; left: -160px;
  animation: blob1 11s ease-in-out infinite;
}
.nf-blob-2 {
  width: 420px; height: 420px;
  background: rgba(177, 229, 226, 0.2);
  bottom: -120px; right: -120px;
  animation: blob2 14s ease-in-out infinite;
}
.nf-blob-3 {
  width: 320px; height: 320px;
  background: rgba(63, 178, 191, 0.18);
  top: 50%; left: 55%;
  transform: translate(-50%, -50%);
  animation: blob3 18s ease-in-out infinite;
}

@keyframes blob1 {
  0%, 100% { transform: translate(0, 0); }
  33%       { transform: translate(50px, 35px); }
  66%       { transform: translate(-25px, -45px); }
}
@keyframes blob2 {
  0%, 100% { transform: translate(0, 0); }
  40%       { transform: translate(-35px, -25px); }
  70%       { transform: translate(25px, 35px); }
}
@keyframes blob3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%       { transform: translate(-50%, -50%) scale(1.4); }
}

/* ── Particules ── */
.nf-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}
.p1 { width: 10px; height: 10px; top: 14%; left: 9%;   animation: pfloat 6s  ease-in-out infinite; }
.p2 { width: 6px;  height: 6px;  top: 22%; right: 13%; animation: pfloat 8s  ease-in-out infinite 1.2s; }
.p3 { width: 14px; height: 14px; bottom: 28%; left: 18%; border-radius: 999px; animation: pfloat 7s ease-in-out infinite 2.1s; }
.p4 { width: 8px;  height: 8px;  top: 62%; right: 22%;  animation: pfloat 9s  ease-in-out infinite 0.6s; }
.p5 { width: 12px; height: 12px; bottom: 14%; right: 9%; animation: pfloat 5s ease-in-out infinite 1.8s; }
.p6 { width: 6px;  height: 6px;  top: 44%; left: 7%;    border-radius: 999px; animation: pfloat 11s ease-in-out infinite 3.4s; }

@keyframes pfloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg);    opacity: 0.35; }
  50%       { transform: translate(16px, -28px) rotate(180deg); opacity: 0.85; }
}

/* ── Card ── */
.nf-card {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 3rem 2.5rem;
  max-width: 460px;
  width: 100%;
  text-align: center;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.12);
  animation: cardIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(36px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* ── 404 ── */
.nf-digits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.05em;
  margin-bottom: 1.5rem;
  line-height: 1;
}

.digit {
  font-size: clamp(4.5rem, 16vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #fff;
  text-shadow:
    0 0 60px rgba(63, 178, 191, 0.9),
    0 0 20px rgba(63, 178, 191, 0.5),
    0 6px 20px rgba(0, 0, 0, 0.35);
  display: block;
}

.d1 { animation: digitIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s  both, digitFloat 4s ease-in-out 0.65s infinite; }
.d0 {
  position: relative;
  animation: digitIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s both, digitFloat 4s ease-in-out 0.8s  infinite;
  color: transparent;
  -webkit-text-stroke: 3px rgba(255, 255, 255, 0.88);
  filter: drop-shadow(0 0 18px rgba(63, 178, 191, 0.7));
}
.d2 { animation: digitIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s  both, digitFloat 4s ease-in-out 0.95s infinite; }

@keyframes digitIn {
  from { opacity: 0; transform: translateY(28px) scale(0.7); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes digitFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-9px); }
}

/* Rings autour du 0 */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(177, 229, 226, 0.65);
  inset: -14px;
  animation: ringPulse 2.2s ease-out infinite;
  pointer-events: none;
}
.ring-2 {
  inset: -28px;
  border-color: rgba(177, 229, 226, 0.28);
  animation: ringPulse 2.2s ease-out 0.55s infinite;
}

@keyframes ringPulse {
  0%   { transform: scale(0.75); opacity: 1; }
  100% { transform: scale(1.5);  opacity: 0; }
}

/* ── Texte ── */
.nf-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.nf-sub {
  font-size: 0.93rem;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.75;
  margin: 0 0 2rem;
}

/* ── Boutons ── */
.nf-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  padding: 0.72rem 1.7rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(46, 156, 171, 0.5);
  transition: filter 0.2s, transform 0.2s;
}
.btn-home:hover { filter: brightness(1.1); transform: translateY(-2px); }

.btn-dash {
  display: inline-flex;
  align-items: center;
  padding: 0.72rem 1.7rem;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.btn-dash:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }

/* ── Brand ── */
.nf-brand {
  position: relative;
  z-index: 2;
  margin-top: 2rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
}

/* ── Desktop ≥ 1101px ── */
@media (min-width: 1101px) {
  .nf-page {
    height: 100dvh;
    overflow: hidden;
  }
}

/* ── Tablette 769px – 1100px ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .nf-blob-1 { width: 380px; height: 380px; }
  .nf-blob-2 { width: 300px; height: 300px; }
  .nf-blob-3 { width: 240px; height: 240px; }

  .nf-card {
    max-width: 420px;
    padding: 2.75rem 2.25rem;
  }

  .digit {
    font-size: clamp(4rem, 12vw, 5.5rem);
  }

  .nf-title { font-size: 1.4rem; }
  .nf-sub   { font-size: 0.9rem; }
}

/* ── Mobile ≤ 768px ── */
@media (max-width: 768px) {
  .nf-page {
    padding: 1.5rem 1rem;
    justify-content: center;
  }

  /* Blobs réduits pour ne pas déborder */
  .nf-blob-1 { width: 260px; height: 260px; top: -80px;  left: -80px; }
  .nf-blob-2 { width: 220px; height: 220px; bottom: -70px; right: -70px; }
  .nf-blob-3 { width: 180px; height: 180px; }

  /* Particules repositionnées dans les bords */
  .p1 { top: 8%;  left: 6%; }
  .p2 { top: 12%; right: 8%; }
  .p3 { bottom: 20%; left: 10%; }
  .p4 { top: 55%; right: 12%; }
  .p5 { bottom: 8%; right: 6%; }
  .p6 { top: 38%; left: 5%; }

  .nf-card {
    padding: 2.25rem 1.5rem;
    border-radius: 22px;
    max-width: 100%;
  }

  .nf-digits { margin-bottom: 1.25rem; }

  .digit {
    font-size: clamp(3.5rem, 18vw, 5rem);
  }

  .d0 { -webkit-text-stroke: 2px rgba(255, 255, 255, 0.88); }

  .ring   { inset: -10px; }
  .ring-2 { inset: -20px; }

  .nf-title {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }

  .nf-sub {
    font-size: 0.88rem;
    margin-bottom: 1.5rem;
    line-height: 1.65;
  }

  .nf-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  .btn-home,
  .btn-dash {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .nf-brand { margin-top: 1.5rem; font-size: 0.75rem; }
}

/* ── Très petit mobile ≤ 390px ── */
@media (max-width: 390px) {
  .nf-card { padding: 2rem 1.25rem; }

  .digit { font-size: clamp(3rem, 20vw, 4rem); }

  .nf-title { font-size: 1.2rem; }
  .nf-sub   { font-size: 0.84rem; }
}
</style>
