#!/usr/bin/env bash
# Build du site statique :
#  1. décode les favicons embarqués (assets/img/*.b64 -> binaires, gitignorés)
#  2. télécharge les ressources épinglées par SHA-256 dans assets/img/manifest.tsv
#     (photos redimensionnées en JPEG + WebP, police de caractères) — Pillow requis
#  3. génère assets/js/config.js à partir des variables d'environnement (ou .env)
# Aucune donnée personnelle n'est écrite dans le dépôt : elle provient uniquement
# de l'environnement (en local : .env ; en CI : secrets GitHub / variables Pages).
set -euo pipefail
cd "$(dirname "$0")"

echo "== 1/3 Décodage des favicons embarqués (.b64) =="
mkdir -p assets/img
shopt -s nullglob
for b64 in assets/img/*.b64; do
  base64 -d "$b64" > "${b64%.b64}"
done

echo "== 2/3 Ressources épinglées (manifest SHA-256) =="
if ! python3 -c "import PIL" 2>/dev/null; then
  echo "installation de Pillow (build uniquement)..."
  pip install -q pillow
fi
python3 tools/fetch_images.py

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SITE_NAME:=Perf IT}"
: "${SITE_URL:=https://perfitcenter.fr}"
: "${CONTACT_EMAIL:=}"
: "${CONTACT_ADDRESS:=}"
: "${CONTACT_PHONE:=}"
: "${LEGAL_NAME:=}"
: "${SIRET:=}"
: "${PUBLICATION_DIRECTOR:=}"

echo "== 3/3 Génération de assets/js/config.js =="
python3 - "$SITE_NAME" "$SITE_URL" "$CONTACT_EMAIL" "$CONTACT_ADDRESS" "$CONTACT_PHONE" "$LEGAL_NAME" "$SIRET" "$PUBLICATION_DIRECTOR" <<'PYEOF'
import json, sys, os

(site_name, site_url, email, address, phone, legal_name, siret, director) = sys.argv[1:9]

address_inline = ", ".join(part.strip() for part in address.splitlines() if part.strip())

cfg = {
    "siteName": site_name,
    "siteUrl": site_url,
    "email": email,
    "address": address,
    "addressInline": address_inline,
    "phone": phone,
    "legalName": legal_name,
    "siret": siret,
    "publicationDirector": director,
}

os.makedirs("assets/js", exist_ok=True)
with open("assets/js/config.js", "w", encoding="utf-8") as f:
    f.write("// Généré automatiquement par build.sh — ne pas committer (voir .gitignore).\n")
    f.write("window.PERFIT_CONFIG = " + json.dumps(cfg, ensure_ascii=False, indent=2) + ";\n")
print("assets/js/config.js généré.")
for key, label in (("email", "CONTACT_EMAIL"), ("address", "CONTACT_ADDRESS"), ("legalName", "LEGAL_NAME"), ("siret", "SIRET"), ("publicationDirector", "PUBLICATION_DIRECTOR")):
    if not cfg[key]:
        print(f"ATTENTION : {label} est vide — la mention correspondante n'apparaîtra pas sur le site.", file=sys.stderr)
PYEOF
