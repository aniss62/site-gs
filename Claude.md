# Les Greniers du Saïss — Site vitrine

Site B2B bilingue FR/EN. Stack: HTML/CSS/JS pur. Hébergement: Vercel (domaine lesgreniersdusaiss.ma), déploiement automatique à chaque push sur `main`. Vercel n'exécute pas PHP : le formulaire de contact n'a pas de serveur, il ouvre un e-mail `mailto:` pré-rempli vers Office@lesgreniersdusaiss.ma (`site/assets/js/contact.js`). Les fichiers `site/*.php` et `site/vendor/` sont obsolètes (accès bloqué par `vercel.json`).

## Structure
- `site/` → fichiers statiques publiés par Vercel (`outputDirectory`)
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
Hebdomadaire, sans cron hébergeur : `.github/workflows/update-news.yml` (cron GitHub Actions, lundi 6h UTC) lance `php site/fetch-news.php`, qui agrège les flux RSS et écrit `site/assets/data/news.json`. Les articles `pinned` restent en tête, les 6 RSS les plus récents s'ajoutent en dessous. Le commit du workflow sur `main` déclenche automatiquement un déploiement Vercel (intégration Git), donc le nouveau `news.json` est publié sans autre étape.
Token manuel (déclenchement ponctuel) : `https://domaine.ma/fetch-news.php?token=<FETCH_NEWS_TOKEN du .env>`
