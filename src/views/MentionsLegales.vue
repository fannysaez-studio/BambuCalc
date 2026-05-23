<template>
  <div class="privacy-page">
    <div class="privacy-card">

      <router-link to="/" class="back-btn">← Retour</router-link>

      <div class="privacy-header">
        <div class="privacy-logo">⚖️</div>
        <h1>Mentions légales</h1>
        <p class="privacy-date">Conformément à la loi n° 2004-575 du 21 juin 2004 (LCEN)</p>
      </div>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          <strong>BambuCalc</strong><br />
          Responsable : Fanny Saez<br />
          143 bis Boulevard Lafayette, 63000 Clermont-Ferrand, France<br />
          Contact : <a href="mailto:fanny.saez.0486@gmail.com">fanny.saez.0486@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>2. Hébergement</h2>
        <p>
          Le site BambuCalc est hébergé par :<br />
          <strong>Netlify, Inc.</strong><br />
          44 Montgomery Street, Suite 300<br />
          San Francisco, CA 94104, États-Unis<br />
          <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">www.netlify.com</a>
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
          L'ensemble des contenus présents sur BambuCalc (textes, images, logo, code source) est la propriété exclusive de Fanny Saez,
          sauf mention contraire. Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.
        </p>
      </section>

      <section>
        <h2>4. Données personnelles</h2>
        <p>
          La collecte et le traitement des données personnelles des utilisateurs sont décrits dans notre
          <router-link to="/privacy">politique de confidentialité</router-link>.
        </p>
      </section>

      <section>
        <h2>5. Responsabilité</h2>
        <p>
          BambuCalc s'efforce de fournir des informations exactes et à jour. Toutefois, des erreurs ou omissions peuvent subsister.
          L'éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'inexactitude des informations.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions légales ou au fonctionnement du site :<br />
          <a href="mailto:fanny.saez.0486@gmail.com">fanny.saez.0486@gmail.com</a>
        </p>
      </section>

      <div class="privacy-footer">
        <router-link to="/" class="back-btn">← Retour à l'accueil</router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'MentionsLegales',
}
</script>

<style scoped>
/* Réutilise exactement les mêmes styles que PrivacyPolicy.vue */
.privacy-page {
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f0f4f8;
  padding: 2rem 1rem 4rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.privacy-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 3rem;
  max-width: 760px;
  width: 100%;
}

.back-btn {
  display: inline-block;
  color: #2e9cab;
  text-decoration: none;
  font-size: 0.9rem;
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
}

.privacy-logo {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.privacy-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.5rem;
}

.privacy-date {
  font-size: 0.85rem;
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
  font-size: 1.1rem;
  font-weight: 700;
  color: #1b2f39;
  margin: 0 0 0.75rem;
}

p, li {
  font-size: 0.95rem;
  color: #4f6570;
  line-height: 1.75;
  margin: 0 0 0.5rem;
}

a {
  color: #2e9cab;
  text-decoration: underline;
}

.privacy-footer {
  margin-top: 2rem;
  text-align: center;
}

@media (max-width: 600px) {
  .privacy-card {
    padding: 1.5rem 1.25rem;
  }
}
</style>
