<template>
  <div class="privacy-page">
    <div class="privacy-card">

      <router-link to="/" class="back-btn">← Retour</router-link>

      <div class="privacy-header">
        <div class="privacy-logo">🔒</div>
        <h1>Politique de confidentialité</h1>
        <p class="privacy-date">Dernière mise à jour : {{ lastUpdate }}</p>
      </div>

      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          <strong>BambuCalc</strong> — Fanny Saez<br />
          143 bis Boulevard Lafayette, 63000 Clermont-Ferrand, France<br />
          Contact : <a href="mailto:fanny.saez.0486@gmail.com">fanny.saez.0486@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Dans le cadre de l'utilisation de BambuCalc, nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Compte :</strong> prénom, nom, adresse e-mail, mot de passe (hashé — non lisible)</li>
          <li><strong>Devis :</strong> informations client (nom, adresse, téléphone, e-mail, SIRET), données d'impression (poids, matière, durée), calculs de coûts</li>
          <li><strong>Connexion :</strong> adresse IP, navigateur, date de connexion (via Supabase Auth)</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalités du traitement</h2>
        <table class="privacy-table">
          <thead>
            <tr><th>Finalité</th><th>Base légale</th></tr>
          </thead>
          <tbody>
            <tr><td>Création et gestion de votre compte</td><td>Exécution du contrat</td></tr>
            <tr><td>Génération et stockage de vos devis</td><td>Exécution du contrat</td></tr>
            <tr><td>Sécurité et prévention des fraudes</td><td>Intérêt légitime</td></tr>
            <tr><td>Amélioration du service</td><td>Intérêt légitime</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Durée de conservation</h2>
        <ul>
          <li><strong>Données de compte :</strong> jusqu'à suppression de votre compte</li>
          <li><strong>Devis :</strong> jusqu'à suppression manuelle ou suppression du compte</li>
          <li><strong>Logs de connexion :</strong> 90 jours (gérés par Supabase)</li>
        </ul>
      </section>

      <section>
        <h2>5. Hébergement & sous-traitants</h2>
        <p>
          BambuCalc utilise <strong>Supabase</strong> (base de données et authentification), hébergé sur des serveurs
          situés dans l'Union Européenne. Supabase est conforme au RGPD.
        </p>
        <p>
          Le service est hébergé sur <strong>Netlify, Inc.</strong> (CDN international, conforme aux clauses contractuelles types SCCs).
          Aucune donnée n'est revendue à des tiers.
        </p>
      </section>

      <section>
        <h2>6. Sécurité</h2>
        <ul>
          <li>Les mots de passe sont hashés par <strong>Supabase Auth</strong> (algorithme bcrypt côté serveur) — ils ne sont jamais stockés en clair ni accessibles</li>
          <li>Les communications sont chiffrées via <strong>HTTPS / TLS</strong></li>
          <li>Les accès à la base de données sont protégés par des politiques <strong>RLS (Row Level Security)</strong></li>
          <li>Chaque utilisateur ne peut accéder qu'à ses propres données</li>
        </ul>
      </section>

      <section>
        <h2>7. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès :</strong> consulter toutes vos données depuis votre tableau de bord</li>
          <li><strong>Droit de rectification :</strong> modifier vos informations à tout moment</li>
          <li><strong>Droit à l'effacement :</strong> supprimer vos devis et votre compte depuis le tableau de bord</li>
          <li><strong>Droit à la portabilité :</strong> export PDF de vos devis disponible</li>
          <li><strong>Droit d'opposition :</strong> contactez-nous par e-mail</li>
        </ul>
        <p>
          Pour exercer ces droits ou pour toute question :
          <a href="mailto:fanny.saez.0486@gmail.com">fanny.saez.0486@gmail.com</a>
        </p>
        <p>
          En cas de litige, vous pouvez saisir la <strong>CNIL</strong> :
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>
        </p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          BambuCalc n'utilise pas de cookies de tracking ou publicitaires.
          Un cookie de session est utilisé uniquement pour maintenir votre connexion (cookie technique, exempté de consentement).
        </p>
        <p>
          Si vous choisissez de régler votre commande en ligne, le service <strong>Stripe</strong> (Stripe, Inc. — sous-traitant de traitement financier)
          est chargé uniquement après votre consentement explicite. Stripe peut déposer des cookies techniques nécessaires au traitement sécurisé du paiement.
          Ces cookies ne sont actifs que lors d'une transaction et ne servent pas à du profilage publicitaire.
        </p>
      </section>

      <div class="privacy-footer">
        <router-link to="/signup" class="back-btn">← Retour à l'inscription</router-link>
        <p class="legal-link">
          Voir aussi : <router-link to="/mentions-legales">Mentions légales</router-link>
        </p>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
  computed: {
    lastUpdate() {
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date('2026-05-12'))
    },
  },
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 2rem 1rem 4rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.privacy-card {
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  padding: 2.5rem 3rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #2e9cab;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: opacity 0.2s;
}
.back-btn:hover { opacity: 0.75; }

.privacy-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}
.privacy-logo { font-size: 2.5rem; margin-bottom: 0.75rem; }
.privacy-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}
.privacy-date { color: #a0aec0; font-size: 0.82rem; margin: 0; }

section {
  margin-bottom: 2rem;
}
h2 {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #e8f7f9;
}
p, li {
  font-size: 0.88rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0 0 0.5rem;
}
ul {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
li { margin-bottom: 0.3rem; }
a { color: #2e9cab; font-weight: 600; }
a:hover { text-decoration: underline; }

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
.privacy-table tr:last-child td { border-bottom: none; }

.privacy-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.legal-link {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #a0aec0;
}

.legal-link a {
  color: #2e9cab;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .privacy-card { padding: 1.5rem 1.25rem; }
}
</style>
