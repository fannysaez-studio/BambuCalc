<template>
  <div class="privacy-page">
    <div class="privacy-card">
      <router-link to="/" class="back-btn">← Retour</router-link>

      <div class="privacy-header">
        <div class="privacy-logo">
          <Scale class="logo-icon" />
        </div>
        <h1>Mentions légales</h1>
        <p class="privacy-date">Conformément à la loi n° 2004-575 du 21 juin 2004 (LCEN)</p>
      </div>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          <strong>BambuCalc</strong><br />
          Responsable : Fanny Saez<br />
          143 bis Boulevard Lafayette, 63000 Clermont-Ferrand, France<br />
          Contact : <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
      </section>

      <section>
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

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur BambuCalc (textes, images, logo, code source) est la
          propriété exclusive de Fanny Saez, sauf mention contraire. Toute reproduction,
          représentation, modification ou exploitation non autorisée est strictement interdite.
        </p>
      </section>

      <section>
        <h2>4. Données personnelles</h2>
        <p>
          La collecte et le traitement des données personnelles des utilisateurs sont décrits dans
          notre
          <router-link to="/privacy">politique de confidentialité</router-link>.
        </p>
      </section>

      <section>
        <h2>5. Responsabilité</h2>
        <p>
          BambuCalc s'efforce de fournir des informations exactes et à jour. Toutefois, des erreurs
          ou omissions peuvent subsister. L'éditeur ne peut être tenu responsable des dommages
          directs ou indirects résultant de l'utilisation du site ou de l'inexactitude des
          informations.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions légales ou au fonctionnement du site
          :<br />
          <a href="mailto:fannysaez.pro@gmail.com">fannysaez.pro@gmail.com</a>
        </p>
      </section>

      <div class="privacy-footer">
        <router-link to="/" class="back-btn">← Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { Scale } from 'lucide-vue-next'

export default {
  name: 'MentionsLegales',
  components: { Scale },
}
</script>

<style scoped>
.privacy-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f0f4f8;
  /* padding: 2rem 1rem 6rem; */
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

@media (max-width: 768px) {
  .privacy-page {
    background: #ffffff;
  }
}

.privacy-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 3rem;
  max-width: 760px;
  width: 100%;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #2e9cab;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  transition: opacity 0.2s;
}
.back-btn:hover {
  opacity: 0.75;
}

.privacy-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.privacy-logo {
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 24px rgba(46, 154, 171, 0.28);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: #fff;
}

.privacy-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.privacy-date {
  font-size: 0.82rem;
  color: #a0aec0;
  margin: 0;
}

section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

section:last-of-type {
  border-bottom: none;
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

.privacy-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

@media (max-width: 640px) {
  .privacy-card {
    padding: 1.5rem 1.25rem;
  }
}
</style>
