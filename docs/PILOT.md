# Pilote jingr : de la réponse « partant » au premier devis

Objectif : 10 artisans de la métropole lilloise, gratuit 3 mois, puis 49 € HT / mois pour
ceux qui continuent. Critères de décision au bout de 3 mois (les quatre doivent être tenus) :

| Critère | Seuil |
|---|---|
| Artisans actifs chaque semaine | 6 sur 10 |
| Devis envoyés avec peu de corrections (≤ 2 lignes modifiées) | 70 % |
| Erreur de prix ou erreur légale arrivée chez un client | 0 |
| Artisans prêts à payer 49 € HT / mois | 3 sur 10 |

## 1. Répondre à un artisan intéressé (le jour même)

> Bonjour [Prénom],
>
> Merci pour votre retour, ça nous fait vraiment plaisir !
>
> Le plus simple : je vous appelle 10 minutes pour vous montrer, et on fait ensemble un
> premier devis sur un de vos chantiers en cours. Vous êtes plutôt disponible quand cette
> semaine ? Le soir me va très bien aussi.
>
> Si vous voulez essayer tout de suite : https://jingr.ai/go, vous dictez votre chantier
> et vous recevez le devis à relire.
>
> Bonne journée,
> Kévin, jingr
> 06 88 67 72 94

## 2. L'appel de 10 minutes

1. **Écouter (3 min).** « Comment vous faites vos devis aujourd'hui ? Combien par semaine ?
   Quand ? Avec quel logiciel ? » Noter les réponses : elles alimentent le pilote.
2. **Montrer (4 min).** Il dicte un vrai chantier sur jingr.ai/go. On relit ensemble :
   les prix en orange sont des estimations, il les corrige ou clique « Prix OK ».
3. **Son tarif (2 min).** Dans « Mon entreprise », il colle son tarif (Excel ou logiciel :
   désignation ; unité ; prix HT), son SIRET et son adresse. Ses prix seront repris tels quels.
4. **Conclure (1 min).** « Faites vos 3 prochains devis avec jingr, je vous rappelle
   dans une semaine. » Si WhatsApp est prêt : lui envoyer le numéro jingr.

À ne jamais faire : promettre un envoi automatique au client, ou une intégration à son
logiciel qui n'existe pas encore (l'export CSV existe, l'API non).

## 3. Réponses types

**« C'est combien ? »**
> Gratuit pendant les 3 mois du pilote, sans carte bancaire. Ensuite 49 € HT par mois si
> vous continuez, résiliable en un message. Et vous gardez vos devis et factures.

**« Mes données / celles de mes clients ? »**
> Elles sont stockées en France (Azure, Paris) et ne servent qu'à faire vos devis. Pour
> rédiger le devis, le texte du chantier passe par un service d'IA (OpenAI), sans être
> utilisé pour entraîner ses modèles. Vous pouvez tout supprimer d'un message
> (« SUPPRIMER MON COMPTE »).

**« J'ai déjà un logiciel »**
> jingr ne le remplace pas : il prépare le devis, vous l'exportez en un clic (CSV) vers
> votre logiciel. Beaucoup gardent leur outil pour la facturation.

**« Pas le temps »**
> Justement, c'est fait pour ça 🙂 Un vocal d'une minute sur le chantier, et le devis est
> prêt à relire. Je vous rappelle quand ça vous arrange ?

**« Pas intéressé »** : remercier en une ligne, noter « ne plus relancer », ne plus écrire.

## 4. Relances (si pas de réponse)

**J+4**, en réponse dans le même fil :
> Bonjour, je me permets de remonter mon message. Si les devis du soir vous parlent,
> je vous montre en 10 minutes, au téléphone ou sur un de vos chantiers. Kévin, jingr

**J+9**, dernière relance :
> Bonjour, dernier petit message de ma part : si un jour vous voulez tester jingr, il
> suffit de répondre à ce mail. Bonne continuation sur les chantiers ! Kévin, jingr

Pas de troisième relance.

## 5. Suivi chaque semaine

Pour chaque pilote : nombre de devis, lignes corrigées, prix « à confirmer » restants,
devis acceptés par les clients, retours (verbatim). La liste des devis est sur /ops
(mot de passe OPS_PASSWORD). Revue de 10 % des devis chaque semaine.

Les données des prospects (noms, e-mails) ne vont jamais dans ce dépôt.
