# Roadmap produit jingr

**Proposition de valeur** : un artisan dicte son chantier sur WhatsApp et reçoit un devis
chiffré à relire, puis une facture conforme en un clic. Sans logiciel, sans saisie, sans y
passer ses soirées.

**Règles qui ne bougent pas**
1. **WhatsApp d'abord.** Si une fonction oblige l'artisan à ouvrir un ordinateur, elle est mal conçue.
2. **Jamais d'envoi au client sans validation de l'artisan.**
3. **Une phase ne démarre que quand l'objectif de la précédente est atteint.** Pas de fonction « au cas où ».
4. **Aucun faux chiffre ni faux avis**, que ce soit sur le site ou dans les messages.

---

## Phase 0 : Mise en ligne (semaines 1-2)
**Objectif de sortie :** un premier artisan extérieur envoie un vocal et valide un devis.

| Sujet | État |
|---|---|
| Vocal/texte/photo WhatsApp → devis → facture | ✅ codé (PR #1) |
| Landing, proposition de valeur, pages SEO, guide facture électronique | ✅ |
| Confidentialité, mentions légales, suppression de compte par WhatsApp | ✅ (infos société à renseigner) |
| Collecte d'avis réels (« AVIS : » au 5e devis) + modération ops | ✅ |
| Fermeture des fuites de données (`/api/jobs`, `/mes-devis`) | ✅ |
| Déploiement Azure + DNS OVH + TLS | ⏳ accès en place, à lancer |
| App Meta WhatsApp + numéro dédié + webhook | ⏳ côté fondateurs |
| Clé OpenAI (devis IA + transcription) | ⏳ |
| Lien de paiement Stripe | ⏳ |

---

## Phase 1 : 10 artisans actifs (semaines 3-8)
**Objectif de sortie :** 10 artisans qui font au moins 3 devis par semaine, et 3 qui paient.
Ce qui fait signer : la qualité du devis, et la confiance.

**P0 : solidité (avant d'accueillir des clients payants)**
- **Vraie base de données** (Supabase ou Azure PostgreSQL) à la place du fichier JSON. Schéma prêt dans `supabase/migrations`.
- **Séparer le lien client du lien artisan.** Aujourd'hui, le lien du PDF contient le jeton qui donne accès à l'édition. Il faut créer un lien public en **lecture seule** pour le client, distinct du lien d'édition de l'artisan.
- **Stripe : webhook d'abonnement.** Activer et désactiver le compte automatiquement et appliquer la limite de devis offerts. Pour l'instant, le lien de paiement est seulement proposé.
- **Modèle WhatsApp approuvé** pour écrire à l'artisan hors de la fenêtre de 24 h (liste « mes devis », relances).
- Sauvegardes quotidiennes et alerte si le webhook échoue.

**P1 : qualité du devis (ce qui crée l'habitude)**
- **Prix personnels appris.** Chaque correction de l'artisan (prix, libellé) alimente sa propre bibliothèque. Le devis suivant reprend ses prix, plus ceux de l'IA.
- **Un chantier en plusieurs messages.** Un vocal, puis 2 photos, puis une précision dans les 10 minutes doivent donner un seul chantier, pas trois.
- **Lecture des photos** (plaque signalétique, notes manuscrites) par vision IA.
- **Corrections par WhatsApp** : « enlève le déplacement », « mets le ballon à 450 » → devis mis à jour sans ouvrir le lien.

**P2 : boucle client**
- **Envoi au client par l'artisan** (lien lecture seule) avec **signature en ligne** du « Bon pour accord ».
- **Relance de devis non signé** proposée à l'artisan à J+3 et J+7 (« Je relance Mme Dupont ? » → Oui).
- Notification « devis signé » à l'artisan.

**Mesures :** délai vocal → devis, part des devis validés sans modification, devis par artisan et par semaine.

---

## Phase 2 : 50 artisans payants (mois 3-6)
**Objectif de sortie :** 50 abonnés, résiliation mensuelle sous 5 %.
Ce qui fait payer : la facturation complète et la conformité 2027.

- **Factures électroniques Factur-X** (PDF/A-3 + XML) générées depuis les factures jingr.
- **Raccordement à une plateforme agréée (PDP) partenaire**, plutôt que de devenir PDP nous-mêmes : émission et réception, prêtes avant **septembre 2027**.
- **Acomptes et factures de situation** (chantiers longs, salle de bain, PAC).
- **Relances de paiement automatiques**, validées par l'artisan, et **paiement en ligne** de la facture (lien Stripe ou virement).
- **Export comptable** (CSV et FEC) pour l'expert-comptable.
- **Mentions TVA réduite** (attestation simplifiée 5,5 % / 10 %) générées automatiquement.
- **Suppression automatique** des comptes inactifs depuis 12 mois, comme promis dans la politique de confidentialité.

**Mesures :** passage de l'essai au payant, résiliation, factures émises par artisan, délai moyen de paiement des clients.

---

## Phase 3 : Élargir (mois 6-12)
**Objectif de sortie :** 200 abonnés, dont 30 % venus par recommandation.

- **Nouveaux métiers** : électricien, puis pompe à chaleur, menuiserie, peinture. Chaque métier apporte ses lignes types, ses pages SEO et ses taux de TVA.
- **Aides à la rénovation** : mentions MaPrimeRénov' et CEE sur les devis concernés.
- **Programme experts-comptables** : tableau de bord multi-clients et parrainage.
- **Mode équipe** : un patron et ses compagnons qui envoient des chantiers vers la même entreprise.
- **Prix fournisseurs** (négoces) pour mettre à jour le prix des fournitures.

---

## Ce qu'on ne fait pas (pour l'instant)
- **Une application mobile** : WhatsApp en tient lieu.
- **Un planning ou une gestion de chantier complète** : d'autres outils le font déjà.
- **Devenir nous-mêmes une plateforme agréée (PDP)** : trop lourd, un partenaire suffit.
- **Envoyer automatiquement les devis aux clients**, sans validation de l'artisan.

---

## Rituel
- **Chaque semaine (30 min)** : chiffres d'acquisition (`docs/GROWTH.md`) et d'usage (`/ops`), avis reçus, une décision.
- **Chaque mois** : la phase en cours avance-t-elle vers son objectif de sortie ? Si non, on retire du périmètre, on n'en ajoute pas.
