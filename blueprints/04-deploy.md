# Blueprint 04 — Déploiement chez l'hébergeur Maroc

## Prérequis hébergeur
- PHP >= 7.4
- Extension SimpleXML activée (pour fetch-news.php)
- Accès FTP ou panneau cPanel/Plesk
- Cron jobs disponibles

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
Via FTP ou le gestionnaire de fichiers cPanel, créer `/home/user/.env` (hors de public_html) et remplir les credentials SMTP.

Modifier `contact.php` pour pointer vers le bon chemin de `.env`.

### 4. Configurer le cron job (news automatiques)
Dans cPanel > Tâches Cron, ajouter :
```
0 */6 * * * php /home/user/public_html/fetch-news.php >> /home/user/.tmp/news-cron.log 2>&1
```
Cela met à jour les actualités toutes les 6 heures.

### 5. Tester
- Visiter le site via le domaine
- Tester le formulaire de contact (vérifier la réception email)
- Vérifier la page News (attendre le premier cron ou lancer manuellement)
- Tester le sélecteur de langue

### 6. Lancer fetch-news.php manuellement la première fois
Via SSH ou depuis le navigateur (si accès direct) :
```
https://votre-domaine.ma/fetch-news.php?token=VOTRE_TOKEN
```
(Un token de sécurité simple est inclus dans le script)
