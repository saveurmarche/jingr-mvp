#!/usr/bin/env bash
# Déploie jingr sur Azure App Service (Linux, Node 20), région France Centre.
# Fonctionne depuis une session Claude (variables AZURE_* présentes) ou depuis shell.azure.com
# (déjà connecté : les variables AZURE_* sont alors inutiles).
#
# Usage : bash scripts/deploy-azure.sh
# Idempotent : relancer le script redéploie la dernière version du code.
set -euo pipefail

RG="${AZURE_RESOURCE_GROUP:-jingr-rg}"
LOCATION="${AZURE_LOCATION:-francecentral}"
PLAN="${AZURE_PLAN:-jingr-plan}"
APP="${AZURE_WEBAPP:-jingr-app}"
SKU="${AZURE_SKU:-B1}"

if [[ -n "${AZURE_CLIENT_ID:-}" ]]; then
  az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" \
    --tenant "$AZURE_TENANT_ID" -o none
  az account set --subscription "$AZURE_SUBSCRIPTION_ID"
fi

echo "→ Groupe de ressources $RG ($LOCATION)"
az group create -n "$RG" -l "$LOCATION" -o none

echo "→ Plan App Service $PLAN ($SKU, Linux)"
az appservice plan show -n "$PLAN" -g "$RG" -o none 2>/dev/null \
  || az appservice plan create -n "$PLAN" -g "$RG" --is-linux --sku "$SKU" -o none

echo "→ Application $APP (Node 20)"
az webapp show -n "$APP" -g "$RG" -o none 2>/dev/null \
  || az webapp create -n "$APP" -g "$RG" -p "$PLAN" --runtime "NODE:20-lts" -o none

az webapp config set -n "$APP" -g "$RG" --startup-file "npm run start" \
  --always-on true --http20-enabled true --min-tls-version 1.2 -o none
az webapp update -n "$APP" -g "$RG" --https-only true -o none

HOST="$(az webapp show -n "$APP" -g "$RG" --query defaultHostName -o tsv)"
# Garde le domaine déjà branché (https://jingr.ai) au lieu de revenir à l'adresse azurewebsites.net
CURRENT_URL="$(az webapp config appsettings list -n "$APP" -g "$RG" --query "[?name=='APP_URL'].value" -o tsv 2>/dev/null || true)"
APP_URL="${APP_URL:-${CURRENT_URL:-https://$HOST}}"

# Réglages : on ne transmet que les variables présentes, jamais de valeur vide.
SETTINGS=(
  "SCM_DO_BUILD_DURING_DEPLOYMENT=true"
  "WEBSITE_NODE_DEFAULT_VERSION=~20"
  "DATA_DIR=/home/data"
  "APP_URL=$APP_URL"
)
for v in OPENAI_API_KEY OPENAI_MODEL OPENAI_TRANSCRIBE_MODEL \
         WHATSAPP_TOKEN WHATSAPP_PHONE_NUMBER_ID WHATSAPP_APP_SECRET WHATSAPP_VERIFY_TOKEN \
         WHATSAPP_TEST_MODE NEXT_PUBLIC_WHATSAPP_NUMBER NEXT_PUBLIC_STRIPE_PAYMENT_LINK \
         NEXT_PUBLIC_PRICE_MONTHLY FREE_DRAFTS PIONEER_SPOTS OPS_PASSWORD \
         COMPANY_NAME COMPANY_FORM COMPANY_SIRET COMPANY_ADDRESS CONTACT_EMAIL PUBLICATION_DIRECTOR; do
  if [[ -n "${!v:-}" ]]; then SETTINGS+=("$v=${!v}"); fi
done
if [[ -z "${OPS_PASSWORD:-}" ]]; then
  echo "⚠️  OPS_PASSWORD absent : /ops restera fermé en production tant qu'il n'est pas défini."
fi
echo "→ Réglages (${#SETTINGS[@]} variables, valeurs non affichées)"
az webapp config appsettings set -n "$APP" -g "$RG" --settings "${SETTINGS[@]}" -o none

echo "→ Paquet de déploiement (code source, build fait par Azure)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIP="$(mktemp -d)/jingr.zip"
(cd "$ROOT" && git archive --format=zip -o "$ZIP" HEAD)

echo "→ Déploiement (build Next.js côté Azure, 3 à 6 minutes)"
az webapp deploy -n "$APP" -g "$RG" --src-path "$ZIP" --type zip --async false -o none

echo "→ Vérification"
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "https://$HOST/" || true)"
  [[ "$code" == "200" ]] && break
  sleep 10
done
echo "   https://$HOST/ → HTTP $code"
echo "   https://$HOST/sitemap.xml → HTTP $(curl -s -o /dev/null -w '%{http_code}' "https://$HOST/sitemap.xml")"
echo
echo "✅ jingr déployé : https://$HOST"
echo "   Prochaine étape : brancher jingr.ai (scripts/dns-ovh.sh, après accord)."
