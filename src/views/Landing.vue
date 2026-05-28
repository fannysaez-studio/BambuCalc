<template>
  <div class="landing-page">
    <section class="landing-visual" aria-hidden="true">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <div class="visual-copy">
        <h1>Calculez vos impressions 3D sans friction</h1>
        <p>
          Une expérience claire et premium pour estimer vos coûts, préparer vos devis et suivre vos
          marges.
        </p>
      </div>

      <div class="visual-illustration">
        <div class="visual-composition">
          <img
            src="/bambu lab P2S Combo.webp"
            srcset="/.netlify/images?url=/bambu%20lab%20P2S%20Combo.webp&w=170&q=80 1x,
                    /.netlify/images?url=/bambu%20lab%20P2S%20Combo.webp&w=340&q=80 2x"
            alt="Bambu Lab P2S Combo"
            class="visual-printer"
            width="170" height="235"
            loading="lazy"
          />
          <img
            src="/bambuLab Filament.webp"
            srcset="/.netlify/images?url=/bambuLab%20Filament.webp&w=280&q=80 1x,
                    /.netlify/images?url=/bambuLab%20Filament.webp&w=560&q=80 2x"
            alt="Illustration organique turquoise"
            class="visual-main"
            fetchpriority="high"
            width="250" height="250"
          />
        </div>
      </div>
    </section>

    <section class="landing-panel">
      <div class="landing-card">
        <p class="landing-kicker">Calculateur de coûts d'impression 3D</p>
        <h2>Tout ce qu'il faut pour passer du prototype au devis.</h2>
        <p class="landing-description">
          Gardez le contrôle sur les matières, le temps machine, l'amortissement et les remises
          volume dans une interface unique.
        </p>

        <div class="landing-features">
          <div class="feature-card">
            <BarChart3 class="feature-icon" />
            <div class="feature-title">Calcul précis</div>
            <div class="feature-text">
              Matériau, équipement et main-d'œuvre regroupés dans un seul calcul.
            </div>
          </div>
          <div class="feature-card">
            <DollarSign class="feature-icon" />
            <div class="feature-title">Tarification flexible</div>
            <div class="feature-text">Adaptez vos marges selon le volume et le type de projet.</div>
          </div>
          <div class="feature-card">
            <Zap class="feature-icon" />
            <div class="feature-title">Séries maîtrisées</div>
            <div class="feature-text">Pilotez les remises et les coûts de production en série.</div>
          </div>
          <div class="feature-card">
            <Download class="feature-icon" />
            <div class="feature-title">Devis exportables</div>
            <div class="feature-text">Préparez et partagez vos devis en quelques secondes.</div>
          </div>
        </div>

        <div class="landing-cta">
          <router-link to="/signup" class="btn btn-primary">Créer un compte</router-link>
          <router-link to="/login" class="btn btn-secondary">Se connecter</router-link>
        </div>

        <div class="landing-legal">
          <router-link to="/mentions-legales">Mentions légales</router-link>
          <span>·</span>
          <router-link to="/privacy">Politique de confidentialité</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { BarChart3, DollarSign, Zap, Download } from 'lucide-vue-next'

export default {
  name: 'LandingView',
  components: {
    BarChart3,
    DollarSign,
    Zap,
    Download,
  },
}
</script>

<style scoped>
.landing-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem;
  background-image: url('/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  position: relative;
  box-sizing: border-box;
  overflow-x: hidden;
}

.landing-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.18) 100%);
  pointer-events: none;
  z-index: 0;
}

.landing-visual {
  position: relative;
  overflow: visible;
  border-radius: 28px 0 0 28px;
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: transparent;
  isolation: isolate;
  z-index: 2;
}

.landing-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #b1e5e29e;
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}

.landing-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px 0 0 28px;
  pointer-events: none;
  z-index: 2;
}

.visual-badge,
.visual-copy,
.visual-illustration {
  position: relative;
  z-index: 1;
}

.visual-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.badge-mark {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.65rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.62));
  position: relative;
  box-shadow: 0 8px 18px rgba(29, 10, 50, 0.18);
}

.badge-mark::before,
.badge-mark::after {
  content: '';
  position: absolute;
  inset: 0.25rem 0.45rem auto auto;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #ef7fa8;
  transform: rotate(35deg);
  box-shadow: -0.45rem 0.5rem 0 0 #f4c1cc;
}

.badge-mark::after {
  inset: auto auto 0.2rem 0.25rem;
  width: 0.9rem;
  height: 0.42rem;
  background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.2));
  border-radius: 999px;
  box-shadow: 0 -0.38rem 0 0 #fff;
  transform: rotate(-32deg);
}

.visual-copy {
  margin-top: 2.8rem;
  max-width: 100%;
  text-align: center;
}

.visual-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 2.9vw, 3rem);
  line-height: 1.03;
  letter-spacing: -0.03em;
  font-weight: 800;
  white-space: normal;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.visual-copy p {
  margin: 1rem 0 0;
  max-width: 100%;
  font-size: 1rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.visual-illustration {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-left: 0;
  overflow: visible;
  min-height: 21rem;
}

.visual-composition {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.2rem;
  transform: translateX(46px) translateY(-12px) rotate(-10deg);
  transform-origin: center bottom;
  isolation: isolate;
}

.visual-composition::before {
  content: '';
  position: absolute;
  inset: 10% 8% 0;
  background: radial-gradient(
    circle,
    rgba(46, 154, 171, 0.32) 0%,
    rgba(46, 154, 171, 0.18) 35%,
    rgba(46, 154, 171, 0.08) 55%,
    transparent 75%
  );
  filter: blur(26px);
  z-index: 0;
  pointer-events: none;
}

.visual-composition::after {
  content: '';
  position: absolute;
  inset: 18% 0 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 64%);
  filter: blur(20px);
  z-index: 0;
  pointer-events: none;
}

.visual-illustration img {
  height: auto;
  display: block;
  filter: drop-shadow(0 28px 44px rgba(8, 59, 82, 0.26));
  position: relative;
  z-index: 1;
}

.visual-printer {
  width: min(100%, 170px);
  max-width: 170px;
  margin: 0 0 1.2rem 0;
  transform: translateY(-22px);
}

.visual-main {
  width: min(100%, 250px);
  max-width: 280px;
  margin: 0 0 0 -1rem;
  transform: translateY(-6px);
}

.landing-panel {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  z-index: 1;
}

.landing-card {
  width: 100%;
  background: transparent;
  border-radius: 0 28px 28px 0;
  padding: 0.5rem 2rem 1.8rem; /* réduit */
  box-shadow: -8px 0 20px rgba(29, 18, 43, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  /* margin-left: -3px;  */
}

.landing-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0 28px 28px 0;
  pointer-events: none;
  z-index: 0;
}

.landing-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0 28px 28px 0;
  pointer-events: none;
  z-index: 2;
}

.landing-kicker {
  margin: 1rem 0 0;
  color: #4f7886;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  position: relative;
  z-index: 1;
}

.landing-card h2 {
  margin: 1.5rem 0 0; /* réduit de 3rem */
  font-size: clamp(0.35rem, 4.5vw, 1.85rem);
  line-height: 1.05;
  color: #1b2f39;
  letter-spacing: -0.03em;
  font-weight: 800;
  text-align: center;
  position: relative;
  z-index: 1;
}

.landing-description {
  margin: 0.6rem 0 0; /* réduit de 1rem */
  color: #4f6570;
  font-size: 0.8rem; /* réduit */
  line-height: 1.5;
  text-align: center;
  position: relative;
  z-index: 1;
}

.landing-features {
  margin-top: 1.8rem; /* réduit de 3.3rem */
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 148px));
  justify-content: center;
  gap: 0.35rem;
  position: relative;
  z-index: 1;
}

.feature-card {
  background: #f9fefe;
  border: 1px solid #cfe4e5;
  border-radius: 0.85rem;
  padding: 0.4rem; /* réduit */
  text-align: center;
  box-shadow: 0 10px 20px rgba(29, 18, 43, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 148px;
  min-height: 148px;
  aspect-ratio: 1;
}

.feature-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 20px 32px rgba(29, 18, 43, 0.12);
  border-color: #2e9cab;
  background: linear-gradient(135deg, #f9fefe 0%, rgba(46, 154, 171, 0.08) 100%);
}

.feature-icon {
  width: 1.45rem;
  height: 1.45rem;
  color: #2e9cab;
  margin-bottom: 0.3rem;
  flex-shrink: 0;
}

.feature-title {
  font-size: 0.72rem; /* réduit */
  font-weight: 700;
  color: #173645;
  margin-bottom: 0.1rem;
}

.feature-text {
  font-size: 0.66rem; /* réduit */
  line-height: 1.25;
  color: #4a6670;
}

.landing-cta {
  margin-top: 3.75rem; /* réduit de 3.6rem */
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  z-index: 1;
}

.landing-legal {
  margin-top: 2.5rem;
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  font-size: 0.78rem;
  color: #a0aec0;
}

.landing-legal a {
  color: #7a9099;
  text-decoration: none;
  transition: color 0.2s;
}

.landing-legal a:hover {
  color: #2e9cab;
}

.btn {
  padding: 0.8rem 1.6rem; /* réduit */
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem; /* réduit */
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: white;
  color: #1e7f97;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  border: 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 22px rgba(25, 108, 133, 0.28);
}

.btn-secondary:hover {
  filter: brightness(1.03);
  transform: translateY(-2px);
}

/* ===== Mobile : ≤ 768px ===== */
@media (max-width: 768px) {
  .landing-page {
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .landing-visual,
  .landing-card {
    border-radius: 18px;
  }

  .landing-visual::before,
  .landing-card::before {
    border-radius: 18px;
  }

  /* Bloc teal : plein écran, contenu réparti badge↑ copy↕ illustration↓ */
  .landing-visual {
    width: 100%;
    min-height: calc(100dvh - 1.5rem);
    padding: 1.25rem 1.1rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .visual-copy {
    margin-top: 0;
  }

  .visual-copy h1 {
    font-size: clamp(1.5rem, 7vw, 2rem);
  }

  .visual-copy p {
    font-size: 0.92rem;
    margin-top: 3rem;
  }

  /* Illustration : taille naturelle, poussée en bas par space-between */
  .visual-illustration {
    min-height: 0;
  }

  .visual-composition {
    transform: translateX(6px) translateY(0) rotate(-5deg);
    gap: 0;
  }

  .visual-printer {
    width: min(100%, 150px);
    max-width: 150px;
    transform: translateY(-10px);
  }

  .visual-main {
    width: min(100%, 230px);
    max-width: 230px;
    margin-left: -0.5rem;
    transform: translateY(-5px);
  }

  /* Bloc blanc : même min-height que le bloc teal */
  .landing-panel {
    min-height: calc(100dvh - 1.5rem);
  }

  .landing-card {
    padding: 2.25rem 1.4rem 2.25rem;
    justify-content: flex-start;
  }

  .landing-card h2 {
    font-size: clamp(1.35rem, 5.5vw, 1.7rem);
    margin-top: 1.5rem;
  }

  .landing-description {
    font-size: 0.8rem;
    /* margin-top: 1rem; */
  }

  .landing-features {
    grid-template-columns: 1fr;
    margin-top: 1.75rem;
    gap: 1rem;
  }

  /* Feature cards : horizontales (icône à gauche, texte à droite) */
  .feature-card {
    display: grid;
    grid-template-columns: 2.6rem 1fr;
    grid-template-rows: auto auto;
    column-gap: 0.9rem;
    row-gap: 0.15rem;
    align-items: center;
    text-align: left;
    padding: 0.9rem 1.1rem;
    min-height: 0;
    aspect-ratio: unset;
    max-width: none;
  }

  .feature-icon {
    grid-column: 1;
    grid-row: 1 / 3;
    width: 2.6rem;
    height: 2.6rem;
    padding: 0.5rem;
    background: rgba(46, 154, 171, 0.12);
    border-radius: 0.65rem;
    margin-bottom: 0;
    align-self: center;
    justify-self: center;
  }

  .feature-title {
    grid-column: 2;
    grid-row: 1;
    font-size: 0.88rem;
    align-self: end;
  }

  .feature-text {
    grid-column: 2;
    grid-row: 2;
    font-size: 0.75rem;
    line-height: 1.35;
    align-self: start;
  }

  .landing-cta {
    flex-direction: row;
    margin-top: 2rem;
    gap: 1.75rem;
  }

  .btn {
    flex: 1;
    text-align: center;
    padding: 0.9rem 0.75rem;
    font-size: 0.9rem;
  }
}

/* ===== Desktop only: hero 100dvh sans scroll ===== */
@media (min-width: 1025px) {
  /* 1. Bloquer la hauteur à exactement 100dvh et couper le débordement */
  .landing-page {
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
  }

  /* 2. Permettre aux colonnes du grid de se comprimer (min-height: auto → 0) */
  .landing-visual,
  .landing-panel {
    min-height: 0;
  }

  /* 3. L'illustration prend l'espace restant au lieu de tenir un min-height fixe */
  .visual-illustration {
    flex: 1;
    min-height: 0;
  }

  /* 4. Réduire les marges qui forcent le débordement vertical */
  .visual-copy {
    margin-top: 1.5rem;
  }

  .landing-cta {
    margin-top: 3.5rem;
  }
}

/* ===== Tablette : 769px – 1024px ===== */
@media (max-width: 1024px) and (min-width: 769px) {
  .landing-page {
    grid-template-columns: 1fr;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .landing-visual {
    padding: 2rem 2rem 1.5rem;
    justify-content: space-between;
    min-height: 52vh;
  }

  .visual-copy {
    margin-top: 0;
  }

  .visual-copy h1 {
    font-size: clamp(1.9rem, 4vw, 2.6rem);
  }

  .visual-copy p {
    font-size: 1rem;
    margin-top: 3rem;
  }

  .visual-illustration {
    min-height: 0;
  }

  .visual-composition {
    transform: translateX(20px) translateY(-4px) rotate(-8deg);
  }

  .visual-printer {
    width: min(100%, 160px);
    max-width: 160px;
  }

  .visual-main {
    width: min(100%, 240px);
    max-width: 240px;
  }

  .landing-card {
    padding: 2rem 2.25rem 2rem;
    justify-content: flex-start;
  }

  .landing-card h2 {
    font-size: clamp(1.6rem, 3.2vw, 2.1rem);
    margin-top: 1.25rem;
  }

  .landing-description {
    font-size: 1.85rem;
    margin-top: 0.82rem;
  }

  .landing-features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .feature-card {
    max-width: none;
    aspect-ratio: unset;
    min-height: 120px;
    padding: 1.1rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .feature-icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 0.4rem;
  }

  .feature-title {
    font-size: 0.8rem;
  }
  .feature-text {
    font-size: 0.72rem;
  }

  .landing-cta {
    margin-top: 1.75rem;
    gap: 1rem;
  }

  .btn {
    padding: 0.8rem 0.75rem;
    font-size: 0.88rem;
  }
}
</style>
