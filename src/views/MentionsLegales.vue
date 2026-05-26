<template>
  <div class="legal-page">
    <!-- Bloc gauche teal -->
    <section class="legal-visual">
      <div class="legal-logo">
        <Scale class="legal-logo-icon" />
      </div>
      <h1>Mentions légales</h1>
      <p class="legal-date">Conformément à la loi n° 2004-575 du 21 juin 2004 (LCEN)</p>
      <p class="legal-intro">
        Retrouvez ici toutes les informations légales relatives à l'éditeur du site, à l'hébergement
        et à vos droits.
      </p>

      <nav class="legal-nav" aria-label="Sections">
        <p class="nav-label">Sommaire</p>
        <a
          v-for="item in sections"
          :key="item.id"
          :class="['legal-nav-link', { active: activeSection === item.id }]"
          @click.prevent="scrollTo(item.id)"
          href="#"
        >
          <span class="nav-dot" />
          {{ item.label }}
        </a>
      </nav>

      <router-link to="/" class="back-btn">← Retour à l'accueil</router-link>
    </section>

    <!-- Bloc droit contenu -->
    <section class="legal-content">
      <section id="s1" class="legal-section">
        <h2>1. Éditeur du site</h2>
        <p>
          <strong>BambuCalc</strong><br />
          Responsable : Fanny Saez<br />
          143 bis Boulevard Lafayette, 63000 Clermont-Ferrand, France<br />
          Contact : <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
      </section>

      <section id="s2" class="legal-section">
        <h2>2. Hébergement</h2>
        <p>
          Le site BambuCalc est hébergé par :<br />
          <strong>Netlify, Inc.</strong><br />
          44 Montgomery Street, Suite 300<br />
          San Francisco, CA 94104, États-Unis<br />
          <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer"
            >www.netlify.com</a
          >
        </p>
        <p>
          La base de données est hébergée par :<br />
          <strong>Supabase Inc.</strong> — région Europe (Frankfurt)<br />
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
        </p>
      </section>

      <section id="s3" class="legal-section">
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur BambuCalc (textes, images, logo, code source) est la
          propriété exclusive de Fanny Saez, sauf mention contraire. Toute reproduction,
          représentation, modification ou exploitation non autorisée est strictement interdite.
        </p>
      </section>

      <section id="s4" class="legal-section">
        <h2>4. Données personnelles</h2>
        <p>
          La collecte et le traitement des données personnelles des utilisateurs sont décrits dans
          notre
          <router-link to="/privacy">politique de confidentialité</router-link>.
        </p>
      </section>

      <section id="s5" class="legal-section">
        <h2>5. Responsabilité</h2>
        <p>
          BambuCalc s'efforce de fournir des informations exactes et à jour. Toutefois, des erreurs
          ou omissions peuvent subsister. L'éditeur ne peut être tenu responsable des dommages
          directs ou indirects résultant de l'utilisation du site ou de l'inexactitude des
          informations.
        </p>
      </section>

      <section id="s6" class="legal-section" style="border-bottom: none">
        <h2>6. Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions légales ou au fonctionnement du site
          :<br />
          <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
      </section>
    </section>
  </div>
</template>

<script>
import { Scale } from 'lucide-vue-next'

export default {
  name: 'MentionsLegales',
  components: { Scale },
  data() {
    return {
      activeSection: 's1',
      sections: [
        { id: 's1', label: '1. Éditeur du site' },
        { id: 's2', label: '2. Hébergement' },
        { id: 's3', label: '3. Propriété intellectuelle' },
        { id: 's4', label: '4. Données personnelles' },
        { id: 's5', label: '5. Responsabilité' },
        { id: 's6', label: '6. Contact' },
      ],
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      const offset = 140
      let current = this.sections[0].id
      for (const { id } of this.sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= offset) {
          current = id
        }
      }
      this.activeSection = current
    },
    scrollTo(id) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
  },
}
</script>

<style scoped>
/* ── Base ── */
.legal-page {
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  background: #f0f4f8;
}

/* ── Bloc teal gauche ── */
.legal-visual {
  background: linear-gradient(160deg, #b1e5e2 0%, #8dd4d0 100%);
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.legal-logo {
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(46, 154, 171, 0.35);
}

.legal-logo-icon {
  width: 2rem;
  height: 2rem;
  color: #fff;
}

.legal-visual h1 {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.legal-date {
  font-size: 0.82rem;
  color: #4f7886;
  margin: 0;
  font-weight: 500;
}

.legal-intro {
  font-size: 0.9rem;
  color: #2d5f6e;
  line-height: 1.65;
  margin: 0;
}

/* ── Nav sommaire ── */
.legal-nav {
  display: none;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 0.25rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4f7886;
  margin: 0 0 0.5rem 0.75rem;
}

.legal-nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.81rem;
  font-weight: 500;
  color: #2d5f6e;
  text-decoration: none;
  transition:
    background 0.18s,
    color 0.18s,
    border-color 0.18s;
  border-left: 2px solid transparent;
  cursor: pointer;
}

.legal-nav-link:hover {
  background: rgba(46, 156, 171, 0.1);
  color: #1b2f39;
}

.legal-nav-link.active {
  background: rgba(46, 156, 171, 0.18);
  border-left-color: #2e9cab;
  color: #1b2f39;
  font-weight: 700;
}

.nav-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4f7886;
  flex-shrink: 0;
  transition:
    background 0.18s,
    transform 0.18s;
}

.legal-nav-link.active .nav-dot {
  background: #2e9cab;
  transform: scale(1.4);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #1f7f97;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  margin-top: auto;
  transition: opacity 0.2s;
}
.back-btn:hover {
  opacity: 0.75;
}

/* ── Bloc blanc droite ── */
.legal-content {
  background: #fff;
  padding: 2.5rem 2.5rem 3rem;
}

.legal-section {
  padding-bottom: 1.75rem;
  margin-bottom: 1.75rem;
  border-bottom: 1px solid #e2e8f0;
}

h2 {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #e8f7f9;
}

p,
li {
  font-size: 0.88rem;
  color: #4a5568;
  line-height: 1.75;
  margin: 0 0 0.5rem;
}

a {
  color: #2e9cab;
  font-weight: 600;
}
a:hover {
  text-decoration: underline;
}

/* ── Mobile : empilement ── */
@media (max-width: 768px) {
  .legal-page {
    background: #fff;
  }
  .legal-visual {
    padding: 2rem 1.25rem 1.75rem;
    gap: 0.9rem;
  }
  .legal-visual h1 {
    font-size: 1.5rem;
  }
  .back-btn {
    margin-top: 0.5rem;
  }
  .legal-content {
    padding: 1.75rem 1.25rem 5rem;
  }
}

/* ── Tablette ── */
@media (max-width: 1024px) and (min-width: 769px) {
  .legal-visual {
    padding: 2.5rem 2rem;
  }
  .legal-content {
    padding: 2rem 2rem 4rem;
  }
}

/* ── Desktop : 2 colonnes comme la landing ── */
@media (min-width: 1025px) {
  .legal-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(460px, 1.1fr);
    min-height: 100dvh;
    padding: 1rem;
    gap: 0;
    background-image: url('/hero-vagues.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .legal-visual {
    border-radius: 28px 0 0 28px;
    padding: 3rem 2.5rem;
    position: sticky;
    top: 1rem;
    align-self: start;
    gap: 2.25rem;
    background: rgba(177, 229, 226, 0.72);
  }
  .legal-nav {
    display: flex;
  }
  .legal-content {
    border-radius: 0 28px 28px 0;
    padding: 3rem 3rem 4rem;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    overflow-y: auto;
  }
}
</style>
