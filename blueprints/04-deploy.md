# Blueprint 04 — Déploiement chez l'hébergeur Maroc

## Prérequis hébergeur
- PHP >= 7.4
- Extension SimpleXML activée (pour fetch-news.php)
- Accès FTP ou panneau cPanel/Plesk
- Pas besoin de cron côté hébergeur : la mise à jour hebdomadaire des actualités tourne sur GitHub Actions (voir étape 4)

## Étapes de déploiement

### 1. Préparer le build
```bash
bash equipment/optimize-images.sh
bash equipment/validate-links.sh
```

### 2. Uploader via FTP
Uploader le contenu du dossier `site/` dans `public_html/` (ou le dossier racine du domaine).

Structure cible chez l'hébergeur :
```
public_html/
├── index.html
├── about.html
├── applications.html
├── durabilite.html
├── qualite.html
├── news.html
├── contact.html
├── contact.php
├── fetch-news.php
├── products/
└── assets/
```

### 3. Configurer le fichier .env sur le serveur
Le dépôt contient `.env.example` à la racine — le copier en `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Via FTP ou le gestionnaire de fichiers cPanel, déposer `.env` dans `/home/user/` (un niveau **au-dessus** de `public_html/`, hors webroot).

Variables obligatoires :
| Variable | Description |
|---|---|
| `SMTP_HOST` | Serveur SMTP de l'hébergeur |
| `SMTP_PORT` | `587` (STARTTLS) ou `465` (SSL) |
| `SMTP_USER` | Adresse email SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `SMTP_FROM` | Expéditeur des emails |
| `SMTP_TO` | Destinataire des formulaires |
| `FETCH_NEWS_TOKEN` | Token secret pour déclencher fetch-news.php |

> `FETCH_NEWS_TOKEN` : générer une chaîne aléatoire, ex. `openssl rand -hex 24`

### 4. Actualités : automatisation GitHub Actions (aucun cron hébergeur)
`.github/workflows/update-news.yml` tourne chaque lundi à 6h UTC : il exécute `php site/fetch-news.php`, puis committe `site/assets/data/news.json` si le contenu a changé. Ce commit déclenche ensuite `.github/workflows/deploy.yml`, qui republie automatiquement le site via FTP. Rien à configurer côté hébergeur — le repo GitHub doit juste avoir les secrets `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` déjà en place pour le déploiement standard.

Déclenchement manuel possible depuis l'onglet Actions du repo (`workflow_dispatch`) sans attendre le lundi.

### 5. Tester
- Visiter le site via le domaine
- Tester le formulaire de contact (vérifier la réception email)
- Vérifier la page News (lancer manuellement le workflow `update-news.yml`, ou attendre le prochain lundi)
- Tester le sélecteur de langue

### 6. Lancer fetch-news.php manuellement la première fois
Via SSH ou depuis le navigateur (si accès direct) :
```
https://votre-domaine.ma/fetch-news.php?token=VOTRE_TOKEN
```
(Un token de sécurité simple est inclus dans le script)
