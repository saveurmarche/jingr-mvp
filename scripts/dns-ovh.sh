#!/usr/bin/env bash
# Fait pointer jingr.ai et www.jingr.ai vers l'App Service Azure, puis active le HTTPS managé.
# Ne touche QU'AUX enregistrements @ et www (A/CNAME) et ajoute les TXT asuid de vérification.
# La messagerie OVH (MX, mail, imap, smtp, autodiscover, DKIM, SPF) n'est jamais modifiée.
#
# Usage :
#   bash scripts/dns-ovh.sh            → affiche l'état actuel et ce qui changerait (aucune modification)
#   bash scripts/dns-ovh.sh --confirm  → applique la bascule (l'ancien site cesse d'être servi)
#
# Requiert : OVH_APPLICATION_KEY, OVH_APPLICATION_SECRET, OVH_CONSUMER_KEY, az connecté (cf. deploy-azure.sh).
set -euo pipefail

ZONE="${DNS_ZONE:-jingr.ai}"
RG="${AZURE_RESOURCE_GROUP:-jingr-rg}"
APP="${AZURE_WEBAPP:-jingr-app}"
API="https://eu.api.ovh.com/1.0"
CONFIRM="${1:-}"

ovh() { # ovh METHOD PATH [JSON_BODY]
  local method="$1" url="$API$2" body="${3:-}" ts sig
  ts="$(curl -s "$API/auth/time")"
  sig="\$1\$$(printf '%s' "$OVH_APPLICATION_SECRET+$OVH_CONSUMER_KEY+$method+$url+$body+$ts" | sha1sum | cut -d' ' -f1)"
  curl -sS -X "$method" "$url" \
    -H "X-Ovh-Application: $OVH_APPLICATION_KEY" -H "X-Ovh-Consumer: $OVH_CONSUMER_KEY" \
    -H "X-Ovh-Timestamp: $ts" -H "X-Ovh-Signature: $sig" \
    ${body:+-H "Content-Type: application/json" --data "$body"}
}

records() { # records TYPE SUBDOMAIN → ids, sous-domaine EXACT ("" = @), vérifié enregistrement par enregistrement
  local id sub
  for id in $(ovh GET "/domain/zone/$ZONE/record?fieldType=$1" | tr -d '[] ' | tr ',' ' '); do
    sub="$(ovh GET "/domain/zone/$ZONE/record/$id" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("subDomain") or "")')"
    [[ "$sub" == "$2" ]] && echo "$id"
  done
  return 0
}

show() { # show TYPE SUBDOMAIN
  for id in $(records "$1" "$2"); do
    ovh GET "/domain/zone/$ZONE/record/$id" | python3 -c 'import sys,json; r=json.load(sys.stdin); print("   ", r["fieldType"], r["subDomain"] or "@", "→", r["target"])'
  done
}

if [[ -n "${AZURE_CLIENT_ID:-}" ]]; then
  az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" --tenant "$AZURE_TENANT_ID" -o none
  az account set --subscription "$AZURE_SUBSCRIPTION_ID"
fi

HOST="$(az webapp show -n "$APP" -g "$RG" --query defaultHostName -o tsv)"
IP="$(az webapp show -n "$APP" -g "$RG" --query inboundIpAddress -o tsv 2>/dev/null || true)"
[[ -z "$IP" ]] && IP="$(getent hosts "$HOST" | awk '{print $1}' | head -1)"
VERIF="$(az webapp show -n "$APP" -g "$RG" --query customDomainVerificationId -o tsv)"

echo "État actuel de $ZONE :"
show A ""; show A www; show CNAME www; show TXT asuid; show TXT asuid.www
echo
echo "Après bascule :"
echo "    A @ → $IP"
echo "    CNAME www → $HOST."
echo "    TXT asuid / asuid.www → (identifiant de vérification Azure)"

if [[ "$CONFIRM" != "--confirm" ]]; then
  echo
  echo "Aucune modification faite. Relancer avec --confirm pour appliquer."
  exit 0
fi

echo
echo "→ TXT de vérification Azure"
for sub in asuid asuid.www; do
  for id in $(records TXT "$sub"); do ovh DELETE "/domain/zone/$ZONE/record/$id" >/dev/null; done
  ovh POST "/domain/zone/$ZONE/record" "{\"fieldType\":\"TXT\",\"subDomain\":\"$sub\",\"target\":\"$VERIF\",\"ttl\":300}" >/dev/null
done

echo "→ @ vers Azure"
for id in $(records A ""); do ovh DELETE "/domain/zone/$ZONE/record/$id" >/dev/null; done
ovh POST "/domain/zone/$ZONE/record" "{\"fieldType\":\"A\",\"subDomain\":\"\",\"target\":\"$IP\",\"ttl\":300}" >/dev/null

echo "→ www vers Azure"
for t in A CNAME; do for id in $(records "$t" www); do ovh DELETE "/domain/zone/$ZONE/record/$id" >/dev/null; done; done
ovh POST "/domain/zone/$ZONE/record" "{\"fieldType\":\"CNAME\",\"subDomain\":\"www\",\"target\":\"$HOST.\",\"ttl\":300}" >/dev/null

ovh POST "/domain/zone/$ZONE/refresh" >/dev/null
echo "→ Zone rafraîchie, attente de la propagation (jusqu'à 10 min)"
for i in $(seq 1 60); do
  [[ "$(getent hosts "$ZONE" | awk '{print $1}' | head -1)" == "$IP" ]] && break
  sleep 10
done

echo "→ Domaines et certificats HTTPS managés (gratuits)"
for h in "$ZONE" "www.$ZONE"; do
  az webapp config hostname add --webapp-name "$APP" -g "$RG" --hostname "$h" -o none
  THUMB="$(az webapp config ssl create -n "$APP" -g "$RG" --hostname "$h" --query thumbprint -o tsv)"
  az webapp config ssl bind -n "$APP" -g "$RG" --certificate-thumbprint "$THUMB" --ssl-type SNI -o none
done

az webapp config appsettings set -n "$APP" -g "$RG" --settings "APP_URL=https://$ZONE" -o none
echo
echo "✅ https://$ZONE et https://www.$ZONE pointent vers jingr sur Azure."
echo "   Redéployer une fois (bash scripts/deploy-azure.sh) pour que les liens et le sitemap utilisent https://$ZONE."
