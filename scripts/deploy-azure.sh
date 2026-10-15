#!/usr/bin/env bash
# Déploie jingr sur Azure App Service (Linux, Node 22), région France Centre.
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

echo "→ Application $APP (Node 22)"
az webapp show -n "$APP" -g "$RG" -o none 2>/dev/null \
  || az webapp create -n "$APP" -g "$RG" -p "$PLAN" --runtime "NODE:22-lts" -o none

az webapp config set -n "$APP" -g "$RG" --startup-file "node server.js" \
  --always-on true --http20-enabled true --min-tls-version 1.2 -o none
az webapp update -n "$APP" -g "$RG" --https-only true -o none

HOST="$(az webapp show -n "$APP" -g "$RG" --query defaultHostName -o tsv)"
# Garde le domaine déjà branché (https://jingr.ai) au lieu de revenir à l'adresse azurewebsites.net
CURRENT_URL="$(az webapp config appsettings list -n "$APP" -g "$RG" --query "[?name=='APP_URL'].value" -o tsv 2>/dev/null || true)"
APP_URL="${APP_URL:-${CURRENT_URL:-https://$HOST}}"

# Réglages : on ne transmet que les variables présentes, jamais de valeur vide.
SETTINGS=(
  "SCM_DO_BUILD_DURING_DEPLOYMENT=false"
  "WEBSITE_NODE_DEFAULT_VERSION=~22"
  "HOSTNAME=0.0.0.0"
  "DATA_DIR=/home/data"
  "APP_URL=$APP_URL"
)
for v in OPENAI_API_KEY OPENAI_MODEL OPENAI_TRANSCRIBE_MODEL \
         WHATSAPP_TOKEN WHATSAPP_PHONE_NUMBER_ID WHATSAPP_APP_SECRET WHATSAPP_VERIFY_TOKEN \
         WHATSAPP_TEST_MODE NEXT_PUBLIC_WHATSAPP_NUMBER NEXT_PUBLIC_STRIPE_PAYMENT_LINK NEXT_PUBLIC_STRIPE_PIONEER_LINK NEXT_PUBLIC_PIONEER_PRICE \
         NEXT_PUBLIC_PRICE_MONTHLY FREE_DRAFTS PIONEER_SPOTS OPS_PASSWORD AGENT_ENABLED SAME_AS \
         COMPANY_NAME COMPANY_FORM COMPANY_SIRET COMPANY_ADDRESS CONTACT_EMAIL PUBLICATION_DIRECTOR; do
  if [[ -n "${!v:-}" ]]; then SETTINGS+=("$v=${!v}"); fi
done
if [[ -z "${OPS_PASSWORD:-}" ]]; then
  echo "⚠️  OPS_PASSWORD absent : /ops restera fermé en production tant qu'il n'est pas défini."
fi
echo "→ Réglages (${#SETTINGS[@]} variables, valeurs non affichées)"
az webapp config appsettings set -n "$APP" -g "$RG" --settings "${SETTINGS[@]}" -o none

echo "→ Build local (Next.js standalone)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
# Le dossier de build (sources + node_modules, plusieurs centaines de Mo) est supprimé à la fin, même en cas d'erreur.
trap '[[ -n "${BUILD:-}" && "$BUILD" == /tmp/* ]] && rm -rf -- "$BUILD"' EXIT
# On build le code commité (HEAD), pas l'état de travail local.
git -C "$ROOT" archive --format=tar HEAD | tar -x -C "$BUILD"
(cd "$BUILD" && npm ci --no-audit --no-fund && npm run build)
PKG="$BUILD/.next/standalone"
# Le contenu de public/ (le standalone peut déjà créer le dossier : copier « dedans » donnerait public/public)
mkdir -p "$PKG/public" && cp -r "$BUILD/public/." "$PKG/public/"
mkdir -p "$PKG/.next/static" && cp -r "$BUILD/.next/static/." "$PKG/.next/static/"
ZIP="$BUILD/jingr.zip"
(cd "$PKG" && zip -qr "$ZIP" .)

echo "→ Déploiement (paquet prêt à démarrer, 1 à 3 minutes)"
az webapp deploy -n "$APP" -g "$RG" --src-path "$ZIP" --type zip --async false --clean true \
  --track-status false -o none  # le suivi de démarrage d'az reste bloqué : on vérifie nous-mêmes en HTTP ci-dessous

echo "→ Vérification"
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "https://$HOST/" || true)"
  [[ "$code" == "200" ]] && break
  sleep 10
done
echo "   https://$HOST/ → HTTP $code"
if [[ "$code" != "200" ]]; then
  echo "❌ Le site ne répond pas. Logs : az webapp log tail -n $APP -g $RG" >&2
  exit 1
fi
echo "   https://$HOST/sitemap.xml → HTTP $(curl -s -o /dev/null -w '%{http_code}' "https://$HOST/sitemap.xml")"
echo
echo "✅ jingr déployé : https://$HOST"
echo "   Prochaine étape : brancher jingr.ai (scripts/dns-ovh.sh, après accord)."
