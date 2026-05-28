# Présentation

BambuCalc est une application web B2B permettant à un prestataire d'impression 3D de :

- **Calculer** les coûts (matière, électricité, main d'œuvre, marge)
- **Générer des devis PDF** professionnels avec coordonnées client
- **Gérer** l'ensemble des devis et clients depuis un dashboard admin
- **Envoyer** les devis par email directement au client (avec PDF joint)
- **Encaisser** via Stripe (carte, Apple Pay, Google Pay), PayPal, virement, chèque ou espèces — le client choisit sa préférence dans le formulaire

---

## Stack technique

| Technologie                 | Rôle                                 |
| --------------------------- | ------------------------------------ |
| **Vue.js 3.5** + Vite 8     | Framework UI + build                 |
| **Vue Router 5** + Pinia 3  | Routage + état global                |
| **jsPDF 4**                 | Génération PDF côté client           |
| **Supabase**                | PostgreSQL + Auth + Edge Functions   |
| **Brevo**                   | Emails transactionnels               |
| **Stripe**                  | Paiements en ligne (Payment Element) |
| **Netlify**                 | Hébergement frontend                 |
| **Vitest** + **Playwright** | Tests unitaires + E2E                |

---

<div align="center">

**Suivant :** [Installation →](./02-installation.md)

</div>
