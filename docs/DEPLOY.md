# Mise en production

Cible proposée :
- **Azure** héberge l'application Next.js (Azure App Service Linux, Node 20).
- **OVH** garde le domaine `jingr.ai` et sert uniquement de DNS.
- **Meta** fournit l'API WhatsApp Cloud.

Les clés ne se collent jamais dans un chat ni dans le dépôt. Elles vont dans les
« Variables d'environnement » d'Azure (et, pour qu'un agent Claude puisse déployer, dans les
secrets de l'environnement cloud).

## En deux commandes

```bash
bash scripts/deploy-azure.sh        # crée l'App Service si besoin, règle les variables, déploie
bash scripts/dns-ovh.sh             # montre ce qui changerait dans la zone DNS (aucune modification)
bash scripts/dns-ovh.sh --confirm   # bascule jingr.ai + www vers Azure, active le HTTPS managé
```

Les deux scripts marchent depuis une session Claude qui a les variables `AZURE_*` et `OVH_*`,
ou depuis [shell.azure.com](https://shell.azure.com) après un `git clone` du dépôt.
`dns-ovh.sh` ne modifie que `@`, `www` et les TXT `asuid` : la messagerie OVH (MX, mail, DKIM)
reste intacte. Les données de l'app sont stockées dans `/home/data` (persistant sur App Service).

Le détail des étapes, si besoin de les faire à la main :

## 1. Azure : héberger l'application

```bash
az group create -n jingr-rg -l francecentral
az appservice plan create -n jingr-plan -g jingr-rg --is-linux --sku B1
az webapp create -n jingr-app -g jingr-rg -p jingr-plan --runtime "NODE:20-lts"
az webapp config set -n jingr-app -g jingr-rg --startup-file "npm run start -- -p 8080"
az webapp config appsettings set -n jingr-app -g jingr-rg --settings \
  APP_URL=https://jingr.ai SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  OPENAI_API_KEY=... WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... \
  WHATSAPP_APP_SECRET=... WHATSAPP_VERIFY_TOKEN=... WHATSAPP_TEST_MODE=false \
  NEXT_PUBLIC_WHATSAPP_NUMBER=336XXXXXXXX NEXT_PUBLIC_STRIPE_PAYMENT_LINK=... OPS_PASSWORD=...
```

Déploiement : GitHub Actions avec `azure/webapps-deploy`. Le profil de publication
s'ajoute dans un secret GitHub `AZURE_WEBAPP_PUBLISH_PROFILE`.

⚠️ **Données.** Le store actuel est un fichier JSON (`data/store.json`). Sur App Service,
il tient tant qu'il n'y a **qu'une seule instance**, mais ce n'est pas une vraie base.
Avant les premiers clients payants, il faut brancher Supabase ou Azure Database for
PostgreSQL. Le schéma est prêt dans `supabase/migrations/`.

Les variables `NEXT_PUBLIC_*` sont figées **au build**. Il faut redéployer après les avoir modifiées.

## 2. OVH : brancher jingr.ai sur Azure

1. Azure → App Service → **Domaines personnalisés** → ajouter `jingr.ai` et `www.jingr.ai`. Azure affiche les valeurs à recopier.
2. OVH → Web Cloud → Noms de domaine → `jingr.ai` → **Zone DNS** :
   - `A` sur `@` vers l'IP de l'App Service ;
   - `TXT` sur `asuid` avec l'identifiant de vérification Azure ;
   - `CNAME` sur `www` vers `jingr-app.azurewebsites.net.` ;
   - supprimer les anciens enregistrements `A`/`CNAME` qui pointent vers l'ancien site.
3. Azure → **certificat managé gratuit** pour les deux domaines (TLS).

Pour l'email de prospection, prendre un **domaine secondaire** chez OVH (`jingr-pro.fr`)
avec SPF, DKIM et DMARC (voir `docs/GROWTH.md`).

## 3. Meta : WhatsApp Cloud API

1. developers.facebook.com → créer une app « Business » → ajouter le produit **WhatsApp**.
2. Ajouter un **numéro dédié à jingr**. Il ne doit pas être utilisé dans l'application WhatsApp ordinaire.
3. Générer un **token permanent** (utilisateur système dans Business Manager) → `WHATSAPP_TOKEN`. Recopier aussi le Phone number ID → `WHATSAPP_PHONE_NUMBER_ID`.
4. App → Paramètres → Base → **Clé secrète** → `WHATSAPP_APP_SECRET`.
5. WhatsApp → Configuration → Webhook :
   - URL : `https://jingr.ai/api/whatsapp/webhook`
   - Jeton de vérification : la valeur de `WHATSAPP_VERIFY_TOKEN` (que vous choisissez)
   - S'abonner au champ **messages**.
6. Faire vérifier l'entreprise (Business Verification) pour lever la limite d'envois.

L'artisan écrit en premier, ce qui ouvre une fenêtre de 24 h. Pendant cette fenêtre, nos
réponses sont des messages de service, sans modèle (template) à faire valider.

## 4. Stripe : encaisser

Stripe → Payment Links → produit « jingr Artisan », 49 € HT/mois, TVA activée.
Mettre le lien dans `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`. Il est proposé automatiquement
sur WhatsApp au 10e devis (`FREE_DRAFTS`).

## 5. Vérification après déploiement

```bash
curl "https://jingr.ai/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=ok"  # → ok
curl -I https://jingr.ai/sitemap.xml   # → 200
```

Puis envoyer un vocal au numéro jingr et vérifier que le lien du devis revient sur WhatsApp.
Enfin, déclarer `https://jingr.ai/sitemap.xml` dans Google Search Console (vérification par
un enregistrement TXT chez OVH).
