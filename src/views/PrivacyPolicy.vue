<template>
  <div class="legal-page">
    <!-- Bloc gauche teal -->
    <section class="legal-visual">
      <div class="legal-logo">
        <ShieldCheck class="legal-logo-icon" />
      </div>
      <h1>Politique de confidentialité</h1>
      <p class="legal-date">Dernière mise à jour : {{ lastUpdate }}</p>
      <p class="legal-intro">
        Découvrez comment BambuCalc collecte, utilise et protège vos données personnelles
        conformément au RGPD.
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

      <router-link to="/signup" class="back-btn">← Retour à l'inscription</router-link>
    </section>

    <!-- Bloc droit contenu -->
    <section class="legal-content">
      <section id="s1" class="legal-section">
        <h2>1. Responsable du traitement</h2>
        <p>
          <strong>BambuCalc</strong> — Fanny Saez<br />
          63000 Clermont-Ferrand, France<br />
          Contact : <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
      </section>

      <section id="s2" class="legal-section">
        <h2>2. Données collectées</h2>
        <p>Dans le cadre de l'utilisation de BambuCalc, nous collectons les données suivantes :</p>
        <ul>
          <li>
            <strong>Compte :</strong> prénom, nom, adresse e-mail, mot de passe (hashé — non
            lisible)
          </li>
          <li>
            <strong>Devis :</strong> informations client (nom, adresse, téléphone, e-mail, SIRET),
            données d'impression (poids, matière, durée), calculs de coûts
          </li>
          <li>
            <strong>Connexion :</strong> adresse IP, navigateur, date de connexion (via Supabase
            Auth)
          </li>
        </ul>
      </section>

      <section id="s3" class="legal-section">
        <h2>3. Finalités du traitement</h2>
        <table class="privacy-table">
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion de votre compte</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Génération et stockage de vos devis</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Sécurité et prévention des fraudes</td>
              <td>Intérêt légitime</td>
            </tr>
            <tr>
              <td>Amélioration du service</td>
              <td>Intérêt légitime</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="s4" class="legal-section">
        <h2>4. Durée de conservation</h2>
        <ul>
          <li><strong>Données de compte :</strong> jusqu'à suppression de votre compte</li>
          <li><strong>Devis :</strong> jusqu'à suppression manuelle ou suppression du compte</li>
          <li><strong>Logs de connexion :</strong> 90 jours (gérés par Supabase)</li>
        </ul>
      </section>

      <section id="s5" class="legal-section">
        <h2>5. Hébergement & sous-traitants</h2>
        <p>
          BambuCalc utilise <strong>Supabase</strong> (base de données et authentification), hébergé
          sur des serveurs situés dans l'Union Européenne. Supabase est conforme au RGPD.
        </p>
        <p>
          Le service est hébergé sur <strong>Netlify, Inc.</strong> (CDN international, conforme aux
          clauses contractuelles types SCCs). Aucune donnée n'est revendue à des tiers.
        </p>
      </section>

      <section id="s6" class="legal-section">
        <h2>6. Sécurité</h2>
        <ul>
          <li>
            Les mots de passe sont hashés par <strong>Supabase Auth</strong> (algorithme bcrypt côté
            serveur) — ils ne sont jamais stockés en clair ni accessibles
          </li>
          <li>Les communications sont chiffrées via <strong>HTTPS / TLS</strong></li>
          <li>
            Les accès à la base de données sont protégés par des politiques
            <strong>RLS (Row Level Security)</strong>
          </li>
          <li>Chaque utilisateur ne peut accéder qu'à ses propres données</li>
        </ul>
      </section>

      <section id="s7" class="legal-section">
        <h2>7. Vos droits (RGPD)</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des
          droits suivants :
        </p>
        <ul>
          <li>
            <strong>Droit d'accès :</strong> consulter toutes vos données depuis votre tableau de
            bord
          </li>
          <li><strong>Droit de rectification :</strong> modifier vos informations à tout moment</li>
          <li>
            <strong>Droit à l'effacement :</strong> supprimer vos devis et votre compte depuis le
            tableau de bord
          </li>
          <li><strong>Droit à la portabilité :</strong> export PDF de vos devis disponible</li>
          <li><strong>Droit d'opposition :</strong> contactez-nous par e-mail</li>
        </ul>
        <p>
          Pour exercer ces droits ou pour toute question :
          <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
        <p>
          En cas de litige, vous pouvez saisir la <strong>CNIL</strong> :
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>
        </p>
      </section>

      <section id="s8" class="legal-section" style="border-bottom: none">
        <h2>8. Cookies</h2>
        <p>
          BambuCalc n'utilise pas de cookies de tracking ou publicitaires. Un cookie de session est
          utilisé uniquement pour maintenir votre connexion (cookie technique, exempté de
          consentement).
        </p>
        <p>
          Si vous choisissez de régler votre commande en ligne, le service
          <strong>Stripe</strong> (Stripe, Inc. — sous-traitant de traitement financier) est chargé
          uniquement après votre consentement explicite. Stripe peut déposer des cookies techniques
          nécessaires au traitement sécurisé du paiement. Ces cookies ne sont actifs que lors d'une
          transaction et ne servent pas à du profilage publicitaire.
        </p>
      </section>

      <div class="legal-footer">
        Voir aussi : <router-link to="/mentions-legales">Mentions légales</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { ShieldCheck } from 'lucide-vue-next'
import { useHead } from '@vueuse/head'

export default {
  name: 'PrivacyPolicy',
  components: { ShieldCheck },
  setup() {
    useHead({
      title: 'Politique de confidentialité — BambuCalc',
      meta: [
        { name: 'description', content: 'Politique de confidentialité de BambuCalc. Informations sur la collecte, l\'utilisation et la protection de vos données personnelles.' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Politique de confidentialité — BambuCalc' },
        { property: 'og:url', content: 'https://bambucalc.netlify.app/privacy' },
      ],
      link: [{ rel: 'canonical', href: 'https://bambucalc.netlify.app/privacy' }],
    })
  },
  data() {
    return {
      activeSection: 's1',
      sections: [
        { id: 's1', label: '1. Responsable du traitement' },
        { id: 's2', label: '2. Données collectées' },
        { id: 's3', label: '3. Finalités du traitement' },
        { id: 's4', label: '4. Durée de conservation' },
        { id: 's5', label: '5. Hébergement & sous-traitants' },
        { id: 's6', label: '6. Sécurité' },
        { id: 's7', label: '7. Vos droits (RGPD)' },
        { id: 's8', label: '8. Cookies' },
      ],
    }
  },
  computed: {
    lastUpdate() {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date('2026-05-12'))
    },
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

.legal-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #a0aec0;
  text-align: center;
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

ul {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
li {
  margin-bottom: 0.3rem;
}

a {
  color: #2e9cab;
  font-weight: 600;
}
a:hover {
  text-decoration: underline;
}

.privacy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
.privacy-table th {
  background: #f7f9fc;
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a0aec0;
  border-bottom: 1px solid #e2e8f0;
}
.privacy-table td {
  padding: 0.65rem 0.85rem;
  color: #4a5568;
  border-bottom: 1px solid #f0f4f8;
}
.privacy-table tr:last-child td {
  border-bottom: none;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .legal-page {
    background: #fff;
  }
  .legal-visual {
    background: #fff;
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
    padding: 1.75rem 1.25rem 2rem;
  }
}

/* ── Tablette ── */
@media (max-width: 1024px) and (min-width: 769px) {
  .legal-visual {
    background: #fff;
    padding: 2.5rem 2rem;
  }
  .legal-content {
    padding: 2rem 2rem 4rem;
  }
}

/* ── Desktop : 2 colonnes ── */
@media (min-width: 1025px) {
  .legal-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(460px, 1.1fr);
    min-height: 100dvh;
    padding: 1rem;
    gap: 0;
    background-image: url('/assets/svg/shared/hero-vagues.svg');
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
    gap: 1.25rem;
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
