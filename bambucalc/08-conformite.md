# Conformité légale

## Réglementation appliquée

- **RGPD** : consentement explicite à l'inscription (checkbox "J'accepte la politique de confidentialité et les mentions légales"), politique de confidentialité complète (`/privacy`)
- **LCEN** : page mentions légales (`/mentions-legales`)
- **Cookies** : bandeau de consentement — Stripe chargé uniquement après accord explicite
- **Hébergement** : Netlify (USA — SCCs) + Supabase EU (Frankfurt)

---

## Pages légales

| Page | URL | Accessible |
|---|---|---|
| Politique de confidentialité | `/privacy` | Publique, lien depuis login/signup |
| Mentions légales | `/mentions-legales` | Publique, lien depuis login/signup |

Les liens légaux apparaissent :
- Sur **Login.vue** : ligne discrète en bas de carte
- Sur **Signup.vue** : dans la checkbox RGPD

---

## Données collectées

| Donnée | Stockée où | Durée |
|---|---|---|
| Email, nom | Supabase auth.users + profiles | Jusqu'à suppression du compte |
| Devis | Supabase quotes | Jusqu'à suppression |
| Rendez-vous | Supabase appointments | Jusqu'à suppression |
| Souscriptions push | Supabase push_subscriptions | Jusqu'à désabonnement |
| IP contact (hashée) | Supabase contact_rate_limit | 10 minutes (auto-nettoyage) |
| Paiements | Stripe (jamais stockés côté Supabase) | Géré par Stripe |

---

## Droits des utilisateurs

- **Droit d'accès** : l'utilisateur voit toutes ses données dans son dashboard
- **Droit de suppression** : bouton "Supprimer mon compte" via la fonction `delete_own_account()` — supprime auth.users en cascade (profiles, quotes, notifications, push_subscriptions)
- **Portabilité** : export PDF des devis disponible depuis le dashboard

---

## Ressources

- [Vue 3](https://vuejs.org/) · [Vite](https://vite.dev/) · [Pinia](https://pinia.vuejs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Brevo API v3](https://developers.brevo.com/)
- [Stripe API](https://stripe.com/docs/api)
- [Netlify Docs](https://docs.netlify.com/)
- [Calendly Developer](https://developer.calendly.com/)

---

<div align="center">

**Précédent :** [← Dépannage](./07-depannage.md) &nbsp;|&nbsp; **Suivant :** [Performances Lighthouse →](./09-lighthouse.md)

</div>
