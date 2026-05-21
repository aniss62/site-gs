# Les Greniers du Saïss — Site vitrine

Site B2B bilingue FR/EN. Stack: HTML/CSS/JS pur + PHP. Hébergement Maroc.

## Structure
- `site/` → fichiers à déployer chez l'hébergeur
- `blueprints/` → instructions workflow
- `equipment/` → scripts utilitaires
- `.env` → credentials SMTP (ne jamais commiter)

## Démarrage rapide
```bash
cd site && php -S localhost:8080
```

## Charte
- Bleu : #2B4BA0 | Or : #E8B84B
- Typo : Playfair Display + Inter

## i18n
Tous les textes dans `site/assets/i18n/fr.json` et `en.json`.
Attribut `data-i18n="nav.home"` sur chaque élément textuel.

## News automatiques
Cron hébergeur → `php fetch-news.php` toutes les 6h.
Token manuel : `https://domaine.ma/fetch-news.php?token=greniers2025`
