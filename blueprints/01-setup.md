# Blueprint 01 — Initialisation du projet

## Objectif
Mettre en place l'environnement de développement local du site Les Greniers du Saïss.

## Prérequis
- PHP >= 7.4 (pour tester le formulaire et fetch-news.php localement)
- Node.js >= 18 (pour les scripts equipment)
- ImageMagick (pour optimize-images.sh)
- Un navigateur moderne

## Étapes

### 1. Cloner le dépôt
```bash
git clone <url-du-repo> greniers-du-saiss
cd greniers-du-saiss
```

### 2. Copier et remplir le fichier .env
```bash
cp .env.example .env
# Éditer .env avec vos identifiants SMTP réels
```

### 3. Lancer le serveur de développement
```bash
cd site
php -S localhost:8080
# Ouvrir http://localhost:8080 dans le navigateur
```

### 4. Tester les scripts equipment
```bash
# Optimisation images (requiert imagemagick)
bash equipment/optimize-images.sh

# Mise à jour news en local (requiert Node.js)
node equipment/fetch-news-local.js

# Validation des liens
bash equipment/validate-links.sh
```

## Résultat attendu
- Le site s'affiche sur http://localhost:8080
- La navbar est fonctionnelle (desktop + mobile)
- Le sélecteur FR/EN change la langue instantanément
- Le formulaire de contact répond avec un JSON success/error
