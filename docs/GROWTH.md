# Machine d'acquisition jingr

Objectif : des artisans qui s'inscrivent **sans qu'on les appelle**.
Principe : le produit se teste en 1 vocal WhatsApp, sans formulaire, sans carte bancaire.
L'inscription se fait au premier message reçu. Tout le travail d'acquisition sert à
provoquer ce **premier vocal**.

Leçon de la première vague (mails + Facebook, zéro réponse) : on vendait « l'automatisation
de la facturation », un sujet que l'artisan considère déjà réglé, à des gens qui ne nous
connaissent pas. On vend maintenant un résultat concret : **le devis prêt avant d'être
remonté dans le camion**. Et on demande une seule action : envoyer un vocal.

---

## Le tunnel

```
Google (pages modèle de devis)  ┐
Séquence email automatique      ├─► jingr.ai ─► bouton WhatsApp ─► 1er vocal ─► devis reçu
Groupes Facebook / bouche-à-oreille ┘                                     │
                                                         10 devis offerts ─┤
                                    parrainage auto au 3e devis ◄──────────┤
                                    lien de paiement Stripe au 10e ◄───────┘
```

| Étape | Automatisé ? | Où |
|---|---|---|
| Trafic Google | ✅ | `/modele-devis/*`, `/facture-electronique-artisan`, `sitemap.xml` |
| Liste de prospects | ✅ | `npm run prospects -- --dep 69,01,42 --mois 18` |
| Enrichissement email/tél | ✅ outil externe | Dropcontact (FR, conforme RGPD) ou équivalent |
| Envoi des séquences | ✅ outil externe | lemlist / Brevo / La Growth Machine, depuis un domaine secondaire |
| Inscription | ✅ | 1er message WhatsApp = compte créé |
| Activation | ✅ | réponse WhatsApp avec lien de devis + astuce réglages |
| Parrainage | ✅ | message automatique au 3e devis |
| Paiement | ✅ | Stripe Payment Link proposé au 10e devis |
| Suivi | 🔜 | tableau `/ops` (à enrichir : inscrits, devis, factures, payants) |

---

## Routine : 1 h par semaine, à deux

1. **Lundi, 15 min.** Générer et enrichir 150 prospects, puis les importer dans l'outil de séquence.
2. **Mercredi, 15 min.** Lire les réponses et répondre aux 3 ou 4 personnes qui ont réagi.
3. **Vendredi, 30 min.** Regarder `/ops` : qui a envoyé un vocal sans valider son devis ? Lui écrire sur WhatsApp. Ajouter une page modèle de devis.

Indicateurs à suivre chaque semaine :
- prospects contactés
- taux de réponse
- premiers vocaux reçus
- devis validés
- passages payants

Règle : on change **un seul** élément du message tous les 150 envois.

---

## Séquence email (3 envois sur 9 jours)

À envoyer depuis un **domaine secondaire** (ex. `jingr-pro.fr`) chauffé 2 à 3 semaines,
pour ne pas griller la délivrabilité de jingr.ai. Maximum 40 envois par jour et par boîte.
Texte brut, sans image ni pièce jointe.

**J0 — Objet : devis du soir**
> Bonjour {{prenom}},
>
> Une question rapide : vos devis, vous les faites le soir après les chantiers ?
>
> On a monté un outil pour les plombiers : vous dictez le chantier en vocal WhatsApp
> (« Mme Dupont, cumulus 200 L à remplacer, groupe de sécu… ») et vous recevez le devis
> chiffré 3 minutes après, à relire sur votre téléphone.
>
> Les 10 premiers sont offerts. Il suffit d'envoyer un vocal ici : {{lien_whatsapp}}
>
> {{signature}}
> — Pas intéressé ? Répondez « stop » et je ne vous écris plus.

**J+4 — Objet : re: devis du soir**
> {{prenom}}, voici à quoi ressemble un devis sorti d'un vocal de 30 secondes :
> {{lien_modele_devis_metier}}
>
> Si vous avez un devis à faire cette semaine, testez-le dessus : {{lien_whatsapp}}

**J+9 — Objet : je ferme le dossier**
> Je ne veux pas vous embêter, donc dernier message.
> Si un jour vous voulez gagner vos soirées sur les devis et les factures, envoyez juste
> « devis » à ce numéro : {{numero_whatsapp}}.
> Bonne continuation sur les chantiers.

Variante pour les **entreprises créées depuis moins de 18 mois** (colonne `date_creation`),
à utiliser en premier car c'est le segment le plus chaud :
> Félicitations pour le lancement de {{entreprise}} ! Au début, les devis et la
> facturation prennent un temps fou…

---

## SMS (si numéro mobile disponible, 1 seul envoi)

> Bonjour {{prenom}}, c'est {{signature}} de jingr. Vous dictez un chantier en vocal
> WhatsApp, vous recevez le devis chiffré en 3 min. 10 offerts : {{lien_whatsapp}}
> STOP au 36xxx

---

## Facebook : groupes d'artisans

Ne jamais poster d'annonce : elle est supprimée et le compte est signalé.
Poster du contenu utile **une fois par semaine** :
- « Modèle de devis remplacement chauffe-eau : les 3 lignes que tout le monde oublie » (+ lien de la page modèle).
- « Facture électronique 2027 : ce qui change vraiment pour les plombiers » (+ lien du guide).
- Répondre aux questions du type « quel logiciel de devis vous utilisez ? » avec un retour d'expérience honnête.

---

## Partenaires : à tester une fois les 10 premiers utilisateurs actifs

- **Experts-comptables** qui suivent des artisans : jingr leur évite les factures Word mal numérotées. Mail type dans la séquence, cible « cabinet + BTP ».
- **Négoces / grossistes** (comptoirs) : affichette avec QR code WhatsApp.
- **Écoles et CFA** plomberie : futurs installateurs qui s'équipent dès la création de l'entreprise.

---

## RGPD : prospection B2B par email

- Autorisée sans consentement préalable si le message concerne **l'activité professionnelle** du destinataire.
- Chaque message doit identifier l'expéditeur et proposer une **désinscription simple**. Une opposition se respecte immédiatement.
- Les listes ne se commitent jamais : `/data/*.csv` est ignoré par git.
- En cas de doute (adresse manifestement personnelle, par exemple d'un proche), ne pas écrire.
