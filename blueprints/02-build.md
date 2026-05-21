# Blueprint 02 — Workflow de build

## Objectif
Préparer le site pour la mise en production (optimisation assets, validation, déploiement).

## Étapes dans l'ordre

### 1. Optimiser les images
```bash
bash equipment/optimize-images.sh
```
- Convertit et compresse toutes les images dans `site/assets/images/`
- Génère des versions WebP quand possible
- Output dans `.tmp/images-optimized/`

### 2. Valider les liens internes
```bash
bash equipment/validate-links.sh
```
- Vérifie que tous les `href` internes pointent vers des fichiers existants
- Affiche les liens cassés dans `.tmp/broken-links.txt`

### 3. Tester le site complet
```bash
cd site && php -S localhost:8080
```
- Naviguer sur toutes les pages
- Tester la bascule FR/EN
- Tester le formulaire de contact
- Tester l'affichage mobile (DevTools)

### 4. Tester la mise à jour des news
```bash
node equipment/fetch-news-local.js
# Vérifie que site/assets/data/news.json est mis à jour
```

### 5. Déployer (voir Blueprint 04)

## Structure du build final
```
site/           ← Dossier à uploader chez l'hébergeur
├── *.html
├── products/*.html
├── assets/
├── contact.php
└── fetch-news.php
```
