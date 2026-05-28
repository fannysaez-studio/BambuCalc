# Structure du projet

```text
BambuCalc/
├── src/
│   ├── components/
│   │   ├── admin/          # 8 onglets admin (ClientsTab, QuotesTab, EmailsTab…)
│   │   ├── calculator/     # Étapes du calculateur (11 composants)
│   │   └── ui/             # Composants globaux (NavBar, Toast, CookieBanner…)
│   ├── views/
│   │   ├── auth/           # Login, Signup, ResetPassword
│   │   ├── calculator/     # CalculatorStep
│   │   ├── dashboard/      # Dashboard, UserProfile
│   │   ├── admin/          # AdminDashboard
│   │   ├── Landing.vue
│   │   ├── Contact.vue
│   │   ├── PaymentView.vue
│   │   ├── PrivacyPolicy.vue
│   │   └── MentionsLegales.vue
│   ├── router/             # index.js — routes + guards auth/admin
│   ├── stores/             # Pinia (calculator.js)
│   ├── utils/              # auth.js · quotes.js · stripe.js · generateQuotePDF.js
│   ├── lib/                # supabase.js
│   └── styles/             # modules CSS
├── supabase/
│   ├── migrations/         # 5 migrations versionnées
│   └── functions/          # send-quote-email · send-welcome-email · create-payment-intent · stripe-webhook
├── bambucalc/              # Documentation du projet (cette page)
├── netlify.toml            # Headers HTTP sécurité
└── e2e/                    # Tests Playwright
```

---

<div align="center">

**Précédent :** [← Installation](./02-installation.md) &nbsp;|&nbsp; **Suivant :** [Flux métier →](./04-flux-metier.md)

</div>
