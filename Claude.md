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
Hebdomadaire, sans cron hébergeur : `.github/workflows/update-news.yml` (cron GitHub Actions, lundi 6h UTC) lance `php site/fetch-news.php`, qui agrège les flux RSS et écrit `site/assets/data/news.json`. Les articles `pinned` restent en tête, les 6 RSS les plus récents s'ajoutent en dessous. Le commit du workflow déclenche ensuite le déploiement FTP habituel (`.github/workflows/deploy.yml`), donc la mise à jour du repo publie automatiquement le nouveau `news.json` en ligne.
Token manuel (déclenchement ponctuel) : `https://domaine.ma/fetch-news.php?token=<FETCH_NEWS_TOKEN du .env>`
