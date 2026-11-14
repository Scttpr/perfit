# Perf IT — site statique

Site de **Perf IT**, centre de préparation physique à Péronnas (perfitcenter.fr) :
HTML + CSS + un petit JavaScript vanilla, sans framework, sans CMS, sans base de données.
Une page d'accueil à ancres (one-pager) et deux pages légales.

## Principes

- **Aucun cookie, aucun traceur, aucune ressource tierce au chargement** : police, images
  et scripts sont servis par le site. Pas de bandeau de consentement nécessaire.
- **Vidéos YouTube chargées au clic uniquement**, via `youtube-nocookie.com`.
- **Pas de formulaire** : le contact passe par un lien `mailto:` (et `tel:` si un téléphone
  est configuré) ; rien ne transite par le site.
- **CSP stricte** (balise `<meta>`) : pas de script ni de style en ligne. Toute mise en
  forme passe par `assets/css/style.css` — ne pas ajouter d'attribut `style="…"`.
- Clair/sombre automatique, navigation clavier, `prefers-reduced-motion` respecté.

La politique de confidentialité décrit exactement ce fonctionnement : si vous ajoutez un
outil de statistiques, un formulaire avec envoi serveur ou un contenu tiers, mettez-la à
jour (ainsi que la CSP).

## Structure

```
index.html                      One-pager : approche, accompagnements, formules, équipe, contact
mentions-legales/               Mentions légales
politique-de-confidentialite/   Politique de confidentialité
404.html                        Page d'erreur (chemins absolus : suppose un domaine servi à la racine)
le-concept/ sport-sante/ reathletisation/ preparation-physique/ contact/ blog/
                                Redirections (meta refresh) des anciennes URL vers l'accueil
assets/css/style.css            Feuille de style unique
assets/js/main.js               Coordonnées (config), menu mobile, vidéos au clic
assets/img/*.b64 + logo.svg     Favicons embarqués (base64) + logo
assets/img/manifest.tsv         Ressources téléchargées au build (URL + SHA-256 épinglé)
tools/fetch_images.py           Téléchargement vérifié, redimensionnement, JPEG + WebP
build.sh                        Décode les .b64, télécharge les ressources, génère config.js
.github/workflows/pages.yml     Déploiement automatique sur GitHub Pages
```

> Le dépôt reste 100 % texte : photos et police (Archivo, licence OFL) sont
> téléchargées au build d'après `manifest.tsv`, empreinte SHA-256 vérifiée.
> **Attention :** les photos sont encore tirées de l'ancien WordPress
> (`perfitcenter.fr/wp-content/…`). Le jour où le domaine pointe vers ce site statique,
> ces URL disparaissent et le build échoue : il faudra d'abord committer les images ou
> les héberger ailleurs, puis adapter le manifest.

## Coordonnées et mentions = variables d'environnement

Aucune coordonnée n'est écrite dans le code. `build.sh` génère `assets/js/config.js`
(gitignoré) ; `main.js` remplit les balises `data-cfg="…"` et retire les éléments
`data-cfg-if="…"` dont la valeur est vide.

| Variable | Rôle | Où la définir (GitHub) |
|---|---|---|
| `SITE_NAME` | Nom du site (défaut : Perf IT) | Variable |
| `SITE_URL` | URL canonique | Variable |
| `CONTACT_EMAIL` | E-mail de contact | **Secret** |
| `CONTACT_ADDRESS` | Adresse postale multiligne | **Secret** |
| `CONTACT_PHONE` | Téléphone (facultatif) | **Secret** |
| `LEGAL_NAME` | Raison sociale et forme juridique | Variable |
| `SIRET` | Numéro SIRET | Variable |
| `PUBLICATION_DIRECTOR` | Directeur de la publication | **Secret** |

`LEGAL_NAME`, `SIRET`, `CONTACT_ADDRESS` et `PUBLICATION_DIRECTOR` alimentent les mentions
légales obligatoires (LCEN, art. 6) : le build affiche un avertissement s'il en manque.

## Tester en local

```bash
cp .env.example .env   # puis éditez .env (valeurs entre guillemets si espaces)
./build.sh             # nécessite python3 + Pillow
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

## Déploiement sur GitHub Pages

1. Settings → Secrets and variables → Actions : créez les secrets et variables ci-dessus.
2. Settings → Pages → Build and deployment → Source : **GitHub Actions**.
3. Poussez sur `main` : le workflow exécute `build.sh` puis publie le site.
4. Domaine : Settings → Pages → Custom domain → `perfitcenter.fr`.

Si l'hébergeur change, mettez à jour la rubrique « Hébergeur » des mentions légales et le
point 1 de la politique de confidentialité.

## Licence

Code source sous licence [MIT](LICENSE). Les contenus éditoriaux et photos restent
la propriété de Perf IT.
