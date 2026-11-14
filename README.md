# Perf IT — site statique (clone de perfitcenter.fr)

Version statique, sans dépendance runtime, du site WordPress **perfitcenter.fr**
(Perf IT — préparation physique à Péronnas) : HTML + CSS + un petit JavaScript vanilla,
sans framework, sans CMS, sans base de données.

> Note : le dépôt reste 100 % texte. Les petites images (logo, favicons, logos
> partenaires) sont embarquées en `assets/img/*.b64` (décodées au build) ; les photos
> sont téléchargées au build depuis le site d'origine via `assets/img/manifest.tsv`
> (URL + empreinte **SHA-256 épinglée**, vérifiée avant usage) puis redimensionnées
> par `tools/fetch_images.py`. Pour un dépôt totalement autonome, on peut plus tard
> remplacer le manifest par des images commitées directement.

## Structure

```
index.html                  Accueil (diaporama CSS pur, étapes, séances)
le-concept/                 Le concept, l'équipe, les partenaires
sport-sante/                Sport Santé + témoignages
reathletisation/            Réathlétisation + témoignages
preparation-physique/       Préparation physique + témoignages
contact/                    Coordonnées + formulaire de contact
politique-de-confidentialite/   Politique de confidentialité (contenu d'origine)
mentions-legales/           Mentions légales
blog/                       Blog (article d'origine)
assets/css/style.css        Feuille de style unique
assets/js/main.js           Config dynamique, menu mobile, lecteur vidéo, formulaire
assets/img/*.b64 + logo.svg Petites images embarquées (base64), décodées au build
assets/img/manifest.tsv     Photos du site d'origine (URL + SHA-256) pour le build
tools/fetch_images.py       Téléchargement vérifié + redimensionnement des photos
build.sh                    Décode les .b64, fetch les photos, génère config.js depuis env
.github/workflows/pages.yml Déploiement automatique sur GitHub Pages
```

## Données personnelles = variables d'environnement

Aucune donnée personnelle (email, téléphones, adresse, SIRET, endpoint de formulaire)
n'est écrite dans le code. Au build, `build.sh` génère `assets/js/config.js`
(gitignoré) à partir de variables d'environnement :

| Variable | Rôle |
|---|---|
| `SITE_NAME` | Nom du site (défaut : Perf IT) |
| `SITE_URL` | URL canonique |
| `CONTACT_EMAIL` | Email de contact |
| `CONTACT_ADDRESS` | Adresse postale (multiligne) |
| `CONTACT_PHONE_MAXIME` / `CONTACT_PHONE_MAXIME_RAW` | Tél. Maxime (affiché / lien `tel:`) |
| `CONTACT_PHONE_ROMAIN` / `CONTACT_PHONE_ROMAIN_RAW` | Tél. Romain (affiché / lien `tel:`) |
| `CONTACT_SIRET` | SIRET (mentions légales) |
| `FORM_ENDPOINT` | Endpoint JSON du formulaire de contact (ex. Formspree). Vide = repli `mailto:` |

En local : copiez `.env.example` en `.env`, renseignez, puis `./build.sh`.

## Tester en local

```bash
cp .env.example .env   # puis éditez .env (valeurs entre guillemets si espaces)
./build.sh             # décode .b64 + télécharge les photos (SHA-256) + génère config.js
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

## Déploiement sur GitHub Pages (automatique)

1. **Secrets** (Settings → Secrets and variables → Actions → *New repository secret*),
   avec les noms du tableau ci-dessus (`CONTACT_EMAIL`, `CONTACT_ADDRESS`, …) ;
   valeurs : celles affichées actuellement sur perfitcenter.fr (footer / page contact).
   Variables optionnelles (onglet *Variables*) : `SITE_NAME`, `SITE_URL`.
2. **Pages** : Settings → Pages → Build and deployment → Source : **GitHub Actions**.
3. Poussez sur `main` : le workflow `.github/workflows/pages.yml` décode les `.b64`,
   télécharge les photos épinglées, génère `config.js` depuis les secrets, puis publie le site.
4. **Domaine perso** : Settings → Pages → Custom domain → `perfitcenter.fr`
   (+ enregistrements CNAME/ALIAS chez votre registrar).

### Alternative : Cloudflare Pages

Importez ce dépôt dans Cloudflare Pages (build command : `./build.sh`, output : `/`)
et définissez les mêmes variables d'environnement dans les *Environment variables*
du projet (chiffrées côté Cloudflare).

## Formulaire de contact

Sans backend, le formulaire envoie en `fetch` vers `FORM_ENDPOINT`
(ex. [Formspree](https://formspree.io), [Web3Forms](https://web3forms.com) — une clé API suffit).
Si `FORM_ENDPOINT` est vide, le formulaire ouvrira un brouillon `mailto:`.

## Licence

Code source sous licence [MIT](LICENSE). Les contenus éditoriaux et photos restent
la propriété de Perf IT.

---
*Généré à partir de l'export WordPress REST API (wp-json) du site d'origine.*
